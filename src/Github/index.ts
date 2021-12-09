import { RestEndpointMethodTypes } from "@octokit/rest";

export type PullRequestReviewers = RestEndpointMethodTypes["pulls"]["listReviews"]["response"];

export interface PullRequestReviewer {
    state: string;
    user: { id: number; login: string; } | null;
}
