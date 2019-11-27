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

	public async SetCheck(failed: Array<{ name: string; message: string }>): Promise<void> {
		const result = GithubApi.generateCheckResult(failed);
		await this.octokit.checks.create(result);
		console.log('Made the system fail!');
	}

	private static arrayJoinAsOxford(arr: string[], conjunction:string, ifEmpty:string){
		const l = arr.length;
		if (!l) return ifEmpty;
		if (l<2) return arr[0];
		if (l<3) return arr.join(` ${conjunction} `);
		arr = arr.slice();
		arr[l-1] = `${conjunction} ${arr[l-1]}`;

		return arr.join(', ');
	}

	public static generateCheckResult(failed: Array<{ name: string; message: string }>) : CheckParams{
		const { owner, repo } = context.repo;

		const checkName = 'Linting';

		const title:string = `Failed on ${failed.length} cases!`;
		const failedNames = failed.map(f => f.name);
		const message: string = '# Linting failed'+
			`Failed on ${this.arrayJoinAsOxford(failedNames, 'and', 'empty')}`;
		let body:string = `# Failed cases:\n`;
		for(const fail of failed){
			body += `\n- ${fail.name}: ${fail.message}`;
		}

		const result: CheckParams = {
			owner,
			repo,
			name: checkName,
			head_sha: context.payload.pull_request!.head.sha,
			status: 'completed',
			started_at: new Date().toISOString(),
			conclusion: 'failure',
			completed_at: new Date().toISOString(),
			output: { title, summary: message,
				text: body,
				images:[
					{image_url: "https://picsum.photos/500", alt: 'Random image'}
				]},
		};

		return result;
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
	output?: { title: string, summary: string, text?:string, annotations?:
			[{ path: string, start_line: number, end_line: number, annotation_level: 'notice' | 'warning' | 'failure', message: string, title?: string }];
	images?: [{ alt: string, image_url: string, caption?: string }] };


}
