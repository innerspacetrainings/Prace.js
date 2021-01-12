/** Object sent by the PullRequest web hook. These values are mandatory." */
export interface PullRequestData {
	title: string;
	body: string;
	head: {
		// branch name
		ref: string;
	};
	labels: Label[];
	requested_reviewers: User[];
	requested_teams: Team[];
	additions: number;
	deletions: number;
	state: 'open' | 'closed';
	changed_files: number;
	user: User;
}

interface Label {
	id: number;
	name: string;
	description: string;
}

interface User {
	login: string;
	id: number;
}

interface Team {
	name: string;
	slug: string;
}
