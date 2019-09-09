import { TitleEvaluationResult } from '../Utils';
import { TemplateFetchResult } from '../Config';

export default interface IGithubApi {
	/** Extract the content of the config file from the repo using octokit */
	getTemplateConvention(
		repoInfo: RepoInfo,
		branchName: string
	): Promise<TemplateFetchResult>;

	/** Set a status check for the assigned pull request number */
	setCheckStatus(
		repoInfo: RepoInfo,
		pullRequestNumber: number,
		result: TitleEvaluationResult
	): Promise<void>;
}

export interface RepoInfo {
	/** Repository name */
	repo: string;
	owner: string;
}
