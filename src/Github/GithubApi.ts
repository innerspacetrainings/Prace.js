import {App} from '@octokit/app';
import {IConfig} from '../Config/IConfig';

class GithubApi implements IGithubApi {
    private headers: AppHeaders | null = null;

    constructor(readonly installationId: number, readonly config: IConfig) {
    }

    async GetAppHeaders(): Promise<AppHeaders> {
        if (this.headers !== null) return this.headers;

        const ppk = this.config.GetParsedPrivateKey();

        const app = new App({id: this.config.GitHubAppId, privateKey: ppk});
        const jwt = app.getSignedJsonWebToken();

        const installationAccessAccessToken = await app.getInstallationAccessToken({installationId: this.installationId});

        this.headers = {
            authorization: `toekn ${installationAccessAccessToken}`,
            accept: "application/vnd.github.machine-man-preview+json"
        };

        return this.headers;
    }

    GetPullRequest(repositoryId: number, prNumber: number) {
    }

    GetTemplateConvention(repositoryId: number, branchName: string): Promise<string> {
        return undefined;
    }

    SetCheckStatus(repositoryId: number, pullRequestNumber: number, correctTitle: boolean, message?: string): Promise<string> {
        return undefined;
    }

}

interface AppHeaders {
    authorization: string;
    accept: string;
}