import { PullRequestData } from '../PullRequestData';
import PraceConfiguration, { Pattern } from './PraceConfiguration';

export class ConventionFullEvaluator {
	constructor(
		private readonly prData: PullRequestData,
		private readonly praceConfig: PraceConfiguration
	) {
	}

	public runEvaluations(): CheckStatus {
		const evaluations = [this.evaluateTitle.bind(this), this.evaluateBody.bind(this),
			this.evaluateBranchName.bind(this), this.evaluateAdditions.bind(this),
			this.evaluateReviewers.bind(this), this.evaluateLabels.bind(this)];

		return this.runArrayOfEvaluations(evaluations);
	}

	private runArrayOfEvaluations(callback: (() => CheckStatus)[]) {
		for (const call of callback) {
			const result = call();
			if (!result.valid) {
				return result;
			}
		}
		return { valid: true };
	}

	public evaluateTitle(): CheckStatus {
		return this.evaluatePatternArray(this.praceConfig.title);
	}

	public evaluateBody(): CheckStatus {
		return this.evaluatePatternArray(this.praceConfig.body);
	}

	public evaluateBranchName(): CheckStatus {
		return this.evaluatePatternArray(this.praceConfig.branch);
	}

	public evaluateAdditions(): CheckStatus {
		if (this.prData.pull_request.additions > this.praceConfig.additions) {
			return {
				valid: false,
				errorMessage: `Exceeded additions limits. Maximium allowed additions are ${this.praceConfig.additions}`
			};
		}

		return { valid: true };
	}

	public evaluateReviewers(): CheckStatus {
		const reviewers = this.praceConfig.reviewer;

		if (!reviewers) {
			return { valid: true };
		}

		if (reviewers.minimum > 0 && reviewers.minimum < this.prData.pull_request.requested_reviewers.length) {
			return { valid: false, errorMessage: `You have to assign at least ${reviewers.minimum} reviewers` };
		}

		const users = reviewers.users;
		if (ConventionFullEvaluator.isArrayValidAndNotEmpty(users)) {
			const error: CheckStatus = {
				valid: false,
				errorMessage: `Must have, at least, one of the following users as reviewer: ${users.join(', ')}`
			};

			const prReviewersArray = this.prData.pull_request.requested_reviewers;
			if (!ConventionFullEvaluator.isArrayValidAndNotEmpty(prReviewersArray)) {
				return error;
			}

			const prReviewers = this.prData.pull_request.requested_reviewers.map(r => r.login);
			const containReviewer = prReviewers.some(prR => users.includes(prR));
			if (!containReviewer) {
				return error;
			}
		}

		if (ConventionFullEvaluator.isArrayValidAndNotEmpty(reviewers.teams)) {
			const error: CheckStatus = {
				valid: false,
				errorMessage: `Must have, at least, one of the following teams as reviwer: ${reviewers.teams.join(', ')}`
			};
			const prTeamsArray = this.prData.pull_request.requested_teams;
			if (!ConventionFullEvaluator.isArrayValidAndNotEmpty(prTeamsArray)) {
				return error;
			}

			const prTeamsSlugs = prTeamsArray.map(t => t.slug);
			const prTeamsNames = prTeamsArray.map(t => t.name);
			const teams = prTeamsSlugs.concat(prTeamsNames);
			if (!teams.some(t => reviewers.teams.includes(t))) {
				return error;
			}
		}

		return { valid: true };
	}

	public evaluateLabels(): CheckStatus {
		if (!ConventionFullEvaluator.isArrayValidAndNotEmpty(this.praceConfig.labels) ||
			!ConventionFullEvaluator.isArrayValidAndNotEmpty(this.prData.pull_request.labels)) {
			return { valid: true };
		}

		const labels = this.prData.pull_request.labels.map(l => l.name);

		if (!labels.some(label => this.praceConfig.labels.includes(label))) {
			return {
				valid: false,
				errorMessage: 'Must have, at least, one of the following labels' + this.praceConfig.labels.join(', ')
			};
		}

		return { valid: true };
	}

	private evaluatePatternArray(patternArray: Pattern[]): CheckStatus {
		if ((patternArray !== null || true) && patternArray.length > 0) {
			for (const pattern of patternArray) {
				const evaluation = this.evaluateAgainstPattern(this.prData.pull_request.title, pattern);
				if (!evaluation.valid) {
					return evaluation;
				}
			}
		}

		return { valid: true };
	}

	private evaluateAgainstPattern(valueToTest: string, pattern: Pattern): CheckStatus {
		const validRegex = this.isValidRegex(pattern.pattern);
		if (!validRegex.valid) {
			return {
				valid: false,
				errorMessage: `Expression ${pattern.pattern} is not a valid regex.\n${validRegex.errorMessage}`
			};
		}

		const regexp = new RegExp(pattern.pattern);

		if (regexp.test(valueToTest)) {
			return { valid: true };
		}

		return { valid: false, errorMessage: pattern.error };
	}

	public isValidRegex(expression: string): CheckStatus {
		if (expression === null || expression.length === 0) {
			return { valid: false };
		}

		try {
			const newRegex: RegExp = new RegExp(expression);

			return { valid: newRegex !== null };
		} catch (e) {
			return { valid: false, errorMessage: e.message };
		}
	}

	private static isArrayValidAndNotEmpty(array: any[]): boolean {
		return array && array.length > 0;
	}
}

interface CheckStatus {
	valid: boolean;
	errorMessage?: string;
}
