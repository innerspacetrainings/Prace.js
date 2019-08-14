import EvaluateTitle, {TitleResult} from "./Utils";
import {expect} from 'chai';

describe('Utils test', () => {
    const DefaultValidPattern: string = "\\[BLOB-\\d*\\]\\s[\\w\\s]*";

    it('Should return true on valid title', () => {
        const validTitle: string = "[BLOB-1234] This is a valid title";
        const titleEvaluated = EvaluateTitle({prTitle: validTitle, prExpression: DefaultValidPattern});
        expect(titleEvaluated.resultType).to.be.equal(TitleResult.Correct);
        expect(titleEvaluated.exampleMessage).to.be.undefined;
    });

    it('Should return false on invalid title', () => {
        const invalidTitle: string = "etcetera";
        const titleEvaluated = EvaluateTitle({prTitle: invalidTitle, prExpression: DefaultValidPattern});
        expect(titleEvaluated.resultType).to.be.equal(TitleResult.Invalid);
        expect(titleEvaluated.exampleMessage).to.be.undefined;
    });

    it('Should return false and invalid regex message on invalid regex', () => {
        const invalidTitle: string = "etcetera";
        const titleEvaluated = EvaluateTitle({prTitle: invalidTitle, prExpression: ']['});
        expect(titleEvaluated.resultType).to.be.equal(TitleResult.InvalidRegex);
        expect(titleEvaluated.exampleMessage).to.be.equal('Invalid Regex');
    });

    it('Should return message if it can extract ticket number', () => {
        const invalidTitle: string = 'feat/blob 123';
        const titleEvaluated = EvaluateTitle({prTitle: invalidTitle, prExpression: DefaultValidPattern});
        expect(titleEvaluated.resultType).to.be.equal(TitleResult.Invalid);
        expect(titleEvaluated.exampleMessage).to.be.equal('Example Title: [BLOB-123] Description of ticket');
    })
})
