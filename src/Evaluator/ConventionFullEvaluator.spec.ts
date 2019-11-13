import { describe, it } from 'mocha';
import { expect } from 'chai';
import PraceConfiguration, { Pattern } from './PraceConfiguration';
import { PullRequestData } from '../PullRequestData';
import { ConventionFullEvaluator } from './ConventionFullEvaluator';

describe('Convention Evaluator Tests', () => {
	function generateConfiguration(): PraceConfiguration {
		return {
			title:
				{
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
	};

	function generateData(): PullRequestData {
		return {
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
					}]
			}
		} as PullRequestData;
	}

	it('should example be valid for example request', () => {
		const convention = new ConventionFullEvaluator(generateData(), generateConfiguration());
		const result = convention.runEvaluations();
		expect(result.title.valid).to.be.true;
		expect(result.body.valid).to.be.true;
		expect(result.branch.valid).to.be.true;
		expect(result.reviewers.valid).to.be.true;
		expect(result.additions.valid).to.be.true;
		expect(result.labels.valid).to.be.true;
	});

	it('should succeed with empty configuration', () => {
		const config = generateConfiguration();
		// Delete all keys
		delete config.title;
		delete config.additions;
		delete config.labels;
		delete config.reviewer;

		const convention = new ConventionFullEvaluator(generateData(), config);
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
			const data = generateData();
			const configuration = generateConfiguration();
			data.pull_request.title = '[BLOB-123] Example';
			const convention = new ConventionFullEvaluator(data, configuration);
			const result = convention.runEvaluations();
			expect(result.title.valid).to.be.true;
		});

		it('should fail with invalid title', () => {
			const data = generateData();
			const configuration = generateConfiguration();
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
			const data = generateData();
			data.pull_request.head.ref = 'test/123';
			const configuration = generateConfiguration() as PraceConfiguration;
			configuration.branch = {
				patterns: ['test\\/\\d+'],
				error: 'Invalid branch name because reasons'
			};

			const convention = new ConventionFullEvaluator(data, configuration);
			const result = convention.runEvaluations();
			expect(result.branch.valid).to.be.true;
		});

		it('should fail with invalid branch name', () => {
			const data = generateData();
			data.pull_request.head.ref = 'wrong';
			const configuration = generateConfiguration();
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
			const data = generateData();
			data.pull_request.head.ref = 'etcetera';
			const configuration = generateConfiguration();
			configuration.body = {
				patterns: ['.+'],
				error: 'You need to write at least something'
			};

			const convention = new ConventionFullEvaluator(data, configuration);
			const result = convention.runEvaluations();

			expect(result.branch.valid).to.be.true;
		});

		it('should fail with invalid body', () => {
			const data = generateData();
			delete data.pull_request.body;
			const configuration = generateConfiguration();
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
			const data = generateData();
			data.pull_request.additions = 99;
			const configuration = generateConfiguration();
			configuration.additions = 100;

			const convention = new ConventionFullEvaluator(data, configuration);
			const result = convention.runEvaluations();

			expect(result.additions.valid).to.be.true;
		});

		it('should fail with invalid additions', () => {
			const data = generateData();
			data.pull_request.additions = 150;
			const configuration = generateConfiguration();
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
			const data = generateData();
			delete data.pull_request.requested_reviewers;
			delete data.pull_request.requested_teams;
			dataWithNoReviewers = data;
		});

		it('should succeed with valid reviewers', () => {
			const data = dataWithNoReviewers;
			data.pull_request.requested_reviewers = [{ login: 'John' }];
			const configuration = generateConfiguration();
			const reviewers = {
				minimum: 1
			};
			configuration.reviewer = reviewers;

			const convention = new ConventionFullEvaluator(data, configuration);
			const result = convention.runEvaluations();
			expect(result.reviewers.valid).to.be.true;
		});

		it('should fail with no reviewers', () => {
			const data = dataWithNoReviewers;
			const configuration = generateConfiguration();
			const reviewers = {
				minimum: 1
			};
			configuration.reviewer = reviewers;

			const convention = new ConventionFullEvaluator(data, configuration);
			const result = convention.runEvaluations();
			expect(result.reviewers.valid).to.be.false;
			const errorMsg = `You have to assign at least ${reviewers.minimum} reviewers`;
			expect(result.reviewers.errorMessage).to.be.equal(errorMsg);
		});

		it('should fail with no correct reviewers', () => {
			const data = dataWithNoReviewers;
			data.pull_request.requested_reviewers = [{ login: 'John' }];
			const configuration = generateConfiguration();
			const requestedReviewer = 'Juan';
			configuration.reviewer = {
				minimum: 1,
				users: [requestedReviewer]
			};

			const convention = new ConventionFullEvaluator(data, configuration);
			const result = convention.runEvaluations();
			expect(result.reviewers.valid).to.be.false;
			const errorMsg = `Must have, at least, one of the following users as reviewer: ${requestedReviewer}`;
			expect(result.reviewers.errorMessage).to.be.equal(errorMsg);
		});

		it('should succeed with correct reviewers', () => {
			const data = dataWithNoReviewers;
			data.pull_request.requested_reviewers = [{ login: 'Juan' }];
			const configuration = generateConfiguration();
			const requestedReviewer = 'Juan';
			configuration.reviewer = {
				minimum: 1,
				users: [requestedReviewer]
			};

			const convention = new ConventionFullEvaluator(data, configuration);
			const result = convention.runEvaluations();
			expect(result.reviewers.valid).to.be.true;
		});

		it('should fail with no teams', () => {
			const data = dataWithNoReviewers;
			data.pull_request.requested_reviewers = [{ login: 'etectera' }];
			const configuration = generateConfiguration();
			const requestedReviewer = 'Developers';
			configuration.reviewer = {
				minimum: 1,
				teams: [requestedReviewer]
			};

			const convention = new ConventionFullEvaluator(data, configuration);
			const result = convention.runEvaluations();
			expect(result.reviewers.valid).to.be.false;
			const errorMsg = `Must have, at least, one of the following teams as reviewer: ${requestedReviewer}`;
			expect(result.reviewers.errorMessage).to.be.equal(errorMsg);
		});

		it('should fail with no correct team', () => {
			const data = dataWithNoReviewers;
			data.pull_request.requested_teams = [{ name: 'Artists', slug: 'arts' }];
			const configuration = generateConfiguration();
			const requestedReviewer = 'Developers';
			configuration.reviewer = {
				minimum: 1,
				teams: [requestedReviewer]
			};

			const convention = new ConventionFullEvaluator(data, configuration);
			const result = convention.runEvaluations();
			expect(result.reviewers.valid).to.be.false;
			const errorMsg = `Must have, at least, one of the following teams as reviewer: ${requestedReviewer}`;
			expect(result.reviewers.errorMessage).to.be.equal(errorMsg);
		});

		it('should succeed with correct team', () => {
			const data = dataWithNoReviewers;
			data.pull_request.requested_teams = [{ name: 'Developers', slug: 'devs' }];
			const configuration = generateConfiguration();
			const requestedReviewer = 'Developers';
			configuration.reviewer = {
				minimum: 1,
				teams: [requestedReviewer]
			};

			const convention = new ConventionFullEvaluator(data, configuration);
			const result = convention.runEvaluations();
			expect(result.reviewers.valid).to.be.true;
		});
	});


	describe('Labels', () => {
		it('should succeed with correct labels', () => {
			const data = generateData();
			const labelName = 'example';
			data.pull_request.labels = [{ name: labelName, description: 'Etcetera', id: 99 }];
			const config = generateConfiguration();
			config.labels = [labelName];

			const convention = new ConventionFullEvaluator(data, config);
			const result = convention.runEvaluations();
			expect(result.labels.valid).to.be.true;
		});

		it('should fail with no labels', () => {
			const data = generateData();
			const labelName = 'example';
			delete data.pull_request.labels;
			const config = generateConfiguration();
			config.labels = [labelName];

			const convention = new ConventionFullEvaluator(data, config);
			const result = convention.runEvaluations();
			expect(result.labels.valid).to.be.false;
			const errorMsg = `Must have, at least, one of the following labels ${labelName}`;
			expect(result.labels.errorMessage).to.be.equal(errorMsg);
		});

		it('should fail with incorrect labels', () => {
			const data = generateData();
			const labelName = 'example';
			data.pull_request.labels = [{ name: 'bug', description: 'Bug', id: 88 }];
			const config = generateConfiguration();
			config.labels = [labelName];

			const convention = new ConventionFullEvaluator(data, config);
			const result = convention.runEvaluations();
			expect(result.labels.valid).to.be.false;
			const errorMsg = `Must have, at least, one of the following labels ${labelName}`;
			expect(result.labels.errorMessage).to.be.equal(errorMsg);
		});
	});
});
