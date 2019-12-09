import { PullsListReviewsResponse } from '@octokit/rest';
import { WebhookPayload } from '@actions/github/lib/interfaces';

/** List of given reviews (different to requested reviewers)
 * When a user review a PR, it stops being a requested reviewer */
export interface Reviewer {
	state: 'APPROVED' | 'COMMENTED' | 'CHANGES_REQUESTED';
	user: {
		login: string;
		id: number;
	};
}

/** Filter the reviews and returns reviewers who aren't duplicated nor the author **/
export const filterReviewers = (
	reviews: PullsListReviewsResponse,
	{ pull_request }: WebhookPayload
): Reviewer[] => {
	const reviewers: Reviewer[] = [];

	const idsNotToInclude: number[] = [pull_request!.user.id];
	for (const review of reviews) {
		if (idsNotToInclude.indexOf(review.user.id) > -1) {
			continue;
		}
		const { login, id } = review.user;
		reviewers.push({
			state: review.state as
				| 'APPROVED'
				| 'COMMENTED'
				| 'CHANGES_REQUESTED',
			user: { login, id }
		});
		idsNotToInclude.push(review.user.id);
	}

	return reviewers;
};
