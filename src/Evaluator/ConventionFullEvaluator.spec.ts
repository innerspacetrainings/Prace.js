import { describe, it } from 'mocha';
import { expect } from 'chai';
import PraceConfiguration from './PraceConfiguration';
import { PullRequestData } from '../PullRequestData';
import { ConventionFullEvaluator } from './ConventionFullEvaluator';

describe('Convention Evaluator Tests', () => {
	const exampleConfiguration: PraceConfiguration = {
		title:
			[
				{
					pattern: '\\[BLOB-\\d*\\]\\s[\\w\\s]*',
					error: 'It must include [BLOB-number]'
				}
			]
		,
		body: [],
		branch: [],
		reviewer: {
			minimum: 2,
			users: ['Juan', 'Tomas'],
			teams: ['developers']
		},
		additions: 12,
		labels: ['bug', 'feature']
	};

	const exampleData = {
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
			labels: [{
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
	};

	it('Should example be valid for example request', () => {
		const convention = new ConventionFullEvaluator(exampleData as PullRequestData, exampleConfiguration);
		const result = convention.runEvaluations();
		expect(result.valid).to.be.true;
	});
});
