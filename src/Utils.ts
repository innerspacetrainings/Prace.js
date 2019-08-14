import ConventionEvaluator from "./ConventionEvaluator";

export interface TitleEvaluationResult {
    resultType: TitleResult;
    exampleMessage?: string;
}

export enum TitleResult {
    Correct,
    Invalid,
    InvalidRegex
}

export default function EvaluateTitle(result: { prTitle: string, prExpression: string }): TitleEvaluationResult {
    const {prTitle, prExpression} = result;
    const evaluator = new ConventionEvaluator(prTitle, prExpression);

    if (!evaluator.IsValidRegex()) {
        return {resultType: TitleResult.InvalidRegex, exampleMessage: 'Invalid Regex'};
    } else if (evaluator.TitleMatches()) {
        return {resultType: TitleResult.Correct};
    }

    const ticketInformation = evaluator.GetTicketInformation();
    if (ticketInformation) {
        const {ticketKey, ticketNumber} = ticketInformation;
        const exampleTitle = `[${ticketKey}-${ticketNumber}] Description of ticket`;
        if (new ConventionEvaluator(exampleTitle, prExpression).TitleMatches()) {
            return {resultType: TitleResult.Invalid, exampleMessage: `Example Title: ${exampleTitle}`};
        }
    }

    return {resultType: TitleResult.Invalid};
}
