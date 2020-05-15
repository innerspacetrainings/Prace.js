import { CheckParameters } from './CheckParameters';

export default interface ILintingReport {
	setCheck(check: CheckParameters): Promise<void>;
}
