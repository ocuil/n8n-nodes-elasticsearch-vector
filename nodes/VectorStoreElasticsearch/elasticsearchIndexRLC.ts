import type { INodeProperties } from 'n8n-workflow';

export const elasticsearchIndexRLC: INodeProperties = {
  displayName: 'Elasticsearch Index',
  name: 'elasticsearchIndex',
  type: 'string',
  default: '',
  required: true,
  description: 'Name of the Elasticsearch index to use for vector search',
};
