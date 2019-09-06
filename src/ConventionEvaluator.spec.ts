import { ConventionEvaluator } from './ConventionEvaluator';
import { describe, it } from 'mocha';
import { expect } from 'chai';

describe('Convention Evaluator test', () => {
	const DefaultValidPattern: string = '\\[BLOB-\\d*\\]\\s[\\w\\s]*';

	it('Should return true to valid title', () => {
		const evaluator = new ConventionEvaluator('[BLOB-1234] This is a valid title', DefaultValidPattern);
		expect(evaluator.titleMatches()).to.be.true;
	});

	it('Should return false to invalid title', () => {
		const evaluator = new ConventionEvaluator('invalid title', DefaultValidPattern);
		expect(evaluator.titleMatches()).to.be.false;
	});

	it('Should return true to valid regex', () => {
		const evaluator = new ConventionEvaluator('etc', '[ValidRegex|\ns\r]|Result');
		expect(evaluator.isValidRegex().valid).to.be.true;
	});

	it('Should return false without message to null regex', () => {
		const evaluator = new ConventionEvaluator('etc', '');
		const regexStatus = evaluator.isValidRegex();
		expect(regexStatus.valid).to.be.false;
		expect(regexStatus.errorMessage).to.be.undefined;
	});

	it('Should return invalid regex message to invalid regex', () => {
		const evaluator = new ConventionEvaluator('etc', '[0-9]++');
		const regexStatus = evaluator.isValidRegex();
		expect(regexStatus.valid).to.be.false;
		expect(regexStatus.errorMessage).to.contain('Invalid regular expression');
	});

	it('Should get correct ticket information', () => {
		const evaluator = new ConventionEvaluator('feature/blob 123', DefaultValidPattern);
		const ticketInformation = evaluator.getTicketInformation();
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
		const ticketInformation = evaluator.getTicketInformation();
		expect(ticketInformation).to.be.null;
	});
});
