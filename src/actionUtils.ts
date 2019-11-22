import yaml from 'js-yaml';
import { GitHub } from '@actions/github';
import PraceConfiguration from './Evaluator/PraceConfiguration';


interface RepoInfo {
	owner: string
	repo: string
}

export default async function getConfig(github: GitHub, path: string, { owner, repo }: RepoInfo, ref: string): Promise<PraceConfiguration> {
	try {
		const response = await github.repos.getContents({ owner, repo, path, ref });

		return parseConfig(response.data.content);
	}

	catch (error) {
		if(error.status === 404){
			throw new Error('There is no configuration file!');
		}

		throw error;
	}

}


function parseConfig(content: string): PraceConfiguration {
	return yaml.safeLoad(Buffer.from(content, 'base64').toString()) || {};
}
