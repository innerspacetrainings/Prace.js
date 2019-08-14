import {TitleEvaluationResult} from "../Utils";

interface IGithubApi {
    GetTemplateConvention(repoInfo: RepoInfo, branchName: string): Promise<string | null>;

    SetCheckStatus(repoInfo: RepoInfo, pullRequestNumber: number, result: TitleEvaluationResult): Promise<void>;
}

export interface RepoInfo {
    repo: string;
    owner: string;
}

export default IGithubApi

