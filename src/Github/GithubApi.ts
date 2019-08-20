import {App} from '@octokit/app';
import Octokit, {
    ChecksCreateParamsOutput,
    ChecksCreateParamsOutputAnnotations,
    ChecksCreateParamsOutputImages
} from "@octokit/rest";
import {IConfig} from '../Config/IConfig';
import rp from 'request-promise';
import {TitleEvaluationResult, TitleResult} from "../Prace";
import IGithubApi, {RepoInfo} from "./IGithubApi";

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

   public async GetTemplateConvention(repoInfo: RepoInfo, branchName: string): Promise<string> | null {
        const octokit = await this.GetOctokit();
        const {owner, repo} = repoInfo;
        try {
            const configFile = await octokit.repos.getContents({
                owner,
                repo,
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


    async SetCheckStatus(repoInfo: RepoInfo, pullRequestNumber: number, result: TitleEvaluationResult): Promise<void> {
        const octokit = await this.GetOctokit();
        const {owner, repo} = repoInfo;

        const pullRequest = await octokit.pulls.get({owner, repo, pull_number: pullRequestNumber});


        const checkGet = await octokit.checks.get({owner, repo, check_run_id: this.config.GitHubAppId});
        let check: { id: number };
        const checkOutput = GithubApi.GenerateCheckRunOutput(repoInfo, result, pullRequest.data);
        if (checkGet.data) {
            check = checkGet.data;
            await octokit.checks.update(Object.assign(checkOutput, {check_run_id: check.id}));
        } else {
            await octokit.checks.create(checkOutput);
        }
    }

    private static GenerateCheckRunOutput(repoInfo: RepoInfo, result: TitleEvaluationResult, PR: Octokit.PullsGetResponse): CheckParams {
        let title: string, summary: string;
        switch (result.resultType) {
            case TitleResult.Correct:
                title = 'Correct title';
                summary = 'PR Title fills the correct required conventions.';
                break;
            case TitleResult.Invalid:
                title = 'Incorrect title';
                summary = `Title has incorrect form. Be sure to keep the required conventions\n${result.exampleMessage}`;
                break;
            case TitleResult.InvalidRegex:
                title = 'Invalid regex';
                summary = 'Configuration file is invalid. Be sure to set the correct config file.';
                break;
            default:
                throw new Error('Invalid result type')
        }

        const {owner, repo} = repoInfo;

        const now = new Date();
        return {
            owner: owner,
            repo: repo,
            name: "PRACE",
            head_sha: PR.head.sha,
            status: "completed",
            started_at: now.toISOString(),
            conclusion: result.resultType === TitleResult.Correct ? 'success' : "failure",
            completed_at: now.toISOString(),
            output: {title, summary}
        };
    }
}

interface CheckParams {
    owner: string;
    repo: string;
    name: string;
    head_sha: string;
    details_url?: string;
    status?: "queued" | "in_progress" | "completed";
    started_at?: string;
    conclusion?:
        | "success"
        | "failure";
    completed_at?: string;
    output?: ChecksCreateParamsOutput;
}

interface FileInformation {
    type: string;
    url: string;
    download_url: string;
    sha: string;
    git_url: string;
}

export default GithubApi;