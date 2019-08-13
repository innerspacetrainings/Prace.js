class ConventionEvaluator {
    constructor(readonly title: string, readonly regexEvaluator: string) {
    }

    IsValidRegex(): boolean {
        if (this.regexEvaluator == null || this.regexEvaluator.length === 0) return false;

        let parts = this.regexEvaluator.split('/'),
            regex = this.regexEvaluator,
            options = "";
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

    TitleMatches(): boolean {
        const regexp = new RegExp(this.regexEvaluator);
        return regexp.test(this.title);
    }


    GetTicketInformation(): TicketInformation {
        const match = this.title.match("\\w*\\/(\\w*)\\s(\\d*)");
        if (match != null && match.length > 1) {
            let ticketNumber: Number = -1;
            let ticketKey: string = null;
            for (var _i = 0; _i < match.length; _i++) {
                const currentValue: string = match[_i];
                if (Number(currentValue) > 0) {
                    ticketNumber = +currentValue;
                } else if (currentValue !== this.title) {
                    ticketKey = currentValue.toUpperCase();
                }
            }
            if (ticketNumber !== -1 && ticketKey != null)
                return {ticketKey, ticketNumber};
        }
        return null;
    }
}

interface TicketInformation {
    ticketKey: String,
    ticketNumber: Number
}

export {ConventionEvaluator};