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

	public constructor(
		public readonly title: CheckStatus,
		public readonly body: CheckStatus,
		public readonly branch: CheckStatus,
		public readonly labels: CheckStatus,
		public readonly reviewers: CheckStatus,
		public readonly additions: CheckStatus
	) {
		const results = [
			title.valid,
			body.valid,
			branch.valid,
			labels.valid,
			reviewers.valid,
			additions.valid
		];

		this.failed = results.some((valid) => !valid);
	}
}
