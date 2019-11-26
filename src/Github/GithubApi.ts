import { context } from '@actions/github/lib/github';
import { GitHub } from '@actions/github';
import * as core from '@actions/core';
import yaml from 'js-yaml';
import { PraceConfig } from '../Evaluator/PraceConfiguration';
import { IGithubApi } from './IGithubApi';

export class GithubApi implements IGithubApi {
	private readonly pracePath: string = 'prace-file';

	constructor(private readonly octokit: GitHub) {}

	public async getConfig(branch: string): Promise<PraceConfig> {
		const configPath: string = core.getInput(this.pracePath, {
			required: true
		});
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
