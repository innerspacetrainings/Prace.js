import * as github from '@actions/github';
import * as core from '@actions/core';
import { context } from '@actions/github/lib/github';
import PraceAction from './Prace';
import { PullRequestData } from './PullRequestData';
import { GithubApi } from './Github/GithubApi';

/**
 * Execute the github action
 */
async function action() {
	try {
		const githubToken = process.env.GITHUB_TOKEN!;
		const octokit = new github.GitHub(githubToken);

		core.info('Starting Prace!');

		// Have to cast to unknown to then cast to the correct type
		const pullRequest: PullRequestData = (context.payload
			.pull_request as unknown) as PullRequestData;

		if (!pullRequest) {
			throw new Error(
				"Payload doesn't contain `pull_request`. " +
					'Make sure you followed the instructions to configure your repository ' +
					'(https://github.com/innerspacetrainings/Prace.js/blob/master/README.md).'
			);
		}

		const githubApi = new GithubApi(octokit);

		const prace = new PraceAction(githubApi, pullRequest);
		const result = await prace.execute();
		core.info(
			`Finished evaluating and found${result ? ' no ' : ' '}problems`
		);
	} catch (error) {
		if (process.env.NODE_ENV === 'test') {
			throw error;
		}

		core.error(error);
		core.setFailed(error.message);
	}
}

action();
