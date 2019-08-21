import { ILogger, IRequest } from '.';

/** Interface with all the configurations for the project */
export interface IConfig {
    /** ID given by github to define the App id */
    gitHubAppId: number;
    /** Name of the status check. Appears on the status section of Github's Pull request */
    checkName: string;
    /** Logger to which the app send messages. */
    logger: ILogger;
    /** Class in charge of requesting the github api for the .prace file through a https call */
    request: IRequest;

    /** The App private key. This method is awaited, so the file can be loaded from an external source */
    getParsedPrivateKey(): Promise<string>;
}
