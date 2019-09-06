import { evaluateTitle, TitleResult } from './Utils';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Utils test', () => {
	const DefaultValidPattern: string = '\\[BLOB-\\d*\\]\\s[\\w\\s]*';

	it('Should return correct on valid title', () => {
		const validTitle: string = '[BLOB-1234] This is a valid title';
		const titleEvaluated = evaluateTitle({
			title: validTitle,
			regularExpression: DefaultValidPattern
		});
		expect(titleEvaluated.resultType).to.be.equal(TitleResult.Correct);
		expect(titleEvaluated.exampleMessage).to.be.undefined;
	});

	it('Should return invalid on invalid title', () => {
		const invalidTitle: string = 'etcetera';
		const titleEvaluated = evaluateTitle({
			title: invalidTitle,
			regularExpression: DefaultValidPattern
		});
		expect(titleEvaluated.resultType).to.be.equal(TitleResult.Invalid);
		expect(titleEvaluated.exampleMessage).to.be.undefined;
	});

	it('Should return false and invalid regex message on invalid regex', () => {
		const invalidTitle: string = 'etcetera';
		const titleEvaluated = evaluateTitle({
			title: invalidTitle,
			regularExpression: ']['
		});
		expect(titleEvaluated.resultType).to.be.equal(TitleResult.InvalidRegex);
		expect(titleEvaluated.exampleMessage).to.contain(
			'Invalid regular expression:'
		);
	});

	it('Should return message if it can extract ticket number', () => {
		const invalidTitle: string = 'feat/blob 123';
		const titleEvaluated = evaluateTitle({
			title: invalidTitle,
			regularExpression: DefaultValidPattern
		});
		expect(titleEvaluated.resultType).to.be.equal(TitleResult.Invalid);
		expect(titleEvaluated.exampleMessage).to.be.equal(
			'Example Title: [BLOB-123] Description of the ticket'
		);
	});
});
