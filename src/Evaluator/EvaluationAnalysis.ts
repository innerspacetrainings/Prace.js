export default interface EvaluationAnalysis {
	title: PropertyCheck;
	body: PropertyCheck;
	branch: PropertyCheck;
	reviewers: PropertyCheck;
	additions: PropertyCheck;
	labels: PropertyCheck;
}

export interface CheckStatus {
	valid: boolean;
	errorMessage?: string;
}

export interface PropertyCheck extends CheckStatus {
	name: string;
}

export interface RegexResult {
	results: CheckStatus[];
}
