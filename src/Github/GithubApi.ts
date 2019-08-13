import {App} from '@octokit/app';
import Octokit from "@octokit/rest";
import {IConfig} from '../Config/IConfig';
import rp from 'request-promise';

class GithubApi implements IGithubApi {
    private octokit: Octokit | null = null;
    private authorization: string = null;

    constructor(readonly installationId: number, readonly config: IConfig) {
    }

    async GetOctokit(): Promise<Octokit> {
        if (this.octokit !== null) return this.octokit;

        const ppk = this.config.GetParsedPrivateKey();

        const app = new App({id: this.config.GitHubAppId, privateKey: ppk});
        const installationAccessAccessToken = await app.getInstallationAccessToken({installationId: this.installationId});
        this.octokit = new Octokit({
            async auth() {
                try {
                    return `token ${installationAccessAccessToken}`;
                } catch (e) {
                    console.error(e);
                    return null;
                }
            }
        });

        this.authorization = `token ${installationAccessAccessToken}`;

        return this.octokit;
    }

    async GetTemplateConvention(repoName: string, repoOwner: string, branchName: string): Promise<string> | null {
        const octokit = await this.GetOctokit();
        try {
            const configFile = await octokit.repos.getContents({
                owner: repoOwner,
                repo: repoName,
                path: '.prace',
                ref: branchName
            });

            if (configFile === null || configFile.data === null) {
                console.log('No prace file found');
                return null;
            }

            const fileData = configFile.data as FileInformation;

            const options = {
                uri: fileData.url,
                headers: {
                    'Authorization': this.authorization,
                    "User-Agent": "prace",
                    'Accept': 'application/vnd.github.v3.raw'
                }
            };
            const response = await rp(options);

            if (response instanceof String) {
                return response as string;
            }
            console.log(`Incorrect type: ${typeof response}`, response)
        } catch (e) {
            console.error(e);
        }
        return null;
    }


    SetCheckStatus(repositoryId: number, pullRequestNumber: number, correctTitle: boolean, message?: string): Promise<string> {
        return undefined;
    }

    GetPullRequest(repositoryId: number, prNumber: number): Promise<string> | null {
        return undefined;
    }

}

interface FileInformation {
    type: string;
    url: string;
    download_url: string;
    sha: string;
    git_url: string;
}

export {GithubApi};