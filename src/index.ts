import * as github from '@actions/github';
import * as core from '@actions/core';
import { context } from '@actions/github/lib/github';
import GithubApi from './Github/GithubApi';
import PraceAction from './Prace';
import { PullRequestData } from './PullRequestData';

/**
 * Execute the github action
 */
async function action() {
	try {
		const githubToken = process.env.GITHUB_TOKEN!;
		const octokit = new github.GitHub(githubToken);

		// Have to cast to unknown to then cast to the correct type
		const pullRequest: PullRequestData = (context.payload
			.pull_request as unknown) as PullRequestData;

		if (!pullRequest) {
			throw new Error(
				"Payload doesn't contain `pull_request`. " +
					'Make sure this Action is being triggered by a pull_request event ' +
					'(https://help.github.com/en/articles/events-that-trigger-workflows#pull-request-event-pull_request).'
			);
		}

		const githubApi = new GithubApi(octokit);

		const prace = new PraceAction(githubApi, pullRequest);
		await prace.execute();
	} catch (error) {
		if (process.env.NODE_ENV === 'test') {
			throw error;
		}

		core.error(error);
		core.setFailed(error.message);
	}
}

action();
