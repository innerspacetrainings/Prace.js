/** Object sent by the PullRequest web hook. This are the values that this object must have */
export interface PullRequestData {
	action: string;
	number: number;
	pull_request: {
		title: string,
		body: string,
		head: {
			label: string;
			// branch name
			ref: string;
		},
		labels: Label[],
		requested_reviewers: Reviewer[];
		requested_teams: Team[];
		additions: number;
		deletions: number;
		changed_files: number;
	}
	repository: {
		id: number;
		name: string;
		full_name: string;
	}
	installation: {
		id: number;
	}
}

interface Label {
	id: number;
	name: string;
	description: string;
}

interface Reviewer{
	login:string;
}

interface Team {
	name: string;
	slug:string;
}
