import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ElasticsearchApi implements ICredentialType {
	name = 'elasticsearchApi';
	displayName = 'Elasticsearch API';
	documentationUrl = 'https://www.elastic.co/guide/en/elasticsearch/reference/current/rest-apis.html';
	properties: INodeProperties[] = [
		{
			displayName: 'Host URL',
			name: 'url',
			type: 'string',
			default: 'http://localhost:9200',
			placeholder: 'https://elasticsearch-domain.com',
			description: 'The URL of your Elasticsearch instance',
			required: true,
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			description: 'Username for authentication with Elasticsearch',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
			description: 'Password for authentication with Elasticsearch',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
			description: 'API Key for authentication with Elasticsearch (if not using Username/Password)',
		},
	];
}