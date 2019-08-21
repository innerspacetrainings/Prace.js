/** Logic that analyze a title and a regex to see if it complies */
export default class ConventionEvaluator {
    constructor(private readonly title: string, private readonly regularExpression: string) {}

    public isValidRegex(): boolean {
        if (this.regularExpression === null || this.regularExpression.length === 0) return false;

        const parts = this.regularExpression.split('/');
        let regex = this.regularExpression,
            options = '';
        if (parts.length > 1) {
            regex = parts[1];
            options = parts[2];
        }
        try {
            new RegExp(regex, options);
            return true;
        } catch (e) {
            return false;
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
        if (match !== null && match.length > 1) {
            let ticketNumber: number = -1;
            let ticketKey: null | string = null;
            for (const i in match) {
                const currentValue: string | any = match[i];
                if (Number(currentValue) > 0) {
                    ticketNumber = +currentValue;
                } else if (typeof currentValue === 'string' && currentValue !== this.title) {
                    ticketKey = currentValue.toUpperCase();
                }
            }
            if (ticketNumber !== -1 && ticketKey !== null) return { ticketKey, ticketNumber };
        }
        return null;
    }
}

interface TicketInformation {
    ticketKey: String;
    ticketNumber: Number;
}
