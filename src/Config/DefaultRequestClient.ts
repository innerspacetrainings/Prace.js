import rp from 'request-promise';
import { ILogger } from '.';
import { IRequest, TemplateFetchResult, TemplateResult } from './IRequest';

export class DefaultRequestClient implements IRequest {
    public constructor(private readonly logger: ILogger){}

    public async request(options: { uri: string; headers: any }): Promise<TemplateFetchResult> {
        const response = await rp(options);

        if (typeof response === 'string') {
            // Clean end of file format
            const expression = response.replace(/^\s+|\s+$/g, '');
            return {regularExpression: expression, result: TemplateResult.Success};
        }
        this.logger.log(`Incorrect type: ${typeof response}`, response);
        return {result: TemplateResult.InvalidFormat};
    }
}
