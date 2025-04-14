import { VectorStore } from '@langchain/core/vectorstores';
import { Embeddings } from '@langchain/core/embeddings';
import { Document } from '@langchain/core/documents';
import { Callbacks } from '@langchain/core/callbacks/manager';

export interface ElasticsearchLibArgs {
	client: any;
	indexName: string;
	semanticField?: string;
	textField?: string;
}

export class ElasticsearchVectorStore extends VectorStore {
	client: any;
	indexName: string;
	semanticField: string;
	textField: string;

	_vectorstoreType(): string {
		return 'elasticsearch';
	}

	constructor(embeddings: Embeddings, args: ElasticsearchLibArgs) {
		super(embeddings, args);
		this.client = args.client;
		this.indexName = args.indexName;
		this.semanticField = args.semanticField || 'content_semantic';
		this.textField = args.textField || 'content';
	}

	/**
	 * Create an ElasticsearchVectorStore from documents
	 */
	static async fromDocuments(
		docs: Document[],
		embeddings: Embeddings,
		args: ElasticsearchLibArgs,
	): Promise<ElasticsearchVectorStore> {
		const store = new this(embeddings, args);
		await store.addDocuments(docs);
		return store;
	}

	/**
	 * Create an ElasticsearchVectorStore from an existing index
	 */
	static async fromExistingIndex(
		embeddings: Embeddings,
		args: ElasticsearchLibArgs,
	): Promise<ElasticsearchVectorStore> {
		return new this(embeddings, args);
	}

	/**
	 * Add documents to the vector store
	 */
	async addDocuments(documents: Document[]): Promise<void> {
		for (const doc of documents) {
			const metadata = { ...doc.metadata };
			const docToIndex = {
				[this.textField]: doc.pageContent,
				metadata,
			};
			
			await this.client.index(this.indexName, docToIndex);
		}
	}
	
	/**
	 * Add vectors to the vector store
	 * This is required by the VectorStore base class
	 */
	async addVectors(vectors: number[][], documents: Document[]): Promise<void> {
		// Elasticsearch with semantic_text handles embeddings internally
		// so we just add the documents normally
		await this.addDocuments(documents);
	}

	/**
	 * Delete documents from the vector store
	 */
	async delete(params: { ids: string[] }): Promise<void> {
		throw new Error('Method not implemented: delete');
	}

	/**
	 * Search for similar documents in the vector store
	 */
	async similaritySearch(
		query: string,
		k = 4,
		_filter?: any,
		_callbacks?: Callbacks,
	): Promise<Document[]> {
		const body = {
			size: k,
			query: {
				semantic: {
					field: this.semanticField,
					query: query,
				},
			},
		};

		const result = await this.client.search(this.indexName, body);
		
		return result.hits.hits.map((hit: any) => {
			const source = hit._source;
			const pageContent = source[this.textField] || '';
			const metadata = source.metadata || {};
			
			return new Document({ pageContent, metadata });
		});
	}
	
	/**
	 * Search for similar documents by vector
	 * This is required by the VectorStore base class
	 */
	async similaritySearchVectorWithScore(
		query: number[],
		k: number,
		filter?: any
	): Promise<[Document, number][]> {
		// For Elasticsearch with semantic_text, we don't use vectors directly
		// This is a placeholder implementation
		const queryText = "This is a placeholder query";
		const docs = await this.similaritySearch(queryText, k, filter);
		
		// Return docs with placeholder score
		return docs.map(doc => [doc, 1.0]);
	}

	/**
	 * Search with a custom query template
	 */
	async customSearch(
		query: string,
		queryTemplate: string,
		k = 4,
	): Promise<Document[]> {
		// Replace {query} placeholders with the actual query
		const bodyStr = queryTemplate.replace(/\{query\}/g, query);
		const body = {
			size: k,
			...JSON.parse(bodyStr),
		};

		const result = await this.client.search(this.indexName, body);
		
		return result.hits.hits.map((hit: any) => {
			const source = hit._source;
			const pageContent = source[this.textField] || '';
			const metadata = source.metadata || {};
			
			return new Document({ pageContent, metadata });
		});
	}

	/**
	 * Get the store type
	 */
	static get _stores(): Record<string, typeof ElasticsearchVectorStore> {
		return {
			elasticsearch: this,
		};
	}
}