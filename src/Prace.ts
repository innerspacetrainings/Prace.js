import { ConventionEvaluator } from './Evaluator/ConventionEvaluator';
import { PullRequestData } from './PullRequestData';
import { IGithubApi } from './Github/IGithubApi';
import { invalidExpression } from './Evaluator/ConventionErrors';
import { CheckParameters, Output } from './Github/CheckParameters';

export default class Prace {
	constructor(
		private readonly github: IGithubApi,
		private readonly pullRequest: PullRequestData
	) {
	}

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

		let statusCheck: CheckParameters;

		if (!results.failed) {
			statusCheck = this.generateSuccessCheckResult();
		} else {
			statusCheck = this.generateFailedCheckResult(results.generateReport());
		}

		await this.github.setResult(statusCheck);

		return !results.failed;
	}

	private static arrayJoinAsOxford(arr: string[], conjunction: string, ifEmpty: string) {
		const l = arr.length;
		if (!l) {
			return ifEmpty;
		}
		if (l < 2) {
			return arr[0];
		}
		if (l < 3) {
			return arr.join(` ${conjunction} `);
		}
		arr = arr.slice();
		arr[l - 1] = `${conjunction} ${arr[l - 1]}`;

		return arr.join(', ');
	}

	public generateFailedCheckResult(failed: Array<{ name: string; message: string }>): CheckParameters {
		const title: string = `Failed on ${failed.length} checks!`;
		const failedNames = failed.map(f => `\`${f.name}\``);
		const message: string = '### Linting failed\n' +
			`The following convention checks failed: ${Prace.arrayJoinAsOxford(failedNames, 'and', 'empty')}`;
		let body: string = `## Failed conventions\n`;
		for (const fail of failed) {
			body += `\n- \`${fail.name.toUpperCase()}\`: ${fail.message}`;
		}

		const output: Output = {
			title, summary: message, text: body
		};

		return this.generateStatusCheck(false, output);
	}

	public generateSuccessCheckResult(): CheckParameters {
		const output: Output = {
			title: 'No issues found',
			summary: 'Didn\'t found any issue while scanning the Pull Request'
		};

		return this.generateStatusCheck(true, output);
	}

	public generateStatusCheck(success: boolean, output: Output): CheckParameters {
		const { owner, repo, branch } = this.github.getRepoInformation();

		const checkName = 'Linting';

		const now = new Date().toISOString();

		const result: CheckParameters = {
			owner,
			repo,
			name: checkName,
			head_sha: branch,
			status: 'completed',
			started_at: now,
			completed_at: now,
			conclusion: success ? 'success' : 'failure',
			output
		};

		return result;
	}
}
