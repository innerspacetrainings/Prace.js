import { ConventionEvaluator } from './Evaluator/ConventionEvaluator';
import { PullRequestData } from './PullRequestData';
import GithubApi from './Github/GithubApi';

export default class Prace {
	constructor(
		private readonly github: GithubApi,
		private readonly pullRequest: PullRequestData
	) {}

	/**
	 * Run automatic check to the pull request
	 * @returns true if the PR didn't have any linting error
	 */
	public async execute(): Promise<boolean> {
		const branch: string = this.pullRequest.head.ref;
		const config = await this.github.getConfig(branch);

		const evaluator: ConventionEvaluator = new ConventionEvaluator(
			this.pullRequest,
			config
		);

		if (!evaluator.isRegexValid) {
			const invalids = evaluator.regexResult.results
				.map(({ errorMessage }) => errorMessage)
				.join(' - ');
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
