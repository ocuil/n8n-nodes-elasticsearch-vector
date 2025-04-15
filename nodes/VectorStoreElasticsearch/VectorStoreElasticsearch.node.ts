import type { INodeProperties, INodeType } from 'n8n-workflow';
import { createVectorStoreNode } from './createVectorStoreNode';
import { elasticsearchIndexRLC } from './elasticsearchIndexRLC';
import { createElasticsearchClient, type ElasticsearchCredential } from './Elasticsearch.utils';

// Campos compartidos para el nodo
const sharedFields: INodeProperties[] = [elasticsearchIndexRLC];

// Opciones para la búsqueda
const retrieveFields: INodeProperties[] = [
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
    description: 'Number of similar documents to return',
  },
  {
    displayName: 'Query Field',
    name: 'queryField',
    type: 'string',
    default: 'text',
    description: 'Field in the document to perform semantic search on',
  },
];

export class VectorStoreElasticsearch extends createVectorStoreNode<any>({
  meta: {
    displayName: 'Elasticsearch Vector Store',
    name: 'vectorStoreElasticsearch',
    description: 'Semantic search with Elasticsearch (semantic_text)',
    icon: 'file:elasticsearch.svg',
    docsUrl: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/semantic-search.html',
    credentials: [
      {
        name: 'elasticsearchApi',
        required: true,
      },
    ],
    operationModes: ['retrieve', 'retrieve-as-tool'],
  },
  sharedFields,
  retrieveFields,
  async getVectorStoreClient(context, _filter, _embeddings, itemIndex) {
    // Obtiene credenciales y crea el cliente de Elasticsearch
    const credentials = await context.getCredentials('elasticsearchApi') as ElasticsearchCredential;
    const client = createElasticsearchClient(credentials);
    const index = context.getNodeParameter('elasticsearchIndex', itemIndex, '', { extractValue: true }) as string;
    const queryField = context.getNodeParameter('queryField', itemIndex, 'text') as string;
    // Devuelve un objeto con el cliente y parámetros necesarios
    return { client, index, queryField };
  },
  async populateVectorStore() {
    // Implementa la lógica para insertar documentos en Elasticsearch si lo deseas
    // Por simplicidad, este método puede quedar vacío o lanzar un error si no soportas inserción
    throw new Error('Insert operation is not supported for Elasticsearch Vector Store');
  },
  async similaritySearch(query, k, clientConfig) {
    // Realiza la búsqueda semántica usando semantic_text
    const { client, index, queryField } = clientConfig;
    const response = await client.search({
      index,
      body: {
        size: k,
        query: {
          text_expansion: {
            [queryField]: {
              model_id: 'elastic/semantic-text',
              model_text: query,
            },
          },
        },
      },
    });
    // Formatea los resultados
    return response.hits.hits.map((hit: { _source: any; _score: number }) => ({
      pageContent: hit._source[queryField],
      metadata: hit._source.metadata || {},
      score: hit._score,
    }));
  },
}) {}