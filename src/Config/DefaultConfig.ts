import { DefaultRequestClient, IConfig, ILogger, IRequest } from '.';

/** Default config which extracts it's values from env */
export class DefaultConfig implements IConfig {
    public readonly checkName: string = 'PRACE';
    public readonly gitHubAppId: number;
    public readonly logger: ILogger;
    public readonly request: IRequest;
    private readonly privateKey: string;

    /**
     * Default config. Values can be set here if you don't wish to create your own implementation
     * for the request object, `DefaultRequestClient` will be used
     * @param appId Id from the Github App. If undefined it will be obtained from the env `GITHUB_APP_ID`
     * @param privateKey Content of the private key. If undefined it will obtained from the env `GITHUB_PRIVATE_KEY`
     * @param logger Logger to which the app send messages. If it's undefined **the console will be used by default**
     */
    public constructor(appId?: number, privateKey?: string, logger?: ILogger) {
        this.gitHubAppId = appId ? appId : Number(process.env.GITHUB_APP_ID);
        this.logger = logger ? logger : console;
        const key = privateKey ? privateKey : process.env.GITHUB_PRIVATE_KEY;
        if (isNaN(this.gitHubAppId) || this.gitHubAppId <= 0) {
            throw TypeError('Github app id must have a valid number!');
        } else if (key === undefined) {
            throw TypeError('private key can not be undefined!');
        }
        this.privateKey = key;
        this.request = new DefaultRequestClient(this.logger);
    }

    getParsedPrivateKey(): Promise<string> {
        return Promise.resolve(this.privateKey);
    }
}
