/** Object sent by the PullRequest web hook. This values are mandatory." */
export interface PullRequestData {
	title: string;
	body: string;
	head: {
		// branch name
		ref: string;
	};
	labels: Label[];
	requested_reviewers: Reviewer[];
	requested_teams: Team[];
	additions: number;
	deletions: number;
	changed_files: number;
}

interface Label {
	id: number;
	name: string;
	description: string;
}

interface Reviewer {
	login: string;
}

interface Team {
	name: string;
	slug: string;
}
