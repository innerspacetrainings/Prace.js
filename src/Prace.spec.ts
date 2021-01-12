import Prace from './Prace';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { PullRequestData } from './PullRequestData';
import { Arg, Substitute, SubstituteOf } from '@fluffy-spoon/substitute';
import { ConventionEvaluator } from './Evaluator/ConventionEvaluator';
import { EvaluationResult } from './Evaluator/EvaluationResult';
import { IGithubApi, RepoInformation } from './Github/IGithubApi';
import { invalidExpression } from './Evaluator/ConventionErrors';
import { CheckParameters, Output } from './Github/CheckParameters';

describe('Prace tests', () => {
	let evaluator: SubstituteOf<ConventionEvaluator>;
	let prData: SubstituteOf<PullRequestData>;
	let github: SubstituteOf<IGithubApi>;
	let prace: Prace;

	const mockRepo: RepoInformation = {
		repo: 'repository',
		branch: 'branch',
		owner: 'owner'
	};

	beforeEach(() => {
		evaluator = Substitute.for<ConventionEvaluator>();
		prData = Substitute.for<PullRequestData>();
		github = Substitute.for<IGithubApi>();

		github.getRepoInformation().returns(mockRepo);

		prace = new Prace(github, prData);
	});

	it('Should report error on invalid regex', async () => {
		// Seems to work this way.
		// https://github.com/ffMathy/FluffySpoon.JavaScript.Testing.Faking/issues/21#issuecomment-466015379
		(evaluator as any).isRegexValid.returns(false);
		(evaluator as any).regexResult.returns({
			results: [
				{
					name: 'example',
					valid: false,
					errorMessage: 'etcetera'
				}
			]
		});

		const result = await prace.execute(evaluator);

		(evaluator as any).results.called();
		const expectedMessage = invalidExpression('example', 'etcetera');
		github.received().reportFailed(
			Arg.is<string>((m) => m.includes(expectedMessage))
		);
		expect(result).to.be.false;
	});

	it('Should succeed with correct evaluation', async () => {
		(evaluator as any).isRegexValid.returns(true);
		const evResult = { failed: false };
		evaluator
			.runEvaluations()
			.returns((evResult as unknown) as EvaluationResult);
		const result = await prace.execute(evaluator);
		expect(result).to.be.true;
		github.didNotReceive().reportFailed(Arg.any());

		// We don't really care for the output message. Just for it to be successful
		const expectedOutput: Output = {
			title: '',
			summary: ''
		};

		const expected = generateResult(true, expectedOutput);

		github.received().setResult(
			Arg.is<CheckParameters>((check) => compareResult(expected, check))
		);
	});

	it('Should ignore closed PRs', async () => {
		(prData as any).state.returns('closed');
		const result = await prace.execute();
		expect(result).to.be.true;
		github.didNotReceive().reportFailed(Arg.any());
	});

	it('Should correctly report failed cases', async () => {
		(evaluator as any).isRegexValid.returns(true);
		const failed = { name: 'example', message: 'example message' };
		const evResult = {
			failed: true,
			generateReport() {
				return [failed];
			}
		};
		evaluator
			.runEvaluations()
			.returns((evResult as unknown) as EvaluationResult);

		const result = await prace.execute(evaluator);
		expect(result).to.be.false;
		github.didNotReceive().reportFailed(Arg.any());

		const expectedOutput: Output = {
			title: '1',
			summary: failed.name,
			text: failed.message
		};

		const expectedResult = generateResult(false, expectedOutput);

		github.received().setResult(
			Arg.is<CheckParameters>((check) =>
				compareResult(expectedResult, check)
			)
		);
	});

	function generateResult(success: boolean, output: Output) {
		const now = new Date().toISOString();

		const expectedResult: CheckParameters = {
			owner: mockRepo.owner,
			repo: mockRepo.repo,
			head_sha: mockRepo.branch,
			name: 'linting',
			conclusion: success ? 'success' : 'failure',
			started_at: now,
			completed_at: now,
			output
		};

		return expectedResult;
	}

	function compareResult(expected: CheckParameters, received: any): boolean {
		const receivedCheck = received as CheckParameters;

		expect(receivedCheck.owner).to.be.equal(expected.owner);
		expect(receivedCheck.repo).to.be.equal(expected.repo);
		expect(receivedCheck.head_sha).to.be.equal(expected.head_sha);
		expect(receivedCheck.conclusion).to.be.equal(expected.conclusion);
		compareDates(receivedCheck.started_at, expected.started_at);
		compareDates(receivedCheck.completed_at, expected.completed_at);

		const expectedOutput = expected.output!,
			receivedOutput = receivedCheck.output!;
		expect(receivedOutput.title).to.include(expectedOutput.title);
		expect(receivedOutput.summary).to.include(expectedOutput.summary);
		if (expectedOutput.text) {
			expect(receivedOutput.text).to.include(expectedOutput.text);
		}

		return true;
	}

	function compareDates(received?: string, expected?: string) {
		if (expected) {
			expect(received!.slice(0, -3)).to.be.equal(expected.slice(0, -3));
		}
	}
});
