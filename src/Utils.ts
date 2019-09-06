import { ConventionEvaluator } from './ConventionEvaluator';

/** Result and example message for incorrect results */
export interface TitleEvaluationResult {
	resultType: TitleResult;
	exampleMessage?: string;
}

export enum TitleResult {
	Correct = 'correct',
	Invalid = 'invalid',
	InvalidRegex = 'invalidRegex'
}

export interface PullRequestTitleAndRegex {
	title: string;
	regularExpression: string;
}

/**
 * Parse the regex and the title and check if the title complies with the regex.
 * @param result Title and regex expression.
 */
export function evaluateTitle(result: PullRequestTitleAndRegex): TitleEvaluationResult {
	const { title, regularExpression } = result;
	const evaluator = new ConventionEvaluator(title, regularExpression);

	const regexStatus = evaluator.isValidRegex();
	if (!regexStatus.valid) {
		const exampleMessage: string = regexStatus.errorMessage ? regexStatus.errorMessage : 'Invalid Regex';

		return { resultType: TitleResult.InvalidRegex, exampleMessage };
	} else if (evaluator.titleMatches()) {
		return { resultType: TitleResult.Correct };
	}

	const ticketInformation = evaluator.getTicketInformation();
	if (ticketInformation) {
		const { ticketKey, ticketNumber } = ticketInformation;
		const exampleTitle = `[${ticketKey}-${ticketNumber}] Description of the ticket`;
		if (new ConventionEvaluator(exampleTitle, regularExpression).titleMatches()) {
			return { resultType: TitleResult.Invalid, exampleMessage: `Example Title: ${exampleTitle}` };
		}
	}

	return { resultType: TitleResult.Invalid };
}
