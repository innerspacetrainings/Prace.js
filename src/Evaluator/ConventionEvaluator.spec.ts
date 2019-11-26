import { describe, it } from 'mocha';
import { expect } from 'chai';
import { Pattern, PraceConfig } from './PraceConfiguration';
import { PullRequestData } from '../PullRequestData';
import { ConventionEvaluator } from './ConventionEvaluator';
import * as errors from './ConventionErrors';

describe('Convention Evaluator Tests', () => {
	let configuration: PraceConfig;
	let data: PullRequestData;

	beforeEach(() => {
		configuration = {
			title: {
				patterns: ['\\[BLOB-\\d*\\]\\s[\\w\\s]*'],
				error: 'It must include [BLOB-number]'
			},
			body: undefined,
			branch: undefined,
			reviewers: {
				minimum: 2,
				users: ['Juan', 'Tomas'],
				teams: ['developers']
			},
			additions: 12,
			labels: ['bug', 'feature']
		};

		data = {
			title: '[BLOB-123] Commit',
			body: 'Something',
			head: {
				ref: 'action/event'
			},
			requested_reviewers: [
				{
					login: 'Juan'
				}
			],
			requested_teams: [
				{
					name: 'Artists',
					slug: 'artists'
				},
				{
					name: 'Developers',
					slug: 'developers'
				}
			],
			additions: 8,
			labels: [
				{
					name: 'event',
					id: 1,
					description: 'This is an event'
				},
				{
					name: 'feature',
					id: 2,
					description: 'This adds a feature to the code'
				}
			]
		} as PullRequestData;
	});

	it('should yield passing result for the example data', () => {
		const convention = new ConventionEvaluator(data, configuration);
		const result = convention.runEvaluations();
		expect(result.failed).to.be.false;
		expect(result.title.valid).to.be.true;
		expect(result.body.valid).to.be.true;
		expect(result.branch.valid).to.be.true;
		expect(result.reviewers.valid).to.be.true;
		expect(result.additions.valid).to.be.true;
		expect(result.labels.valid).to.be.true;
	});

	it('should succeed with empty configuration', () => {
		const convention = new ConventionEvaluator(data, {});
		const result = convention.runEvaluations();

		expect(result.failed).to.be.false;
		expect(result.title.valid).to.be.true;
		expect(result.body.valid).to.be.true;
		expect(result.branch.valid).to.be.true;
		expect(result.reviewers.valid).to.be.true;
		expect(result.additions.valid).to.be.true;
		expect(result.labels.valid).to.be.true;
	});

	describe('Regex', () => {
		it('should fail with invalid regex', () => {
			configuration.body = {
				patterns: ['][', 'good'],
				error: 'Bad case'
			};
			const convention = new ConventionEvaluator(data, configuration);
			expect(convention.isRegexValid).to.be.false;
			expect(convention.regexResult.results.length).to.be.greaterThan(0);
			expect(convention.regexResult.results[0].errorMessage).to.contain(
				'Invalid regular expression:'
			);
		});

		it('should fail evaluating with invalid regex', () => {
			configuration.body = {
				patterns: ['][', 'good'],
				error: 'Bad case'
			};
			const convention = new ConventionEvaluator(data, configuration);
			try {
				convention.runEvaluations();
			} catch (e) {
				expect(e.message).to.equal(errors.regexError);
			}
		});
	});

	describe('Title', () => {
		it('should succeed with valid title', () => {
			data.title = '[BLOB-123] Example';
			const convention = new ConventionEvaluator(data, configuration);
			const result = convention.runEvaluations();
			expect(result.title.valid).to.be.true;
		});

		it('should fail with invalid title', () => {
			data.title = 'Wrong title';
			const convention = new ConventionEvaluator(data, configuration);
			const result = convention.runEvaluations();
			expect(result.title.valid).to.be.false;
			const title = configuration.title as Pattern;
			expect(result.title.errorMessage).to.be.equal(title.error);
		});
	});

	describe('Branch', () => {
		it('should succeed with valid branch name', () => {
			data.head.ref = 'test/123';
			configuration.branch = {
				patterns: ['test\\/\\d+'],
				error: 'Invalid branch name because reasons'
			};

			const convention = new ConventionEvaluator(data, configuration);
			const result = convention.runEvaluations();
			expect(result.branch.valid).to.be.true;
		});

		it('should fail with invalid branch name', () => {
			data.head.ref = 'wrong';
			configuration.branch = {
				patterns: ['test\\/\\d+'],
				error: 'Invalid branch name because reasons'
			};

			const convention = new ConventionEvaluator(data, configuration);
			const result = convention.runEvaluations();

			expect(result.branch.valid).to.be.false;
			const branch = configuration.branch as Pattern;
			expect(result.branch.errorMessage).to.be.equal(branch.error);
		});
	});

	describe('Body', () => {
		it('should succeed with valid body', () => {
			data.head.ref = 'etcetera';
			configuration.body = {
				patterns: ['.+'],
				error: 'You need to write at least something'
			};

			const convention = new ConventionEvaluator(data, configuration);
			const result = convention.runEvaluations();

			expect(result.branch.valid).to.be.true;
		});

		it('should fail with invalid body', () => {
			delete data.body;
			configuration.body = {
				patterns: ['.+'],
				error: 'You need to write at least something'
			};

			const convention = new ConventionEvaluator(data, configuration);
			const result = convention.runEvaluations();

			expect(result.body.valid).to.be.false;
			const body = configuration.body as Pattern;
			expect(result.body.errorMessage).to.be.equal(body.error);
		});
	});

	describe('Additions', () => {
		it('should succeed with valid additions', () => {
			data.additions = 99;
			configuration.additions = 100;

			const convention = new ConventionEvaluator(data, configuration);
			const result = convention.runEvaluations();

			expect(result.additions.valid).to.be.true;
		});

		it('should fail with invalid additions', () => {
			data.additions = 150;
			configuration.additions = 100;

			const convention = new ConventionEvaluator(data, configuration);
			const result = convention.runEvaluations();

			expect(result.additions.valid).to.be.false;

			const errorMsg = errors.additionsError(configuration.additions);
			expect(result.additions.errorMessage).to.be.equal(errorMsg);
		});
	});

	describe('Reviewers', () => {
		let dataWithNoReviewers: PullRequestData;
		const requestedTeam = 'Developers';

		beforeEach(() => {
			delete data.requested_reviewers;
			delete data.requested_teams;
			dataWithNoReviewers = data;
		});

		it('should succeed with valid reviewers', () => {
			dataWithNoReviewers.requested_reviewers = [{ login: 'John' }];
			configuration.reviewers = {
				minimum: 1
			};

			const convention = new ConventionEvaluator(
				dataWithNoReviewers,
				configuration
			);
			const result = convention.runEvaluations();
			expect(result.reviewers.valid).to.be.true;
		});

		it('should fail with no reviewers', () => {
			const reviewers = {
				minimum: 1
			};
			configuration.reviewers = reviewers;

			const convention = new ConventionEvaluator(
				dataWithNoReviewers,
				configuration
			);
			const result = convention.runEvaluations();
			expect(result.reviewers.valid).to.be.false;
			const errorMsg = errors.reviewersMinimum(reviewers.minimum);
			expect(result.reviewers.errorMessage).to.be.equal(errorMsg);
		});

		it('should fail with no correct reviewers', () => {
			dataWithNoReviewers.requested_reviewers = [{ login: 'John' }];
			const requestedReviewer = 'Juan';
			configuration.reviewers = {
				minimum: 1,
				users: [requestedReviewer]
			};

			const convention = new ConventionEvaluator(
				dataWithNoReviewers,
				configuration
			);
			const result = convention.runEvaluations();
			expect(result.reviewers.valid).to.be.false;
			const errorMsg = errors.missingRequiredReviewer([
				requestedReviewer
			]);
			expect(result.reviewers.errorMessage).to.be.equal(errorMsg);
		});

		it('should succeed with correct reviewers', () => {
			dataWithNoReviewers.requested_reviewers = [{ login: 'Juan' }];
			const requestedReviewer = 'Juan';
			configuration.reviewers = {
				minimum: 1,
				users: [requestedReviewer]
			};

			const convention = new ConventionEvaluator(
				dataWithNoReviewers,
				configuration
			);
			const result = convention.runEvaluations();
			expect(result.reviewers.valid).to.be.true;
		});

		it('should fail with no teams', () => {
			dataWithNoReviewers.requested_reviewers = [{ login: 'etectera' }];
			configuration.reviewers = {
				minimum: 1,
				teams: [requestedTeam]
			};

			const convention = new ConventionEvaluator(
				dataWithNoReviewers,
				configuration
			);
			const result = convention.runEvaluations();
			expect(result.reviewers.valid).to.be.false;
			const errorMsg = errors.missingRequiredTeam([requestedTeam]);
			expect(result.reviewers.errorMessage).to.be.equal(errorMsg);
		});

		it('should fail with no correct team', () => {
			dataWithNoReviewers.requested_teams = [
				{ name: 'Artists', slug: 'arts' }
			];
			configuration.reviewers = {
				minimum: 1,
				teams: [requestedTeam]
			};

			const convention = new ConventionEvaluator(
				dataWithNoReviewers,
				configuration
			);
			const result = convention.runEvaluations();
			expect(result.reviewers.valid).to.be.false;
			const errorMsg = errors.missingRequiredTeam([requestedTeam]);
			expect(result.reviewers.errorMessage).to.be.equal(errorMsg);
		});

		it('should succeed with correct team', () => {
			dataWithNoReviewers.requested_teams = [
				{ name: 'Developers', slug: 'devs' }
			];
			configuration.reviewers = {
				minimum: 1,
				teams: [requestedTeam]
			};

			const convention = new ConventionEvaluator(
				dataWithNoReviewers,
				configuration
			);
			const result = convention.runEvaluations();
			expect(result.reviewers.valid).to.be.true;
		});

		it('should succeed with uppercase fields', () => {
			dataWithNoReviewers.requested_reviewers = [{ login: 'juan' }];
			dataWithNoReviewers.requested_teams = [
				{ name: 'developers', slug: 'devs' }
			];
			const requestedReviewer = 'JUAN';
			configuration.reviewers = {
				minimum: 1,
				users: [requestedReviewer],
				teams: ['DEVELOPERS']
			};

			const convention = new ConventionEvaluator(
				dataWithNoReviewers,
				configuration
			);
			const result = convention.runEvaluations();
			expect(result.reviewers.valid).to.be.true;
		});
	});

	describe('Labels', () => {
		it('should succeed with correct labels', () => {
			const labelName = 'example';
			data.labels = [
				{ name: labelName, description: 'Etcetera', id: 99 }
			];
			configuration.labels = [labelName];

			const convention = new ConventionEvaluator(data, configuration);
			const result = convention.runEvaluations();
			expect(result.labels.valid).to.be.true;
		});

		it('should fail with no labels', () => {
			const labelName = 'example';
			delete data.labels;
			configuration.labels = [labelName];

			const convention = new ConventionEvaluator(data, configuration);
			const result = convention.runEvaluations();
			expect(result.labels.valid).to.be.false;
			const errorMsg = errors.missingLabel([labelName]);
			expect(result.labels.errorMessage).to.be.equal(errorMsg);
		});

		it('should fail with incorrect labels', () => {
			const labelName = 'example';
			data.labels = [{ name: 'bug', description: 'Bug', id: 88 }];
			configuration.labels = [labelName];

			const convention = new ConventionEvaluator(data, configuration);
			const result = convention.runEvaluations();
			expect(result.labels.valid).to.be.false;
			const errorMsg = errors.missingLabel([labelName]);
			expect(result.labels.errorMessage).to.be.equal(errorMsg);
		});

		it('should succeed with uppercase label', () => {
			data.labels = [
				{ name: 'example', description: 'Etcetera', id: 99 }
			];
			configuration.labels = ['EXAMPLE'];

			const convention = new ConventionEvaluator(data, configuration);
			const result = convention.runEvaluations();
			expect(result.labels.valid).to.be.true;
		});
	});
});
