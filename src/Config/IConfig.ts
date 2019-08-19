import ILogger from './ILogger';

/** Interface with all the configurations for the project */
export default interface IConfig {
    /** ID given by github to define the App id */
    GitHubAppId: number;
    /** Name of the status check. Appears on the status section of Github's Pull request */
    CheckName: string;
    /** Logger to which the app send messages. */
    logger: ILogger;

    /** The App private key. This method is awaited, so the file can be loaded from an external source */
    GetParsedPrivateKey(): Promise<string>;
}
