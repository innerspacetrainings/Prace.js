import ConventionEvaluator from "./ConventionEvaluator";

/** Result and example message for incorrect results */
export interface TitleEvaluationResult {
    resultType: TitleResult;
    exampleMessage?: string;
}

export enum TitleResult {
    Correct= "correct",
    Invalid = "invalid",
    InvalidRegex = "invalidRegex"
}

export interface PullRequestTitleAndRegex {
    title: string;
    regularExpression: string;
}

/**
 * Parse the regex and the title and check if the title complies with the regex.
 * @param result Title and regex expression.
 */
export default function EvaluateTitle(result: PullRequestTitleAndRegex): TitleEvaluationResult {
    const {title, regularExpression} = result;
    const evaluator = new ConventionEvaluator(title, regularExpression);

    if (!evaluator.IsValidRegex()) {
        return {resultType: TitleResult.InvalidRegex, exampleMessage: 'Invalid Regex'};
    } else if (evaluator.TitleMatches()) {
        return {resultType: TitleResult.Correct};
    }

    const ticketInformation = evaluator.GetTicketInformation();
    if (ticketInformation) {
        const {ticketKey, ticketNumber} = ticketInformation;
        const exampleTitle = `[${ticketKey}-${ticketNumber}] Description of ticket`;
        if (new ConventionEvaluator(exampleTitle, regularExpression).TitleMatches()) {
            return {resultType: TitleResult.Invalid, exampleMessage: `Example Title: ${exampleTitle}`};
        }
    }

    return {resultType: TitleResult.Invalid};
}
