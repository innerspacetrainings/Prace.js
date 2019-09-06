/** Logs message into the prefer system. */
export interface ILogger {
	log(message: string, ...optionalParams: any[]): void;

	warn(message: string, ...optionalParams: any[]): void;

	error(message: string, error?: Error): void;
}
