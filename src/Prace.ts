import { ConventionEvaluator } from './Evaluator/ConventionEvaluator';
import { PullRequestData } from './PullRequestData';
import IGithubApi from './Github/IGithubApi';

export default class Prace {
	constructor(
		private readonly github: IGithubApi,
		private readonly pullRequest: PullRequestData
	) {}

	/**
	 * Run automatic check to the pull request
	 * @param evaluator If we want to provide or mock one instead of the default
	 * @returns true if the PR didn't have any linting error
	 */
	public async execute(evaluator?: ConventionEvaluator): Promise<boolean> {
		const branch: string = this.pullRequest.head.ref;
		const config = await this.github.getConfig(branch);

		if (evaluator === undefined) {
			evaluator = new ConventionEvaluator(this.pullRequest, config);
		}

		if (!evaluator.isRegexValid) {
			const invalids = evaluator.regexResult.results
				.map(
					(result) =>
						`Expression ${result.name} is invalid: ${result.errorMessage}`
				)
				.join('\n');
			this.github.reportFailed(`Regex ${invalids} is invalid!`);

			return false;
		}

		const results = evaluator.runEvaluations();
		if (results.failed) {
			let failedMessage = 'Failed on the following cases\n';
			failedMessage += results
				.generateReport()
				.map((r) => `${r.name}: ${r.message}`)
				.join('\n');

			this.github.reportFailed(failedMessage);

			return false;
		}

		return true;
	}
}
