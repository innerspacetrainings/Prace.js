import { context } from '@actions/github/lib/github';
import type { GitHub } from '../octokitTypes';
import * as core from '@actions/core';
import yaml from 'js-yaml';
import { PraceConfig } from '../Evaluator/PraceConfiguration';
import { IGithubApi, RepoInformation } from './IGithubApi';
import { CheckParameters } from './CheckParameters';
import { filterReviewers, Reviewer } from './Reviewer';
import { WebhookPayload } from '@actions/github/lib/interfaces';
import ILintingReport from './ILintingReport';
import { PullRequestReviewers } from '.';

export class GithubApi implements IGithubApi {
	private readonly pracePath: string = 'configuration-path';

	constructor(
		private readonly octokit: GitHub,
		private readonly reporter: ILintingReport
	) {}

	public getRepoInformation(): RepoInformation {
		const { owner, repo } = context.repo;

		return {
			owner,
			repo,
			branch: context.payload.pull_request!.head.sha
		};
	}

	public async setResult(check: CheckParameters): Promise<void> {
		await this.reporter.setCheck(check);
	}

	public async getReviewers(): Promise<Reviewer[]> {
		const { owner, repo } = context.repo;
		const response: PullRequestReviewers =
			await this.octokit.rest.pulls.listReviews({
				owner,
				repo,
				pull_number: context.payload.pull_request!.number
			});

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
			const response = await this.octokit.rest.repos.getContent({
				owner,
				repo,
				path: configPath,
				ref: branch
			});

			// data is T. It needs to be casted to the desired type
			const data = response.data as { content: string };

			return this.parseConfig(data.content);
		} catch (error) {
			if ((error as { status: number }).status === 404) {
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
		return (
			(yaml.safeLoad(
				Buffer.from(content, 'base64').toString()
			) as PraceConfig) || {}
		);
	}
}
