import PraceConfiguration from '../Evaluator/PraceConfiguration';

/** Action wrapper with all the github logic **/
export default interface IGithubApi {
	/**
	 * Returns the config file from the repository. If it doesn't exist it throws an exception
	 * @param branch
	 */
	getConfig(branch: string): Promise<PraceConfiguration>;

	/**
	 * Sets the PR as failed with the given message
	 */
	reportFailed(message: string): void;
	log(message: string): void;
}
