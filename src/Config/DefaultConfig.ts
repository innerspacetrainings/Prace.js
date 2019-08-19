import IConfig from "./IConfig";

/** Default config which extracts it's values from env */
export default class DefaultConfig implements IConfig {
    CheckName: string = "PRACE";
    GitHubAppId: number;
    private readonly privateKey: string;

    public constructor(appId?: number, privateKey?: string) {
        this.GitHubAppId = appId ? appId : Number(process.env.GITHUB_APP_ID);
        const key = privateKey ? privateKey : process.env.GITHUB_PRIVATE_KEY;
        if (key === undefined)
            throw TypeError("private key can not be undefined!");
        this.privateKey = key;
    }

    GetParsedPrivateKey(): Promise<string> {
        return Promise.resolve(this.privateKey);
    }
}
