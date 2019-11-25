import { PraceConfig } from '../Evaluator/PraceConfiguration';

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

	log(message: string): void;
}
