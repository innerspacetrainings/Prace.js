import { context } from '@actions/github/lib/github';
import { GitHub } from '@actions/github';
import * as core from '@actions/core';
import yaml from 'js-yaml';
import { PraceConfig } from '../Evaluator/PraceConfiguration';
import { IGithubApi } from './IGithubApi';

export class GithubApi implements IGithubApi {
	private readonly pracePath: string = 'configuration-path';

	constructor(private readonly octokit: GitHub) {
	}

	public async Test(): Promise<void> {
		const { owner, repo } = context.repo;

		// const pull = await this.octokit.pulls.get({
		// 	owner, repo, pull_number: context.payload.pull_request!.number});

		console.log('Got pull!');

		const result: CheckParams = {
			owner,
			repo,
			name: 'prace',
			head_sha: context.payload.pull_request!.head.sha,
			status: 'completed',
			started_at: new Date().toISOString(),
			conclusion: 'failure',
			completed_at: new Date().toISOString(),
			output: { title: 'Failed', summary: 'Because we say so' }
	}

		await this.octokit.checks.create(result);
		console.log('Made the system fail!');
	}

	public async getConfig(branch: string): Promise<PraceConfig> {
		const configPath: string = core.getInput(this.pracePath, {
			required: true
		});
		console.log('Found config path at: ' + configPath);
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

interface CheckParams {
	owner: string;
	repo: string;
	name: string;
	head_sha: string;
	details_url?: string;
	status?: 'queued' | 'in_progress' | 'completed';
	started_at?: string;
	conclusion?: 'success' | 'failure';
	completed_at?: string;
	output?: { title: string, summary: string };
}
