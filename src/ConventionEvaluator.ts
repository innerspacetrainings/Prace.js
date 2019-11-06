/** Logic that analyze a title and a regex to see if it complies */
export class ConventionEvaluator {
	constructor(
		private readonly title: string,
		private readonly regularExpression: string
	) {}

	public isValidRegex(): RegexStatus {
		if (
			this.regularExpression === null ||
			this.regularExpression.length === 0
		) {
			return { valid: false };
		}

		try {
			const newRegex: RegExp = new RegExp(this.regularExpression);

			return { valid: newRegex !== null };
		} catch (e) {
			return { valid: false, errorMessage: e.message };
		}
	}

	/** Analyze the regular expression to the given title */
	public titleMatches(): boolean {
		const regexp = new RegExp(this.regularExpression);

		return regexp.test(this.title);
	}

	/**
	 * Extract the ticket information. Only work for titles with parameters feature/ab 123
	 * whose regex search for cases as [AB-123] Example
	 * @returns Object with the ticket number and the ticket key
	 */
	public getTicketInformation(): TicketInformation | null {
		const match = this.title.match('\\w*\\/(\\w*)\\s(\\d*)');
		if (match && match.length > 1) {
			let ticketNumber: number = -1;
			let ticketKey: null | string = null;
			for (const currentMatch of match) {
				const currentValue: string | any = currentMatch;
				if (Number(currentValue) > 0) {
					ticketNumber = +currentValue;
				} else if (
					typeof currentValue === "string" &&
					currentValue !== this.title
				) {
					ticketKey = currentValue.toUpperCase();
				}
			}
			if (ticketNumber !== -1 && ticketKey !== null) {
				return { ticketKey, ticketNumber };
			}
		}

		return null;
	}
}

interface TicketInformation {
	ticketKey: string;
	ticketNumber: number;
}

interface RegexStatus {
	valid: boolean;
	errorMessage?: string;
}
