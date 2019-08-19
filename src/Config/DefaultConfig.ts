import IConfig from './IConfig';
import ILogger from './ILogger';

/** Default config which extracts it's values from env */
export default class DefaultConfig implements IConfig {
    CheckName: string = 'PRACE';
    GitHubAppId: number;
    logger: ILogger;
    private readonly privateKey: string;

    /**
     * Default config. Values can be send here if you don't wish to create your own object
     * @param appId Id from the Github App. If undefined it will be obtained from the env `GITHUB_APP_ID`
     * @param privateKey Content of the private key. If undefined it will obtained from the env `GITHUB_PRIVATE_KEY`
     * @param logger Logger to which the app send messages. If it's undefined **the console will be used by default**
     */
    public constructor(appId?: number, privateKey?: string, logger?: ILogger) {
        this.GitHubAppId = appId ? appId : Number(process.env.GITHUB_APP_ID);
        this.logger = logger ? logger : console;
        const key = privateKey ? privateKey : process.env.GITHUB_PRIVATE_KEY;
        if (key === undefined) throw TypeError('private key can not be undefined!');
        this.privateKey = key;
    }

    GetParsedPrivateKey(): Promise<string> {
        return Promise.resolve(this.privateKey);
    }
}
