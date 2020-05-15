import { context } from '@actions/github/lib/github';
import { GitHub } from '@actions/github';
import * as core from '@actions/core';
import yaml from 'js-yaml';
import { PraceConfig } from '../Evaluator/PraceConfiguration';
import { IGithubApi, RepoInformation } from './IGithubApi';
import { CheckParameters } from './CheckParameters';
import { filterReviewers, Reviewer } from './Reviewer';
import { PullsListReviewsResponse, Response } from '@octokit/rest';
import { WebhookPayload } from '@actions/github/lib/interfaces';

export class GithubApi implements IGithubApi {
	private readonly pracePath: string = 'configuration-path';

	constructor(private readonly octokit: GitHub) {
	}

	public getRepoInformation(): RepoInformation {
		const { owner, repo } = context.repo;

		return {
			owner,
			repo,
			branch: context.payload.pull_request!.head.sha
		};
	}

	public async setResult(check: CheckParameters): Promise<void> {
		const { owner, repo } = context.repo;
		const checks = await this.octokit.checks.listForRef({
			owner, repo,
			ref: context.payload.pull_request!.head.sha,
			check_name: check.name
		});

		const lastCheck = checks.data.check_runs[0];

		if (lastCheck) {
			const updatedCheckOutput = Object.assign(check, { check_run_id: lastCheck.id });
			await this.octokit.checks.update(updatedCheckOutput);
		} else {
			await this.octokit.checks.create(check);
		}
	}

	public async getReviewers(): Promise<Reviewer[]> {
		const { owner, repo } = context.repo;
		const response: Response<PullsListReviewsResponse> = await this.octokit.pulls.listReviews(
			{
				owner,
				repo,
				pull_number: context.payload.pull_request!.number
			}
		);

		return filterReviewers(
			response.data,
			context.payload as WebhookPayload
		);
	}

	public async getConfig(branch: string): Promise<PraceConfig> {
		const configPath: string = core.getInput(this.pracePath, {
			required: true
		});

		core.debug(`Found config path at: ${configPath}`);

		const { owner, repo } = context.repo;

		try {
			const response = await this.octokit.repos.getContents({
				owner,
				repo,
				path: configPath,
				ref: branch
			});

			// data is T. It needs to be casted to the desired type
			const data = response.data as { content: string };

			return this.parseConfig(data.content);
		} catch (error) {
			if (error.status === 404) {
				throw new Error('There is no configuration file!');
			}

			throw error;
		}
	}

	public log(message: string): void {
		core.debug(message);
	}

	public reportFailed(message: string): void {
		core.setFailed(message);
	}

	private parseConfig(content: string): PraceConfig {
		return yaml.safeLoad(Buffer.from(content, 'base64').toString()) || {};
	}
}
