import type { Callbacks } from '@langchain/core/callbacks/manager';
import type { Embeddings } from '@langchain/core/embeddings';
import { Document } from '@langchain/core/documents';
import type { IDataObject, INodeProperties, IExecuteFunctions } from 'n8n-workflow';

import { ElasticsearchVectorStore, type ElasticsearchLibArgs } from './ElasticsearchVectorStore';
import { createElasticsearchClient, type ElasticsearchCredential } from './utils/Elasticsearch.utils';

// Clase extendida para soportar filtros por defecto
class ExtendedElasticsearchVectorStore extends ElasticsearchVectorStore {
	private static defaultFilter: IDataObject = {};

	static async fromExistingIndex(
		embeddings: Embeddings,
		args: ElasticsearchLibArgs,
		defaultFilter: IDataObject = {},
	): Promise<ElasticsearchVectorStore> {
		ExtendedElasticsearchVectorStore.defaultFilter = defaultFilter;
		return new this(embeddings, args);
	}

	async similaritySearch(
		query: string,
		k: number,
		filter?: IDataObject,
		callbacks?: Callbacks | undefined,
	) {
		const mergedFilter = { ...ExtendedElasticsearchVectorStore.defaultFilter, ...filter };
		return await super.similaritySearch(query, k, mergedFilter, callbacks);
	}
}

// Campo para seleccionar el índice de Elasticsearch
const elasticsearchIndexField: INodeProperties = {
	displayName: 'Index',
	name: 'elasticsearchIndex',
	type: 'string',
	default: '',
	required: true,
	description: 'The Elasticsearch index to use',
};

const sharedFields: INodeProperties[] = [elasticsearchIndexField];

const insertFields: INodeProperties[] = [
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [
			{
				displayName: 'Semantic Field',
				name: 'semanticField',
				type: 'string',
				default: 'content_semantic',
				description: 'Field name with semantic_text type',
			},
			{
				displayName: 'Text Field',
				name: 'textField',
				type: 'string',
				default: 'content',
				description: 'Field name for storing text content',
			},
		],
	},
];

const retrieveFields: INodeProperties[] = [
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [
			{
				displayName: 'Search Filter',
				name: 'searchFilterJson',
				type: 'json',
				typeOptions: {
					rows: 5,
				},
				default: '{}',
				validateType: 'object',
				description: 'Filter to apply to the search',
			},
			{
				displayName: 'Semantic Field',
				name: 'semanticField',
				type: 'string',
				default: 'content_semantic',
				description: 'Field name with semantic_text type',
			},
			{
				displayName: 'Text Field',
				name: 'textField',
				type: 'string',
				default: 'content',
				description: 'Field name for storing text content',
			},
		],
	},
];

