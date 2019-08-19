import ConventionEvaluator from './ConventionEvaluator';
import { describe, it } from 'mocha';
import { expect } from 'chai';

describe('Convention Evaluator test', () => {
    const DefaultValidPattern: string = '\\[BLOB-\\d*\\]\\s[\\w\\s]*';

    it('Should return true to valid title', () => {
        const evaluator = new ConventionEvaluator('[BLOB-1234] This is a valid title', DefaultValidPattern);
        expect(evaluator.TitleMatches()).to.be.true;
    });

    it('Should return false to invalid title', () => {
        const evaluator = new ConventionEvaluator('invalid title', DefaultValidPattern);
        expect(evaluator.TitleMatches()).to.be.false;
    });

    it('Should return false to invalid regex', () => {
        const evaluator = new ConventionEvaluator('etc', ']Invalid regex[');
        expect(evaluator.IsValidRegex()).to.be.false;
    });

    it('Should get correct ticket information', () => {
        const evaluator = new ConventionEvaluator('feature/blob 123', DefaultValidPattern);
        const ticketInformation = evaluator.GetTicketInformation();
        expect(ticketInformation).not.to.be.null;
        if (ticketInformation) {
            expect(ticketInformation.ticketNumber).to.equal(123);
            expect(ticketInformation.ticketKey).to.equal('BLOB');
        } else {
            expect.fail();
        }
    });

    it('Should return null when getting number from invalid non standard title', () => {
        const evaluator = new ConventionEvaluator('Functionality without number', DefaultValidPattern);
        const ticketInformation = evaluator.GetTicketInformation();
        expect(ticketInformation).to.be.null;
    });
});
