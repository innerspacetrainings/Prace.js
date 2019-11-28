import { PraceConfig } from '../Evaluator/PraceConfiguration';
import { CheckParameters } from './CheckParameters';

/** Action wrapper with all the github logic **/
export interface IGithubApi {
	/**
	 * Returns the config file from the repository. If it doesn't exist it throws an exception
	 * @param branch
	 */
	getConfig(branch: string): Promise<PraceConfig>;

	/**
	 * Sets the PR as failed with the given message
	 */
	reportFailed(message: string): void;

	setResult(check: CheckParameters): Promise<void>;

	log(message: string): void;

	getRepoInformation(): RepoInformation;
}

export interface RepoInformation {
	owner: string;
	repo: string;
	branch: string;
}
