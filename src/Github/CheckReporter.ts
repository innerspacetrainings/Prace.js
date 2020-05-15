import ILintingReport from './ILintingReport';
import { CheckParameters } from './CheckParameters';
import { context } from '@actions/github/lib/github';
import { GitHub } from '@actions/github';

export default class CheckReporter implements ILintingReport {
	public constructor(private readonly octokit: GitHub) {}

	public async setCheck(check: CheckParameters): Promise<void> {
		const { owner, repo } = context.repo;
		const checks = await this.octokit.checks.listForRef({
			owner,
			repo,
			ref: context.payload.pull_request!.head.sha,
			check_name: check.name
		});

		const lastCheck = checks.data.check_runs[0];

		if (lastCheck) {
			const updatedCheckOutput = Object.assign(check, {
				check_run_id: lastCheck.id
			});
			await this.octokit.checks.update(updatedCheckOutput);
		} else {
			await this.octokit.checks.create(check);
		}
	}
}
