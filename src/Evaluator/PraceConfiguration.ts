/** Configuration file structure */
export default interface PraceConfig {
	title: Pattern[];
	body: Pattern[];
	branch: Pattern[];
	reviewer: {
		minimum: number;
		users: string[];
		teams: string[];
	}
	additions: number;
	labels: string[];
}

interface Pattern {
	pattern: string,
	error: string
}
