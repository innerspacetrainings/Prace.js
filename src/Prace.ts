import ConventionEvaluator from "./ConventionEvaluator";

export interface TitleEvaluationResult {
    success: boolean;
    exampleMessage?: string;
}

export default function EvaluateTitle(result: { prTitle: string, prExpression: string }): TitleEvaluationResult {
    const {prTitle, prExpression} = result;
    const evaluator = new ConventionEvaluator(prTitle, prExpression);

    if (!evaluator.IsValidRegex()) {
        return {success: false, exampleMessage: 'Invalid Regex'};
    } else if (evaluator.TitleMatches()) {
        return {success: true};
    }

    const {ticketKey, ticketNumber} = evaluator.GetTicketInformation();
    const exampleTitle = `[${ticketKey}-${ticketNumber}] Description of ticket`;
    if (new ConventionEvaluator(exampleTitle, prExpression).TitleMatches()) {
        return {success: false, exampleMessage: `Example Title: ${exampleTitle}`};
    }

    return {success: false};
}
