import {IConfig} from "../Config/IConfig";
import {GithubApi} from "./GithubApi";

class PraceApp {
    private readonly githubApi: IGithubApi;

    public static BuildPraceApp(reqBody: any, config: IConfig): PraceApp {
        const pr = reqBody as PullRequestData;

        if (pr === null || pr.pull_request === null)
            return null;
        else if (pr.action === "closed") {
            console.log(`Ignoring action ${pr.action}`);
            return null;
        }

        return new PraceApp(pr, config);
    }

    constructor(private readonly prData: PullRequestData, config: IConfig) {
        this.githubApi = new GithubApi(prData.installation.id, config);
    }

    public async GetPullRequestData(): Promise<{ prTitle: string, prExpression: string }> {
        const regexTemaplate = await this.githubApi.GetTemplateConvention(this.prData.repository.name, this.prData.repository.full_name.split('/')[0], this.prData.pull_request.head.ref);

        return {prTitle: this.prData.pull_request.title, prExpression: regexTemaplate};
    }

}

interface PullRequestData {
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
