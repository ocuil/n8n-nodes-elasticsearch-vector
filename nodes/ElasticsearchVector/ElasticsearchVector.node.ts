import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
} from 'n8n-workflow';

export class ElasticsearchVector implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Elasticsearch Vector Store',
		name: 'elasticsearchVector',
		icon: 'file:elasticsearch.svg',
		group: ['transform', 'input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Work with Elasticsearch semantic_text fields for vector search',
		defaults: {
			name: 'Elasticsearch Vector Store',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'elasticsearchApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.url}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		codex: {
			categories: ['AI', 'Data & Storage'],
			subcategories: {
				AI: ['Vector Databases'],
				'Data & Storage': ['Databases', 'Search']
			},
			alias: ['vector store', 'semantic search', 'elasticsearch'],
			resources: {
				primaryDocumentation: [
					{
						url: 'https://github.com/ocuil/n8n-nodes-elasticsearch-vector',
					},
				],
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Index',
						value: 'index',
					},
					{
						name: 'Document',
						value: 'document',
					},
					{
						name: 'Search',
						value: 'search',
					},
				],
				default: 'search',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [
							'document',
						],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a document with semantic_text fields',
						action: 'Create a document with semantic text fields',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a document',
						action: 'Get a document',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a document',
						action: 'Delete a document',
					},
				],
				default: 'create',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [
							'index',
						],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create an index with semantic_text mappings',
						action: 'Create an index with semantic text mappings',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete an index',
						action: 'Delete an index',
					},
				],
				default: 'create',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [
							'search',
						],
					},
				},
				options: [
					{
						name: 'Semantic Search',
						value: 'semanticSearch',
						description: 'Search documents using semantic_text fields',
						action: 'Search documents using semantic text fields',
					},
					{
						name: 'Custom Search',
						value: 'customSearch',
						description: 'Custom search with query template',
						action: 'Custom search with query template',
					},
				],
				default: 'semanticSearch',
			},
			// Index name field for all operations
			{
				displayName: 'Index Name',
				name: 'index',
				type: 'string',
				default: '',
				required: true,
				description: 'Name of the index to operate on',
			},
			// Document specific fields
			{
				displayName: 'Document ID',
				name: 'documentId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'document',
						],
						operation: [
							'get',
							'delete',
						],
					},
				},
				description: 'ID of the document',
			},
			{
				displayName: 'JSON Document',
				name: 'jsonDocument',
				type: 'json',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'document',
						],
						operation: [
							'create',
						],
					},
				},
				description: 'Document data in JSON format with fields that will be processed as semantic_text',
			},
			// Index creation fields
			{
				displayName: 'Index Mappings',
				name: 'indexMappings',
				type: 'json',
				default: '{\n  "mappings": {\n    "properties": {\n      "content": {\n        "type": "text",\n        "copy_to": ["content_semantic"]\n      },\n      "content_semantic": {\n        "type": "semantic_text",\n        "inference_id": "e5"\n      }\n    }\n  }\n}',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'index',
						],
						operation: [
							'create',
						],
					},
				},
				description: 'Index mappings with semantic_text field configuration',
			},
			// Semantic search fields
			{
				displayName: 'Semantic Field',
				name: 'semanticField',
				type: 'string',
				default: 'content_semantic',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'search',
						],
						operation: [
							'semanticSearch',
						],
					},
				},
				description: 'Name of the semantic_text field to search',
			},
			{
				displayName: 'Query Text',
				name: 'queryText',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'search',
						],
						operation: [
							'semanticSearch',
						],
					},
				},
				description: 'Text to search for in the semantic field',
			},
			{
				displayName: 'Results Size',
				name: 'k',
				type: 'number',
				default: 10,
				required: true,
				displayOptions: {
					show: {
						resource: [
							'search',
						],
					},
				},
				description: 'Number of results to return',
			},
			// Custom search fields
			{
				displayName: 'Query Template',
				name: 'queryTemplate',
				type: 'json',
				default: '{\n  "retriever": {\n    "rrf": {\n      "retrievers": [\n        {\n          "standard": {\n            "query": {\n              "semantic": {\n                "field": "content_semantic",\n                "query": "{query}"\n              }\n            }\n          }\n        },\n        {\n          "standard": {\n            "query": {\n              "match": {\n                "content": {\n                  "query": "{query}"\n                }\n              }\n            }\n          }\n        }\n      ]\n    }\n  }\n}',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'search',
						],
						operation: [
							'customSearch',
						],
					},
				},
				description: 'Custom query template with {query} placeholders that will be replaced with the search term',
			},
			{
				displayName: 'Search Term',
				name: 'searchTerm',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'search',
						],
						operation: [
							'customSearch',
						],
					},
				},
				description: 'Search term to replace {query} in the template',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		let responseData;
		
		// Get credentials for Elasticsearch API
		const credentials = await this.getCredentials('elasticsearchApi');
		
		// Initialize request options
		const options: IHttpRequestOptions = {
			url: '',
			method: 'GET',
			qs: {},
			body: {},
			json: true,
		};
		
		// Add authentication if provided
		if (credentials.username && credentials.password) {
			options.auth = {
				username: credentials.username as string,
				password: credentials.password as string,
			};
		} else if (credentials.apiKey) {
			options.headers = {
				...options.headers,
				'Authorization': `ApiKey ${credentials.apiKey}`,
			};
		}
		
		// Process each item
		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const index = this.getNodeParameter('index', i) as string;
				
				if (resource === 'document') {
					if (operation === 'create') {
						// Create document with semantic_text fields
						const jsonDocument = this.getNodeParameter('jsonDocument', i) as string;
						const parsedDocument = JSON.parse(jsonDocument);
						
						options.method = 'POST';
						options.url = `${credentials.url}/${index}/_doc`;
						options.body = parsedDocument;
						
						responseData = await this.helpers.requestWithAuthentication.call(this, 'elasticsearchApi', options);
					} else if (operation === 'get') {
						// Get document
						const documentId = this.getNodeParameter('documentId', i) as string;
						
						options.method = 'GET';
						options.url = `${credentials.url}/${index}/_doc/${documentId}`;
						
						responseData = await this.helpers.requestWithAuthentication.call(this, 'elasticsearchApi', options);
					} else if (operation === 'delete') {
						// Delete document
						const documentId = this.getNodeParameter('documentId', i) as string;
						
						options.method = 'DELETE';
						options.url = `${credentials.url}/${index}/_doc/${documentId}`;
						
						responseData = await this.helpers.requestWithAuthentication.call(this, 'elasticsearchApi', options);
					}
				} else if (resource === 'index') {
					if (operation === 'create') {
						// Create index with semantic_text mappings
						const indexMappings = this.getNodeParameter('indexMappings', i) as string;
						const parsedMappings = JSON.parse(indexMappings);
						
						options.method = 'PUT';
						options.url = `${credentials.url}/${index}`;
						options.body = parsedMappings;
						
						responseData = await this.helpers.requestWithAuthentication.call(this, 'elasticsearchApi', options);
					} else if (operation === 'delete') {
						// Delete index
						options.method = 'DELETE';
						options.url = `${credentials.url}/${index}`;
						
						responseData = await this.helpers.requestWithAuthentication.call(this, 'elasticsearchApi', options);
					}
				} else if (resource === 'search') {
					if (operation === 'semanticSearch') {
						// Perform semantic search
						const semanticField = this.getNodeParameter('semanticField', i) as string;
						const queryText = this.getNodeParameter('queryText', i) as string;
						const k = this.getNodeParameter('k', i) as number;
						
						options.method = 'POST';
						options.url = `${credentials.url}/${index}/_search`;
						options.body = {
							"size": k,
							"query": {
								"semantic": {
									"field": semanticField,
									"query": queryText
								}
							}
						};
						
						responseData = await this.helpers.requestWithAuthentication.call(this, 'elasticsearchApi', options);
					} else if (operation === 'customSearch') {
						// Perform custom search with template
						const queryTemplate = this.getNodeParameter('queryTemplate', i) as string;
						const searchTerm = this.getNodeParameter('searchTerm', i) as string;
						const k = this.getNodeParameter('k', i) as number;
						
						// Replace {query} placeholders with actual search term
						const modifiedQuery = queryTemplate.replace(/\{query\}/g, searchTerm);
						
						options.method = 'POST';
						options.url = `${credentials.url}/${index}/_search`;
						options.body = {
							"size": k,
							...JSON.parse(modifiedQuery)
						};
						
						responseData = await this.helpers.requestWithAuthentication.call(this, 'elasticsearchApi', options);
					}
				}
				
				// Add response data to return data
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: error.message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				throw error;
			}
		}
		
		return [returnData];
	}
}