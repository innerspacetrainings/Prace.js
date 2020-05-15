import ILintingReport from './ILintingReport';
import { CheckParameters } from './CheckParameters';
import * as core from '@actions/core';

export default class CoreReporter implements ILintingReport {
	public setCheck(check: CheckParameters): Promise<void> {
		const { output, conclusion } = check;
		if (conclusion === 'success') {
			core.debug('Successfully evaluated PR and found no problems');
		} else {
			const message = `${output.title}\n - ${output.summary}\n -${output.text}`;
			core.setFailed(message);
		}

		return Promise.resolve();
	}
}
