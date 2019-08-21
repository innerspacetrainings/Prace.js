import { IConfig, TemplateResult } from './Config';
import { evaluateTitle, PullRequestTitleAndRegex, TitleEvaluationResult, TitleResult } from './Utils';
import IGithubApi, { RepoInfo } from './Github/IGithubApi';
import GithubApi from './Github/GithubApi';
import { PullRequestData } from './PullRequestData';

/** Result of the check execution */
export enum CheckResult {
    NoValues = 'No values',
    HadError = 'Had error',
    CorrectTitle = 'Correct Title'
}

/** Github App Entry point. This class manage the logic of the system */
export class Prace {
    private readonly githubApi: IGithubApi;
    private readonly repoInfo: RepoInfo;

    /**
     * Builds the Prace app object. If data is null or closed, it returns a null object instead
     * @param pr Pull request data that should be in the body of the github app post.
     * @param config Config file with the application information and keys
     * @constructor
     */
    public static Build(pr: PullRequestData, config: IConfig): Prace | null {
        if (pr === null || pr.pull_request === null) return null;
        else if (pr.action === 'closed') {
            config.logger.log(`Ignoring action ${pr.action}`);
            return null;
        }

        return new Prace(pr, config);
    }

    private constructor(private readonly prData: PullRequestData, config: IConfig) {
        this.githubApi = new GithubApi(prData.installation.id, config);
        this.repoInfo = { repo: prData.repository.name, owner: prData.repository.full_name.split('/')[0] };
    }

    /**
     * Gets the request data.
     * @returns Object with the title of the pull request and the regular expresion.
     * Will be null if there is no configuration file in the project
     */
    public async getPullRequestData(): Promise<PullRequestTitleAndRegex | null> {
        const templateResult = await this.githubApi.getTemplateConvention(
            this.repoInfo,
            this.prData.pull_request.head.ref
        );

        if (templateResult.result === TemplateResult.Success && templateResult.regularExpression)
            return {
                title: this.prData.pull_request.title,
                regularExpression: templateResult.regularExpression
            };
        return null;
    }

    /**
     * Set the status of the check. Can be successful or incorrect with a example message
     * @param repoInfo Name and owner of the repo
     * @param result Type of result and example message for incorrect cases
     */
    public async SetCheckStatus(
        repoInfo: RepoInfo,
        pullRequestNumber: number,
        result: TitleEvaluationResult
    ): Promise<void> {
        await this.githubApi.setCheckStatus(repoInfo, pullRequestNumber, result);
    }

    /** Run automatic check to the pull request. Let Prace handle the config file and the result
     * @returns Enum with the kind of result that it had
     */
    public async executeCheck(): Promise<CheckResult> {
        const data = await this.getPullRequestData();
        if (data === null) {
            return CheckResult.NoValues;
        }

        const evaluation: TitleEvaluationResult = evaluateTitle(data);

        await this.githubApi.setCheckStatus(this.repoInfo, this.prData.number, evaluation);
        return evaluation.resultType === TitleResult.Correct ? CheckResult.CorrectTitle : CheckResult.HadError;
    }
}
