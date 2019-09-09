import { Prace } from './Prace';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { DefaultConfig, IConfig, ILogger } from './Config';
import { PullRequestData } from './PullRequestData';

describe('Prace tests', () => {
	const mockPr: PullRequestData = {
		action: 'open',
		number: 123,
		pull_request: {
			title: 'Example title',
			head: {
				label: 'example',
				ref: 'branch-name'
			}
		},
		repository: {
			id: 123,
			name: 'repo',
			full_name: 'user/repo'
		},
		installation: {
			id: 1234
		}
	};

	class MockLogger implements ILogger {
		public lastMessageReceived: string | undefined;

		log(message: string): void {
			this.lastMessageReceived = message;
		}

		warn(message: string): void {
			this.lastMessageReceived = message;
		}

		error(message: string): void {
			this.lastMessageReceived = message;
		}
	}

	const mockLogger = new MockLogger();

	const validConfig: IConfig = new DefaultConfig(1, 'a', mockLogger);

	it('Should return valid prace with valid parameters', () => {
		const prace = Prace.Build(mockPr, validConfig);
		expect(prace).to.not.be.null;
	});

	it('Should return null with invalid body', () => {
		const prace = Prace.Build({} as PullRequestData, validConfig);
		expect(prace).to.be.null;
		expect(mockLogger.lastMessageReceived).to.equal(
			'pr or pr.pull_request is null!'
		);
	});

	it('Should return null on closed pull request', () => {
		const oldAction = mockPr.action;
		mockPr.action = 'closed';
		const prace = Prace.Build(mockPr, validConfig);
		mockPr.action = oldAction;
		expect(prace).to.be.null;
		expect(mockLogger.lastMessageReceived).to.equal(
			'Ignoring action closed'
		);
	});
});
