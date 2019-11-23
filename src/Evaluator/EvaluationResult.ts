import EvaluationAnalysis, {  PropertyCheck } from './EvaluationAnalysis';

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
	public readonly failedStatus: PropertyCheck[];

	public constructor(
		public readonly title: PropertyCheck,
		public readonly body: PropertyCheck,
		public readonly branch: PropertyCheck,
		public readonly labels: PropertyCheck,
		public readonly reviewers: PropertyCheck,
		public readonly additions: PropertyCheck
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

	public generateReport(): Array<{ name: string, message: string }> {
		const report: { name: string, message: string }[] = [];
		for (let check of this.failedStatus) {
			report.push({ name: check.name, message: check.errorMessage! });
		}

		return report;
	}
}
