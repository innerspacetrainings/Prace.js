/** Configuration file structure */
export interface PraceConfig {
	title?: Pattern;
	body?: Pattern;
	branch?: Pattern;
	reviewers?: {
		minimum: number;
		users?: string[];
		teams?: string[];
	};
	additions?: number;
	labels?: string[];
}

export interface Pattern {
	patterns: string[];
	error: string;
}
