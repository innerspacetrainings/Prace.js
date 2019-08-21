import { App } from '@octokit/app';
import Octokit, { ChecksCreateParamsOutput } from '@octokit/rest';
import { TitleEvaluationResult, TitleResult } from '../Utils';
import IGithubApi, { RepoInfo } from './IGithubApi';
import { IConfig, TemplateFetchResult, TemplateResult } from '../Config';

export class GithubApi implements IGithubApi {
    private octokit: Octokit | null = null;
    private authorization: string = '';

    constructor(readonly installationId: number, readonly config: IConfig) {}

    private async getOctokit(): Promise<Octokit> {
        if (this.octokit !== null) return this.octokit;

        const ppk = await this.config.getParsedPrivateKey();

        const app = new App({ id: this.config.gitHubAppId, privateKey: ppk });
        const installationAccessAccessToken = await app.getInstallationAccessToken({
            installationId: this.installationId
        });
        this.octokit = new Octokit({
            async auth() {
                return `token ${installationAccessAccessToken}`;
            }
        });

        this.authorization = `token ${installationAccessAccessToken}`;

        return this.octokit;
    }

    public async getTemplateConvention(repoInfo: RepoInfo, branchName: string): Promise<TemplateFetchResult> {
        const octokit = await this.getOctokit();
        const { owner, repo } = repoInfo;
        try {
            const configFile = await octokit.repos.getContents({
                owner,
                repo,
                path: '.prace',
                ref: branchName
            });

            if (configFile === null || configFile.data === null) {
                this.config.logger.log('No .prace file found');
                return { result: TemplateResult.NoPraceFile };
            }

            const fileData = configFile.data as FileInformation;

            const options = {
                uri: fileData.url,
                headers: {
                    Authorization: this.authorization,
                    'User-Agent': 'prace',
                    Accept: 'application/vnd.github.v3.raw'
                }
            };
            return await this.config.request.request(options);
        } catch (e) {
            this.config.logger.error(e);
        }
        return { result: TemplateResult.UnknownError };
    }

    public async setCheckStatus(
        repoInfo: RepoInfo,
        pullRequestNumber: number,
        result: TitleEvaluationResult
    ): Promise<void> {
        const octokit = await this.getOctokit();
        const { owner, repo } = repoInfo;

        const pullRequest = await octokit.pulls.get({ owner, repo, pull_number: pullRequestNumber });

        const checksCall = await octokit.checks.listForRef({
            owner,
            repo,
            ref: pullRequest.data.head.sha,
            check_name: this.config.checkName
        });
        const lastCheck = checksCall.data.check_runs.find(ch => ch.id === this.config.gitHubAppId);

        const checkOutput = this.generateCheckRunOutput(repoInfo, result, pullRequest.data);
        if (lastCheck) {
            await octokit.checks.update(Object.assign(checkOutput, { check_run_id: lastCheck.id }));
        } else {
            await octokit.checks.create(checkOutput);
        }
    }

    private generateCheckRunOutput(
        repoInfo: RepoInfo,
        result: TitleEvaluationResult,
        PR: Octokit.PullsGetResponse
    ): CheckParams {
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
                throw new Error('Invalid result type');
        }

        const { owner, repo } = repoInfo;

        const now = new Date();
        return {
            owner: owner,
            repo: repo,
            name: this.config.checkName,
            head_sha: PR.head.sha,
            status: 'completed',
            started_at: now.toISOString(),
            conclusion: result.resultType === TitleResult.Correct ? 'success' : 'failure',
            completed_at: now.toISOString(),
            output: { title, summary }
        };
    }
}

interface CheckParams {
    owner: string;
    repo: string;
    name: string;
    head_sha: string;
    details_url?: string;
    status?: 'queued' | 'in_progress' | 'completed';
    started_at?: string;
    conclusion?: 'success' | 'failure';
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
