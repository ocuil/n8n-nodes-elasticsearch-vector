// filepath: Elasticsearch.utils.ts
import { Client } from '@elastic/elasticsearch';

export type ElasticsearchCredential = {
	url: string;
	username?: string;
	password?: string;
	apiKey?: string;
};

export function parseElasticsearchUrl(url: string): string {
	try {
		// Validar la URL
		new URL(url);
		return url;
	} catch (error) {
		throw new Error(`Invalid Elasticsearch URL: ${url}. Please provide a valid URL with protocol (http/https)`);
	}
}

export function createElasticsearchClient(credentials: ElasticsearchCredential): Client {
	const url = parseElasticsearchUrl(credentials.url);
	
	const config: any = {
		node: url,
	};

	// Add authentication if provided
	if (credentials.username && credentials.password) {
		config.auth = {
			username: credentials.username,
			password: credentials.password,
		};
	} else if (credentials.apiKey) {
		config.auth = {
			apiKey: credentials.apiKey,
		};
	}

	try {
		const esClient = new Client(config);
		return esClient;
	} catch (error) {
		throw new Error(`Failed to create Elasticsearch client: ${(error as Error).message}`);
	}
}