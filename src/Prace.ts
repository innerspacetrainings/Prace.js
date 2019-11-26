import { ConventionEvaluator } from './Evaluator/ConventionEvaluator';
import { PullRequestData } from './PullRequestData';
import { IGithubApi } from './Github/IGithubApi';
import { invalidExpression } from './Evaluator/ConventionErrors';

export default class Prace {
	constructor(
		private readonly github: IGithubApi,
		private readonly pullRequest: PullRequestData
	) {}

	/**
	 * Run convention checks on the pull request.
	 * @param evaluator Evaluator to override the default evaluator
	 * @returns true if the pull request complies with the configured conventions
	 */
	public async execute(evaluator?: ConventionEvaluator): Promise<boolean> {
		const branch: string = this.pullRequest.head.ref;
		const config = await this.github.getConfig(branch);

		if (evaluator === undefined) {
			evaluator = new ConventionEvaluator(this.pullRequest, config);
		}

		if (!evaluator.isRegexValid) {
			const invalids = evaluator.regexResult.results
				.map((result) =>
					invalidExpression(
						result.name,
						result.errorMessage as string
					)
				)
				.join('\n');
			this.github.reportFailed(`Regex ${invalids} is invalid!`);

			return false;
		}

		const results = evaluator.runEvaluations();
		if (results.failed) {
			let failedMessage = 'The following convention checks failed:\n';
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
