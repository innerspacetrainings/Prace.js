import EvaluationAnalysis, { CheckStatus } from './EvaluationAnalysis';

export class EvaluationResult implements EvaluationAnalysis {
	public static BuildFromAnalysis(
		analysis: EvaluationAnalysis
	): EvaluationResult {
		return new EvaluationResult(
			analysis.title,
			analysis.body,
			analysis.branch,
			analysis.labels,
			analysis.reviewers,
			analysis.additions
		);
	}
	public readonly failed: boolean;
	public readonly failedStatus : {check: string, error: string};

	public constructor(
		public readonly title: CheckStatus,
		public readonly body: CheckStatus,
		public readonly branch: CheckStatus,
		public readonly labels: CheckStatus,
		public readonly reviewers: CheckStatus,
		public readonly additions: CheckStatus
	) {
		const results = [
			title,
			body,
			branch,
			labels,
			reviewers,
			additions
		];

		this.failedStatus = results.filter(r => !r.valid);

		this.failed = this.failedStatus.length > 0;
	}
}
