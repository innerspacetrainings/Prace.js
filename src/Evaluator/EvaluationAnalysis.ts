export interface EvaluationAnalysis {
	title: CheckStatus;
	body: CheckStatus;
	branch: CheckStatus;
	reviewers: CheckStatus;
	additions: CheckStatus;
	labels: CheckStatus;
}

export interface CheckStatus {
	name: string;
	valid: boolean;
	errorMessage?: string;
}

export interface RegexResult {
	results: CheckStatus[];
}
