interface IGithubApi {
    GetTemplateConvention(repoName: string, repoOwner: string, branchName: string): Promise<string>;

    SetCheckStatus(repositoryId: number, pullRequestNumber: number, correctTitle: boolean, message?: string): Promise<string>;

    GetPullRequest(repositoryId: number, prNumber: number): Promise<string> | null;
}

