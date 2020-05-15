export interface CheckParameters {
	owner: string;
	repo: string;
	name: string;
	head_sha: string;
	details_url?: string;
	status?: 'queued' | 'in_progress' | 'completed';
	started_at?: string;
	conclusion?: 'success' | 'failure';
	completed_at?: string;
	output: Output;
}

export interface Output {
	title: string;
	summary: string;
	text?: string;
	annotations?: [
		{
			path: string;
			start_line: number;
			end_line: number;
			annotation_level: 'notice' | 'warning' | 'failure';
			message: string;
			title?: string;
		}
	];
	images?: [{ alt: string; image_url: string; caption?: string }];
}
