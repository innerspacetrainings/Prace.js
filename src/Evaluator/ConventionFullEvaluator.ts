import { PRData } from '../PullRequestData';
import PraceConfiguration, { Pattern } from './PraceConfiguration';
import { EvaluationResult } from './EvaluationResult';
import EvaluationAnalysis, { CheckStatus, PropertyCheck, RegexResult } from './EvaluationAnalysis';

export class ConventionFullEvaluator {
	public readonly isRegexValid: boolean;
	public readonly regexResult: RegexResult;

	constructor(
		private readonly prData: PRData,
		private readonly praceConfig: PraceConfiguration
	) {
		const filteredPatterns: Pattern[] = [
			praceConfig.title,
			praceConfig.body,
			praceConfig.branch
		].filter((p) => p !== undefined) as Pattern[];

		const regexEvaluation = this.evaluateRegex(filteredPatterns);
		this.regexResult = { results: regexEvaluation };
		this.isRegexValid = regexEvaluation.length === 0;
	}

	public runEvaluations(): EvaluationResult {
		if (!this.isRegexValid) {
			throw Error(
				"Regex is not valid. Check 'isRegexValid' before evaluating"
			);
		}

		const evaluation: EvaluationAnalysis = {
			title: this.evaluateTitle(),
			body: this.evaluateBody(),
			branch: this.evaluateBranchName(),
			additions: this.evaluateAdditions(),
			reviewers: this.evaluateReviewers(),
			labels: this.evaluateLabels()
		};

		return EvaluationResult.BuildFromAnalysis(evaluation);
	}

	public evaluateTitle(): PropertyCheck {
		return this.evaluateAgainstPattern("title",
			this.prData.title,
			this.praceConfig.title
		);
	}

	public evaluateBody(): PropertyCheck {
		return this.evaluateAgainstPattern("body",
			this.prData.body,
			this.praceConfig.body
		);
	}

	public evaluateBranchName(): PropertyCheck {
		return this.evaluateAgainstPattern("branch",
			this.prData.head.ref,
			this.praceConfig.branch
		);
	}

	public evaluateAdditions(): PropertyCheck {
		const name = "additions";
		if (
			this.praceConfig.additions !== undefined &&
			this.prData.additions > this.praceConfig.additions
		) {
			return {
				name,
				valid: false,
				errorMessage: `Exceeded additions limits. Maximum allowed additions are ${this.praceConfig.additions}`
			};
		}

		return { name, valid: true };
	}

	public evaluateReviewers(): PropertyCheck {
		const reviewers = this.praceConfig.reviewer;
		const name = "reviewers";

		if (!reviewers) {
			return {name, valid: true };
		}

		const { requested_reviewers, requested_teams } = this.prData;

		const requestedReviewers: number =
			this.getUnkownArrayLength(requested_reviewers) +
			this.getUnkownArrayLength(requested_teams);

		if (reviewers.minimum > 0 && reviewers.minimum > requestedReviewers) {
			return { name,
				valid: false,
				errorMessage: `You have to assign at least ${reviewers.minimum} reviewers`
			};
		}

		if (this.isArrayValidAndNotEmpty(reviewers.users)) {
			const users: string[] = reviewers.users as string[];

			const joinedUsers = users.join(', ');
			const error: PropertyCheck = {
				name,
				valid: false,
				errorMessage: `Must have, at least, one of the following users as reviewer: ${joinedUsers}`
			};

			if (!this.isArrayValidAndNotEmpty(requested_reviewers)) {
				return error;
			}

			const prReviewers = this.prData.requested_reviewers.map(
				(r) => r.login
			);
			const containReviewer = prReviewers.some((prR) =>
				users.includes(prR)
			);
			if (!containReviewer) {
				return error;
			}
		}

		if (this.isArrayValidAndNotEmpty(reviewers.teams)) {
			const requiredTeams: string[] = reviewers.teams as string[];

			const joinedTeams = requiredTeams.join(', ');
			const error: PropertyCheck = {
				name,
				valid: false,
				errorMessage: `Must have, at least, one of the following teams as reviewer: ${joinedTeams}`
			};
			if (!this.isArrayValidAndNotEmpty(requested_teams)) {
				return error;
			}

			const prTeamsSlugs = requested_teams.map((t) => t.slug);
			const prTeamsNames = requested_teams.map((t) => t.name);
			const teams = prTeamsSlugs.concat(prTeamsNames);
			if (!teams.some((t) => requiredTeams.includes(t))) {
				return error;
			}
		}

		return { name, valid: true };
	}

	public evaluateLabels(): PropertyCheck {
		const name = "label";
		if (!this.isArrayValidAndNotEmpty(this.praceConfig.labels)) {
			return { name,valid: true };
		}

		const requiredLabels: string[] = this.praceConfig.labels as string[];

		const errorMessage: string =
			'Must have, at least, one of the following labels ' +
			requiredLabels.join(', ');

		if (!this.isArrayValidAndNotEmpty(this.prData.labels)) {
			return {name, valid: false, errorMessage };
		}

		const labels = this.prData.labels.map((l) => l.name);

		if (!labels.some((label) => requiredLabels.includes(label))) {
			return { name,valid: false, errorMessage };
		}

		return {name,valid: true };
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

	private evaluateRegex(patterns: Pattern[]): CheckStatus[] {
		const invalidExpressions: CheckStatus[] = this.evaluateRegularExpressionFromPatterns(
			patterns
		);

		if (invalidExpressions.length > 0) {
			return invalidExpressions;
		}

		return [];
	}

	private evaluateRegularExpressionFromPatterns(
		patterns: Pattern[]
	): CheckStatus[] {
		const expressions: string[] = patterns
			.filter((p) => this.isArrayValidAndNotEmpty(p.patterns))
			.map((p) => p.patterns)
			.flat(1);

		return this.evaluateRegularExpressions(expressions);
	}

	private evaluateRegularExpressions(expressions: string[]): CheckStatus[] {
		const results: CheckStatus[] = [];

		// If there are no expressions, let's just ignore it
		if (!this.isArrayValidAndNotEmpty(expressions)) {
			return results;
		}

		for (const expression of expressions) {
			const validRegex = this.isValidRegex(expression);
			if (!validRegex.valid) {
				results.push(validRegex);
			}
		}

		return results;
	}

	private evaluateAgainstPattern(
		name: string,
		valueToTest: string,
		pattern?: Pattern
	): PropertyCheck {
		if (pattern === undefined) {
			return { name, valid: true };
		}

		if (valueToTest !== undefined) {
			for (const expression of pattern.patterns) {
				const regexp = new RegExp(expression);

				if (regexp.test(valueToTest)) {
					return { name, valid: true };
				}
			}
		}

		return { name, valid: false, errorMessage: pattern.error };
	}

	private isArrayValidAndNotEmpty(array: any[] | undefined): boolean {
		return array !== undefined && array.length > 0;
	}

	private getUnkownArrayLength(array: any[] | undefined) {
		return array !== undefined ? array.length : 0;
	}
}
