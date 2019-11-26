import Prace from './Prace';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { PullRequestData } from './PullRequestData';
import { Arg, Substitute, SubstituteOf } from '@fluffy-spoon/substitute';
import { ConventionEvaluator } from './Evaluator/ConventionEvaluator';
import { EvaluationResult } from './Evaluator/EvaluationResult';
import { IGithubApi } from './Github/IGithubApi';
import { invalidExpression } from './Evaluator/ConventionErrors';

describe('Prace tests', () => {
	let evaluator: SubstituteOf<ConventionEvaluator>;
	let prData: SubstituteOf<PullRequestData>;
	let github: SubstituteOf<IGithubApi>;
	let prace: Prace;

	beforeEach(() => {
		evaluator = Substitute.for<ConventionEvaluator>();
		prData = Substitute.for<PullRequestData>();
		github = Substitute.for<IGithubApi>();

		prace = new Prace(github, prData);
	});

	it('Should report error on invalid regex', async () => {
		// Seems to work this way.
		// https://github.com/ffMathy/FluffySpoon.JavaScript.Testing.Faking/issues/21#issuecomment-466015379
		(<any>evaluator).isRegexValid.returns(false);
		(<any>evaluator).regexResult.returns({
			results: [
				{
					name: 'example',
					valid: false,
					errorMessage: 'etcetera'
				}
			]
		});

		const result = await prace.execute(evaluator);

		(<any>evaluator).results.called();
		const expectedMessage = invalidExpression('example', 'etcetera');
		github.received().reportFailed(
			Arg.is<string>((m) => m.includes(expectedMessage))
		);
		expect(result).to.be.false;
	});

	it('Should succeed with correct evaluation', async () => {
		(<any>evaluator).isRegexValid.returns(true);
		const evResult = { failed: false };
		evaluator
			.runEvaluations()
			.returns((evResult as unknown) as EvaluationResult);
		const result = await prace.execute(evaluator);
		expect(result).to.be.true;
	});

	it('Should correctly report failed cases', async () => {
		(<any>evaluator).isRegexValid.returns(true);
		const evResult = {
			failed: true,
			generateReport() {
				return [{ name: 'example', message: 'example message' }];
			}
		};
		evaluator
			.runEvaluations()
			.returns((evResult as unknown) as EvaluationResult);
		const result = await prace.execute(evaluator);
		expect(result).to.be.false;
		const expectedMessage = 'example: example message';
		github.received().reportFailed(
			Arg.is<string>((m) => m.includes(expectedMessage))
		);
	});
});
