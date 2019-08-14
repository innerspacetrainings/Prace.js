import {IConfig} from "./Config/IConfig";
import EvaluateTitle, {TitleEvaluationResult, TitleResult} from "./Prace";
import IGithubApi, {RepoInfo} from "./Github/IGithubApi";
import GithubApi from "./Github/GithubApi";

class PraceApp {
    private readonly githubApi: IGithubApi;
    private readonly repoInfo: RepoInfo;

    public static Build(pr: PullRequestData, config: IConfig): PraceApp {
        if (pr === null || pr.pull_request === null)
            return null;
        else if (pr.action === "closed") {
            console.log(`Ignoring action ${pr.action}`);
            return null;
        }

        return new PraceApp(pr, config);
    }

    private constructor(private readonly prData: PullRequestData, config: IConfig) {
        this.githubApi = new GithubApi(prData.installation.id, config);
        this.repoInfo = {repo: prData.repository.name, owner: prData.repository.full_name.split('/')[0]};
    }

    public async GetPullRequestData(): Promise<{ prTitle: string, prExpression: string }> {
        const regexTemplate = await this.githubApi.GetTemplateConvention(this.repoInfo, this.prData.pull_request.head.ref);

        return {prTitle: this.prData.pull_request.title, prExpression: regexTemplate};
    }

    public async ExecuteCheck(): Promise<CheckResult> {
        const data = await this.GetPullRequestData();
        if (!data.prTitle || !data.prExpression) {
            return CheckResult.NoValues;
        }

        const evaluation: TitleEvaluationResult = EvaluateTitle(data);

        await this.githubApi.SetCheckStatus(this.repoInfo, this.prData.number, evaluation);
        return evaluation.resultType === TitleResult.Correct ? CheckResult.CorrectTitle : CheckResult.HadError;
    }
}

export enum CheckResult {
    NoValues,
    HadError,
    CorrectTitle
}

export interface PullRequestData {
    action: string;
    number: number;
    pull_request: {
        title: string,
        head: {
            label: string;
            ref: string;
        }
    }
    repository: {
        id: number;
        name: string;
        full_name: string;
    }
    installation: {
        id: number;
    }
}

export {PraceApp};
