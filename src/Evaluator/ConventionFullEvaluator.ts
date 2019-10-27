import { PullRequestData } from '../PullRequestData';
import PraceConfiguration, { Pattern } from './PraceConfiguration';

export class ConventionFullEvaluator {
	public readonly isRegexValid: boolean;
	public readonly regexResult: RegexResult;

	constructor(
		private readonly prData: PullRequestData,
		private readonly praceConfig: PraceConfiguration
	) {
		const filteredPatterns: Pattern[] = [praceConfig.title, praceConfig.body, praceConfig.branch]
			.filter(p => p !== undefined) as Pattern[];

		const regexEvaluation = this.evaluateRegex(filteredPatterns);
		this.regexResult = { results: regexEvaluation };
		this.isRegexValid = regexEvaluation.length === 0;
	}

	private evaluateRegex(patterns: Pattern[]): CheckStatus[] {
		const invalidExpressions: CheckStatus[] = this.evaluateRegularExpressionFromPatterns(patterns);

		if (invalidExpressions.length > 0) {
			return invalidExpressions;
		}

		return [];
	}

	public runEvaluations(): CheckResult {
		if (!this.isRegexValid) {
			throw Error('Regex is not valid. Check \'isRegexValid\' before evaluating');
		}

		const evaluation: CheckResult = {
			title: this.evaluateTitle(),
			body: this.evaluateBody(),
			branch: this.evaluateBranchName(),
			additions: this.evaluateAdditions(),
			reviewers: this.evaluateReviewers(),
			labels: this.evaluateLabels()
		};

		return evaluation;
	}

	private evaluateRegularExpressionFromPatterns(patterns: Pattern[]): CheckStatus[] {
		const expressions: string[] = patterns.filter(p => this.isArrayValidAndNotEmpty(p.patterns))
			.map(p => p.patterns).flat(1);

		return this.evaluateRegularExpressions(expressions);
	}

	public evaluateTitle(): CheckStatus {
		return this.evaluateAgainstPattern(this.prData.pull_request.title, this.praceConfig.title);
	}

	public evaluateBody(): CheckStatus {
		return this.evaluateAgainstPattern(this.prData.pull_request.body, this.praceConfig.body);
	}

	public evaluateBranchName(): CheckStatus {
		return this.evaluateAgainstPattern(this.prData.pull_request.head.ref, this.praceConfig.branch);
	}

	public evaluateAdditions(): CheckStatus {
		if (this.praceConfig.additions !== undefined &&
			this.prData.pull_request.additions > this.praceConfig.additions) {
			return {
				valid: false,
				errorMessage: `Exceeded additions limits. Maximum allowed additions are ${this.praceConfig.additions}`
			};
		}

		return { valid: true };
	}

	public evaluateReviewers(): CheckStatus {
		const reviewers = this.praceConfig.reviewer;

		if (!reviewers) {
			return { valid: true };
		}

		const pullRequest = this.prData.pull_request;
		const { requested_reviewers, requested_teams } = pullRequest;

		const requestedReviewers: number = this.getUnkownArrayLength(requested_reviewers) + this.getUnkownArrayLength(requested_teams);

		if (reviewers.minimum > 0 && reviewers.minimum > requestedReviewers) {
			return { valid: false, errorMessage: `You have to assign at least ${reviewers.minimum} reviewers` };
		}

		if (this.isArrayValidAndNotEmpty(reviewers.users)) {
			const users: string[] = reviewers.users as string[];
			const error: CheckStatus = {
				valid: false,
				errorMessage: `Must have, at least, one of the following users as reviewer: ${users.join(', ')}`
			};

			if (!this.isArrayValidAndNotEmpty(requested_reviewers)) {
				return error;
			}

			const prReviewers = this.prData.pull_request.requested_reviewers.map(r => r.login);
			const containReviewer = prReviewers.some(prR => users.includes(prR));
			if (!containReviewer) {
				return error;
			}
		}

		if (this.isArrayValidAndNotEmpty(reviewers.teams)) {
			const requiredTeams: string[] = reviewers.teams as string[];
			const error: CheckStatus = {
				valid: false,
				errorMessage: `Must have, at least, one of the following teams as reviewer: ${requiredTeams.join(', ')}`
			};
			if (!this.isArrayValidAndNotEmpty(requested_teams)) {
				return error;
			}

			const prTeamsSlugs = requested_teams.map(t => t.slug);
			const prTeamsNames = requested_teams.map(t => t.name);
			const teams = prTeamsSlugs.concat(prTeamsNames);
			if (!teams.some(t => requiredTeams.includes(t))) {
				return error;
			}
		}

		return { valid: true };
	}

	public evaluateLabels(): CheckStatus {
		if (!this.isArrayValidAndNotEmpty(this.praceConfig.labels)) {
			return { valid: true };
		}

		const requiredLabels: string[] = this.praceConfig.labels as string[];

		const errorMessage: string = 'Must have, at least, one of the following labels ' + requiredLabels.join(', ');

		if (!this.isArrayValidAndNotEmpty(this.prData.pull_request.labels)) {
			return { valid: false, errorMessage };
		}

		const labels = this.prData.pull_request.labels.map(l => l.name);

		if (!labels.some(label => requiredLabels.includes(label))) {
			return { valid: false, errorMessage };
		}

		return { valid: true };
	}

	private evaluateRegularExpressions(expressions: string[]): CheckStatus[] {
		const results: CheckStatus[] = [];

		// If there are no expressions, let's just ignore it
		if (!this.isArrayValidAndNotEmpty(expressions)) {
			return results;
		}


		for (const expression in expressions) {
			const validRegex = this.isValidRegex(expression);
			if (!validRegex.valid) {
				results.push(validRegex);
			}
		}

		return results;
	}

	private evaluateAgainstPattern(valueToTest: string, pattern?: Pattern): CheckStatus {
		if (pattern === undefined) {
			return { valid: true };
		}

		if (valueToTest !== undefined) {
			for (const expression of pattern.patterns) {
				const regexp = new RegExp(expression);

				if (regexp.test(valueToTest)) {
					return { valid: true };
				}
			}
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

	private isArrayValidAndNotEmpty(array: any[] | undefined): boolean {
		return array !== undefined && array.length > 0;
	}

	private getUnkownArrayLength(array: any[] | undefined) {
		return array !== undefined ? array.length : 0;
	}
}

interface CheckStatus {
	valid: boolean;
	errorMessage?: string;
}

interface CheckResult {
	title: CheckStatus;
	body: CheckStatus;
	branch: CheckStatus;
	reviewers: CheckStatus;
	additions: CheckStatus;
	labels: CheckStatus;
}

interface RegexResult {
	results: CheckStatus[];
}
