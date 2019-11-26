export const regexError =
	"Regex is not valid. Check 'isRegexValid' before evaluating";

export const additionsError = (additions: number): string =>
	`Exceeded additions limits. Maximum allowed additions are ${additions}`;

export const reviewersMinimum = (minimum: number): string =>
	`You have to assign at least ${minimum} reviewers`;

export const missingRequiredReviewer = (reviewers: string[]): string =>
	`Must have at least one of the following users as reviewer: ${reviewers.join(
		', '
	)}`;

export const missingRequiredTeam = (teams: string[]): string =>
	`Must have at least one of the following teams as reviewer: ${teams.join(
		', '
	)}`;

export const missingLabel = (labels: string[]): string =>
	`Must have at least one of the following labels ${labels.join(', ')}`;
