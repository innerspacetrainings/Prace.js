/** Configuration file structure */
export default interface PraceConfig {
	title?: Pattern;
	body?: Pattern;
	branch?: Pattern;
	reviewer?: {
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
