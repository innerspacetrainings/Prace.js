/** Interface with all the configurations for the project */
export default interface IConfig {
    /** ID given by github to define the App id */
    GitHubAppId: number;

    /** The App private key. This method is awaited, so the file can be loaded from an external source */
    GetParsedPrivateKey(): Promise<string>;
}
