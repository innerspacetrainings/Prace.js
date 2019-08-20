export enum TemplateResult {
    Success = 'success',
    NoPraceFile = 'noPraceFile',
    InvalidFormat = 'invalidFormat',
    UnknownError = 'unknownError'
}

export interface TemplateFetchResult {
    regularExpression?: string;
    result: TemplateResult
}

/** Class in charge of fetching the content of the .prace file inside the repo. */
export interface IRequest {
    request(options: { uri: string, headers: any }): Promise<TemplateFetchResult>;
}

