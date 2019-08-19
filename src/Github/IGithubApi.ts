import { TitleEvaluationResult } from '../Utils';

export default interface IGithubApi {
    /** Extract the content of the config file from the repo using octokit */
    GetTemplateConvention(repoInfo: RepoInfo, branchName: string): Promise<string | null>;

    /** Set a status check for the assigned pull request number */
    SetCheckStatus(repoInfo: RepoInfo, pullRequestNumber: number, result: TitleEvaluationResult): Promise<void>;
}

export interface RepoInfo {
    /** Repository name */
    repo: string;
    owner: string;
}
