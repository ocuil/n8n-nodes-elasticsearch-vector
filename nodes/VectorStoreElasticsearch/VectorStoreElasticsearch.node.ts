import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { createElasticsearchClient, type ElasticsearchCredential } from './Elasticsearch.utils';

export class VectorStoreElasticsearch implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Elasticsearch Vector Store',
		name: 'vectorStoreElasticsearch',
		group: ['transform'],
		version: 1,
		description: 'Search for documents using semantic search in Elasticsearch',
		defaults: {
			name: 'Elasticsearch Vector Store',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'elasticsearchApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Index Name',
				name: 'indexName',
				type: 'string',
				required: true,
				default: '',
				description: 'Name of the Elasticsearch index to search in',
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '',
				required: true,
				description: 'The semantic query to search for similar documents',
			},
			{
				displayName: 'Top K',
				name: 'topK',
				type: 'number',
				default: 4,
				description: 'The number of similar documents to return',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Obtener credenciales de Elasticsearch
		const credentials = await this.getCredentials('elasticsearchApi') as unknown as ElasticsearchCredential;
		const client = createElasticsearchClient(credentials);

		// Para cada item
		for (let i = 0; i < items.length; i++) {
			try {
				const indexName = this.getNodeParameter('indexName', i) as string;
				const query = this.getNodeParameter('query', i) as string;
				const topK = this.getNodeParameter('topK', i, 4) as number;

				// Ejecutar la búsqueda semántica en Elasticsearch
				// Esta es una implementación simple que usa el query del usuario directamente
				const searchResponse = await client.search({
					index: indexName,
					body: {
						size: topK,
						query: {
							match: {
								"text": query,
							},
						},
					},
				});

				const results = searchResponse.hits.hits.map((hit) => {
					const source = hit._source as Record<string, any>;
					return {
						score: hit._score,
						document: source.text || '',
						metadata: source.metadata || {},
					};
				});

				returnData.push({
					json: {
						success: true,
						query,
						results,
					},
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							success: false,
							error: (error as Error).message,
						},
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, {
					itemIndex: i,
				});
			}
		}

		return [returnData];
	}
}