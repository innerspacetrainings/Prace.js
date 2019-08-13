interface IGithubApi {
    GetTemplateConvention(repositoryId: number, branchName: string): Promise<string>;

    SetCheckStatus(repositoryId: number, pullRequestNumber: number, correctTitle: boolean, message?: string): Promise<string>;

    GetPullRequest(repositoryId: number, prNumber: number);
}