// Simulación del createVectorStoreNode para nuestro caso
// Ya que no tenemos acceso al original
const createVectorStoreNodeMock = <T extends ElasticsearchVectorStore>(options: {
	meta: {
		displayName: string;
		name: string;
		description: string;
		icon: string;
		docsUrl?: string;
		credentials: { name: string; required: boolean }[];
	};
	methods?: Record<string, any>;
	loadFields?: INodeProperties[];
	insertFields: INodeProperties[];
	sharedFields: INodeProperties[];
	retrieveFields: INodeProperties[];
	getVectorStoreClient: (
		context: IExecuteFunctions,
		filter: IDataObject,
		embeddings: Embeddings,
		itemIndex: number,
	) => Promise<T>;
	populateVectorStore: (
		context: IExecuteFunctions,
		embeddings: Embeddings,
		documents: Document[],
		itemIndex: number,
	) => Promise<void>;
}) => {
	return class {
		description = {
			displayName: options.meta.displayName,
			name: options.meta.name,
			icon: options.meta.icon,
			group: ['transform', 'input'],
			version: 1,
			description: options.meta.description,
			defaults: {
				name: options.meta.displayName,
			},
			inputs: ['main'],
			outputs: ['main'],
			credentials: options.meta.credentials,
			properties: [
				{
					displayName: 'Operation',
					name: 'operation',
					type: 'options',
					noDataExpression: true,
					options: [
						{
							name: 'Get Documents',
							value: 'getDocuments',
							description: 'Get documents from the vector store',
							action: 'Get documents from the vector store',
						},
						{
							name: 'Insert Documents',
							value: 'insertDocuments',
							description: 'Insert documents into the vector store',
							action: 'Insert documents into the vector store',
						},
					],
					default: 'getDocuments',
				},
				...options.sharedFields,
				{
					displayName: 'Query',
					name: 'query',
					type: 'string',
					required: true,
					displayOptions: {
						show: {
							operation: ['getDocuments'],
						},
					},
					default: '',
					description: 'The query to search for similar documents',
				},
				{
					displayName: 'Top K',
					name: 'topK',
					type: 'number',
					displayOptions: {
						show: {
							operation: ['getDocuments'],
						},
					},
					default: 4,
					description: 'Number of documents to return',
				},
				...options.retrieveFields,
				{
					displayName: 'Text',
					name: 'text',
					type: 'string',
					typeOptions: {
						rows: 4,
					},
					displayOptions: {
						show: {
							operation: ['insertDocuments'],
						},
					},
					default: '',
					description: 'Text to insert as a document',
				},
				{
					displayName: 'Add Custom Metadata',
					name: 'metadata',
					type: 'json',
					displayOptions: {
						show: {
							operation: ['insertDocuments'],
						},
					},
					default: '{}',
					description: 'Additional metadata to add to the document',
				},
				...options.insertFields,
			],
			codex: {
				categories: ['AI', 'Data & Storage'],
				subcategories: {
					AI: ['Vector Databases'],
				},
				alias: ['vector store', 'elasticsearch', 'semantic search'],
				resources: {
					primaryDocumentation: [
						{
							url: 'https://github.com/ocuil/n8n-nodes-elasticsearch-vector',
						},
					],
				},
			},
		};

		async execute(this: IExecuteFunctions) {
			const items = this.getInputData();
			const returnData: IDataObject[] = [];

			// Dummy embeddings since Elasticsearch handles this internally
			const embeddings = {
				embedQuery: async () => [],
				embedDocuments: async () => [],
			} as unknown as Embeddings;

			for (let i = 0; i < items.length; i++) {
				const operation = this.getNodeParameter('operation', i) as string;

				// Get search filter if available
				const filterOptions = this.getNodeParameter('options', i, {}) as IDataObject;
				const filter = filterOptions.searchFilterJson
					? JSON.parse(filterOptions.searchFilterJson as string)
					: {};

				// Get vector store client
				const vectorStore = await options.getVectorStoreClient(this, filter, embeddings, i);

				if (operation === 'getDocuments') {
					const query = this.getNodeParameter('query', i) as string;
					const topK = this.getNodeParameter('topK', i) as number;

					const documents = await vectorStore.similaritySearch(query, topK, filter);

					// Format the results
					returnData.push({
						documents: documents.map((doc) => ({
							pageContent: doc.pageContent,
							metadata: doc.metadata,
						})),
					});
				} else if (operation === 'insertDocuments') {
					const text = this.getNodeParameter('text', i) as string;
					const metadata = JSON.parse(
						this.getNodeParameter('metadata', i) as string || '{}',
					) as Record<string, unknown>;

					const document = new Document({ pageContent: text, metadata });
					
					await options.populateVectorStore(this, embeddings, [document], i);

					returnData.push({
						success: true,
						documentsInserted: 1,
					});
				}
			}

			return [this.helpers.returnJsonArray(returnData)];
		}
	};
};

// Implementación de la clase VectorStoreElasticsearch
export class VectorStoreElasticsearch extends createVectorStoreNodeMock<ExtendedElasticsearchVectorStore>({
	meta: {
		displayName: 'Elasticsearch Vector Store',
		name: 'vectorStoreElasticsearch',
		description: 'Work with Elasticsearch semantic_text fields for vector search',
		icon: 'file:elasticsearch.svg',
		credentials: [
			{
				name: 'elasticsearchApi',
				required: true,
			},
		],
	},
	sharedFields,
	insertFields,
	retrieveFields,
	loadFields: retrieveFields,
	async getVectorStoreClient(context, filter, embeddings, itemIndex) {
		const indexName = context.getNodeParameter('elasticsearchIndex', itemIndex) as string;
		const options = context.getNodeParameter('options', itemIndex, {}) as {
			semanticField?: string;
			textField?: string;
		};
		
		const semanticField = options.semanticField || 'content_semantic';
		const textField = options.textField || 'content';
		
		const credentials = await context.getCredentials('elasticsearchApi') as ElasticsearchCredential;
		const client = createElasticsearchClient(credentials);
		
		const config: ElasticsearchLibArgs = {
			client,
			indexName,
			semanticField,
			textField,
		};
		
		return await ExtendedElasticsearchVectorStore.fromExistingIndex(embeddings, config, filter);
	},
	async populateVectorStore(context, embeddings, documents, itemIndex) {
		const indexName = context.getNodeParameter('elasticsearchIndex', itemIndex) as string;
		const options = context.getNodeParameter('options', itemIndex, {}) as {
			semanticField?: string;
			textField?: string;
		};
		
		const semanticField = options.semanticField || 'content_semantic';
		const textField = options.textField || 'content';
		
		const credentials = await context.getCredentials('elasticsearchApi') as ElasticsearchCredential;
		const client = createElasticsearchClient(credentials);
		
		const config: ElasticsearchLibArgs = {
			client,
			indexName,
			semanticField,
			textField,
		};
		
		await ElasticsearchVectorStore.fromDocuments(documents, embeddings, config);
	},
}) {}
