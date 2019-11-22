import * as core from '@actions/core';
import * as github from '@actions/github';
import { context, GitHub } from '@actions/github/lib/github';
import getConfig from './actionUtils';
import { ConventionFullEvaluator } from './Evaluator/ConventionFullEvaluator';
import { PRData, PullRequestData } from './PullRequestData';

async function action() {
	const githubToken = process.env.GITHUB_TOKEN!;
	const octokit = new github.GitHub(githubToken);
	const configPath = core.getInput('prace-file', { required: true });

	const pullRequest : PRData = context.payload.pull_request as PRData;

	if (!pullRequest) {
		throw new Error(
			'Payload doesn\'t contain `pull_request`.' +
			'Make sure this Action is being triggered by a pull_request event ' +
			'(https://help.github.com/en/articles/events-that-trigger-workflows#pull-request-event-pull_request).'
		);
	}

	const ref: string = pullRequest.head.ref;
	const config = await getConfig(octokit, configPath, context.repo, ref);

	const evaluator:ConventionFullEvaluator = new ConventionFullEvaluator(pullRequest, config);
	if( !evaluator.isRegexValid){
		const invalids = evaluator.regexResult.results.map(({errorMessage}) => errorMessage).join(" - ");
		core.setFailed(`Regex ${invalids} is invalid!`);

		return;
	}

	const results = evaluator.runEvaluations();
	if(results.failed){
		const failedMessage = "Failed on the following cases";
	}
}


