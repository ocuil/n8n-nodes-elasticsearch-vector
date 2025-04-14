export type ElasticsearchCredential = {
	url: string;
	username?: string;
	password?: string;
	apiKey?: string;
};

function parseElasticsearchUrl(url: string): { protocol: string; host: string; port: number } {
	try {
		const parsedUrl = new URL(url);
		return {
			protocol: parsedUrl.protocol,
			host: parsedUrl.hostname,
			port: parsedUrl.port
				? parseInt(parsedUrl.port, 10)
				: parsedUrl.protocol === 'https:'
					? 443
					: 9200,
		};
	} catch (error) {
		throw new Error(
			`Invalid Elasticsearch URL: ${url}. Please provide a valid URL with protocol (http/https)`,
		);
	}
}

export function createElasticsearchClient(credentials: ElasticsearchCredential): any {
	// This is a simplified client creation
	// In a real implementation, you'd likely use the official Elasticsearch client
	const { protocol, host, port } = parseElasticsearchUrl(credentials.url);
	
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};
	
	if (credentials.apiKey) {
		headers['Authorization'] = `ApiKey ${credentials.apiKey}`;
	}
	
	const auth = credentials.username && credentials.password
		? {
			username: credentials.username,
			password: credentials.password,
		}
		: undefined;
	
	return {
		baseUrl: `${protocol}//${host}:${port}`,
		headers,
		auth,
		async search(index: string, body: any): Promise<any> {
			const response = await fetch(`${protocol}//${host}:${port}/${index}/_search`, {
				method: 'POST',
				headers,
				body: JSON.stringify(body),
				...(auth && {
					headers: {
						...headers,
						'Authorization': `Basic ${Buffer.from(`${auth.username}:${auth.password}`).toString('base64')}`,
					},
				}),
			});
			
			if (!response.ok) {
				throw new Error(`Elasticsearch search failed: ${response.statusText}`);
			}
			
			return await response.json();
		},
		async index(index: string, document: any, id?: string): Promise<any> {
			const url = id 
				? `${protocol}//${host}:${port}/${index}/_doc/${id}`
				: `${protocol}//${host}:${port}/${index}/_doc`;
				
			const response = await fetch(url, {
				method: 'POST',
				headers,
				body: JSON.stringify(document),
				...(auth && {
					headers: {
						...headers,
						'Authorization': `Basic ${Buffer.from(`${auth.username}:${auth.password}`).toString('base64')}`,
					},
				}),
			});
			
			if (!response.ok) {
				throw new Error(`Elasticsearch indexing failed: ${response.statusText}`);
			}
			
			return await response.json();
		},
	};
}