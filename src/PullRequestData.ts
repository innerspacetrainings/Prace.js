/** Object send by the PullRequest web hook. This are the values that this object must have */
export interface PullRequestData {
    action: string;
    number: number;
    pull_request: {
        title: string;
        head: {
            label: string;
            ref: string;
        };
    };
    repository: {
        id: number;
        name: string;
        full_name: string;
    };
    installation: {
        id: number;
    };
}
