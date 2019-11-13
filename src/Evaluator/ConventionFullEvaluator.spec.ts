import { describe, it } from 'mocha';
import { expect } from 'chai';
import PraceConfiguration, { Pattern } from './PraceConfiguration';
import { PullRequestData } from '../PullRequestData';
import { ConventionFullEvaluator } from './ConventionFullEvaluator';

describe('Convention Evaluator Tests', () => {
	let configuration: PraceConfiguration;
	let data: PullRequestData;

	beforeEach(() => {
		configuration = {
			title: {
				patterns: ['\\[BLOB-\\d*\\]\\s[\\w\\s]*'],
				error: 'It must include [BLOB-number]'
			},
			body: undefined,
			branch: undefined,
			reviewer: {
				minimum: 2,
				users: ['Juan', 'Tomas'],
				teams: ['developers']
			},
			additions: 12,
			labels: ['bug', 'feature']
		};

		data = {
			pull_request: {
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
			}
		} as PullRequestData;
	});

	it('should example be valid for example request', () => {
		const convention = new ConventionFullEvaluator(data, configuration);
		const result = convention.runEvaluations();
		expect(result.title.valid).to.be.true;
		expect(result.body.valid).to.be.true;
		expect(result.branch.valid).to.be.true;
		expect(result.reviewers.valid).to.be.true;
		expect(result.additions.valid).to.be.true;
		expect(result.labels.valid).to.be.true;
	});

	it('should succeed with empty configuration', () => {
		// Delete all keys
		delete configuration.title;
		delete configuration.additions;
		delete configuration.labels;
		delete configuration.reviewer;

		const convention = new ConventionFullEvaluator(data, configuration);
		const result = convention.runEvaluations();

		expect(result.title.valid).to.be.true;
		expect(result.body.valid).to.be.true;
		expect(result.branch.valid).to.be.true;
		expect(result.reviewers.valid).to.be.true;
		expect(result.additions.valid).to.be.true;
		expect(result.labels.valid).to.be.true;
	});

	describe('Title', () => {
		it('should succeed with valid title', () => {
			data.pull_request.title = '[BLOB-123] Example';
			const convention = new ConventionFullEvaluator(data, configuration);
			const result = convention.runEvaluations();
			expect(result.title.valid).to.be.true;
		});

		it('should fail with invalid title', () => {
			data.pull_request.title = 'Wrong title';
			const convention = new ConventionFullEvaluator(data, configuration);
			const result = convention.runEvaluations();
			expect(result.title.valid).to.be.false;
			const title = configuration.title as Pattern;
			expect(result.title.errorMessage).to.be.equal(title.error);
		});
	});

	describe('Branch', () => {
		it('should succeed with valid branch name', () => {
			data.pull_request.head.ref = 'test/123';
			configuration.branch = {
				patterns: ['test\\/\\d+'],
				error: 'Invalid branch name because reasons'
			};

			const convention = new ConventionFullEvaluator(data, configuration);
			const result = convention.runEvaluations();
			expect(result.branch.valid).to.be.true;
		});

		it('should fail with invalid branch name', () => {
			data.pull_request.head.ref = 'wrong';
			configuration.branch = {
				patterns: ['test\\/\\d+'],
				error: 'Invalid branch name because reasons'
			};

			const convention = new ConventionFullEvaluator(data, configuration);
			const result = convention.runEvaluations();

			expect(result.branch.valid).to.be.false;
			const branch = configuration.branch as Pattern;
			expect(result.branch.errorMessage).to.be.equal(branch.error);
		});
	});

	describe('Body', () => {
		it('should succeed with valid body', () => {
			data.pull_request.head.ref = 'etcetera';
			configuration.body = {
				patterns: ['.+'],
				error: 'You need to write at least something'
			};

			const convention = new ConventionFullEvaluator(data, configuration);
			const result = convention.runEvaluations();

			expect(result.branch.valid).to.be.true;
		});

		it('should fail with invalid body', () => {
			delete data.pull_request.body;
			configuration.body = {
				patterns: ['.+'],
				error: 'You need to write at least something'
			};

			const convention = new ConventionFullEvaluator(data, configuration);
			const result = convention.runEvaluations();

			expect(result.body.valid).to.be.false;
			const body = configuration.body as Pattern;
			expect(result.body.errorMessage).to.be.equal(body.error);
		});
	});

	describe('Additions', () => {
		it('should succeed with valid additions', () => {
			data.pull_request.additions = 99;
			configuration.additions = 100;

			const convention = new ConventionFullEvaluator(data, configuration);
			const result = convention.runEvaluations();

			expect(result.additions.valid).to.be.true;
		});

		it('should fail with invalid additions', () => {
			data.pull_request.additions = 150;
			configuration.additions = 100;

			const convention = new ConventionFullEvaluator(data, configuration);
			const result = convention.runEvaluations();

			expect(result.additions.valid).to.be.false;

			const errorMsg = `Exceeded additions limits. Maximum allowed additions are ${configuration.additions}`;
			expect(result.additions.errorMessage).to.be.equal(errorMsg);
		});
	});

	describe('Reviewers', () => {
		let dataWithNoReviewers: PullRequestData;

		beforeEach(() => {
			delete data.pull_request.requested_reviewers;
			delete data.pull_request.requested_teams;
			dataWithNoReviewers = data;
		});

		it('should succeed with valid reviewers', () => {
			dataWithNoReviewers.pull_request.requested_reviewers = [
				{ login: 'John' }
			];
			configuration.reviewer = {
				minimum: 1
			};

			const convention = new ConventionFullEvaluator(
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
			configuration.reviewer = reviewers;

			const convention = new ConventionFullEvaluator(
				dataWithNoReviewers,
				configuration
			);
			const result = convention.runEvaluations();
			expect(result.reviewers.valid).to.be.false;
			const errorMsg = `You have to assign at least ${reviewers.minimum} reviewers`;
			expect(result.reviewers.errorMessage).to.be.equal(errorMsg);
		});

		it('should fail with no correct reviewers', () => {
			dataWithNoReviewers.pull_request.requested_reviewers = [
				{ login: 'John' }
			];
			const requestedReviewer = 'Juan';
			configuration.reviewer = {
				minimum: 1,
				users: [requestedReviewer]
			};

			const convention = new ConventionFullEvaluator(
				dataWithNoReviewers,
				configuration
			);
			const result = convention.runEvaluations();
			expect(result.reviewers.valid).to.be.false;
			const errorMsg = `Must have, at least, one of the following users as reviewer: ${requestedReviewer}`;
			expect(result.reviewers.errorMessage).to.be.equal(errorMsg);
		});

		it('should succeed with correct reviewers', () => {
			dataWithNoReviewers.pull_request.requested_reviewers = [
				{ login: 'Juan' }
			];
			const requestedReviewer = 'Juan';
			configuration.reviewer = {
				minimum: 1,
				users: [requestedReviewer]
			};

			const convention = new ConventionFullEvaluator(
				dataWithNoReviewers,
				configuration
			);
			const result = convention.runEvaluations();
			expect(result.reviewers.valid).to.be.true;
		});

		it('should fail with no teams', () => {
			dataWithNoReviewers.pull_request.requested_reviewers = [
				{ login: 'etectera' }
			];
			const requestedReviewer = 'Developers';
			configuration.reviewer = {
				minimum: 1,
				teams: [requestedReviewer]
			};

			const convention = new ConventionFullEvaluator(
				dataWithNoReviewers,
				configuration
			);
			const result = convention.runEvaluations();
			expect(result.reviewers.valid).to.be.false;
			const errorMsg = `Must have, at least, one of the following teams as reviewer: ${requestedReviewer}`;
			expect(result.reviewers.errorMessage).to.be.equal(errorMsg);
		});

		it('should fail with no correct team', () => {
			dataWithNoReviewers.pull_request.requested_teams = [
				{ name: 'Artists', slug: 'arts' }
			];
			const requestedReviewer = 'Developers';
			configuration.reviewer = {
				minimum: 1,
				teams: [requestedReviewer]
			};

			const convention = new ConventionFullEvaluator(
				dataWithNoReviewers,
				configuration
			);
			const result = convention.runEvaluations();
			expect(result.reviewers.valid).to.be.false;
			const errorMsg = `Must have, at least, one of the following teams as reviewer: ${requestedReviewer}`;
			expect(result.reviewers.errorMessage).to.be.equal(errorMsg);
		});

		it('should succeed with correct team', () => {
			dataWithNoReviewers.pull_request.requested_teams = [
				{ name: 'Developers', slug: 'devs' }
			];
			const requestedReviewer = 'Developers';
			configuration.reviewer = {
				minimum: 1,
				teams: [requestedReviewer]
			};

			const convention = new ConventionFullEvaluator(
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
			data.pull_request.labels = [
				{ name: labelName, description: 'Etcetera', id: 99 }
			];
			configuration.labels = [labelName];

			const convention = new ConventionFullEvaluator(data, configuration);
			const result = convention.runEvaluations();
			expect(result.labels.valid).to.be.true;
		});

		it('should fail with no labels', () => {
			const labelName = 'example';
			delete data.pull_request.labels;
			configuration.labels = [labelName];

			const convention = new ConventionFullEvaluator(data, configuration);
			const result = convention.runEvaluations();
			expect(result.labels.valid).to.be.false;
			const errorMsg = `Must have, at least, one of the following labels ${labelName}`;
			expect(result.labels.errorMessage).to.be.equal(errorMsg);
		});

		it('should fail with incorrect labels', () => {
			const labelName = 'example';
			data.pull_request.labels = [
				{ name: 'bug', description: 'Bug', id: 88 }
			];
			configuration.labels = [labelName];

			const convention = new ConventionFullEvaluator(data, configuration);
			const result = convention.runEvaluations();
			expect(result.labels.valid).to.be.false;
			const errorMsg = `Must have, at least, one of the following labels ${labelName}`;
			expect(result.labels.errorMessage).to.be.equal(errorMsg);
		});
	});
});
