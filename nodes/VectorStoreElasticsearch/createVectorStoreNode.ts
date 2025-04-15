import type { INodeProperties, INodeType, INodeTypeDescription, IExecuteFunctions, Icon } from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

export interface VectorStoreNodeArgs {
  meta: {
    displayName: string;
    name: string;
    description: string;
    icon: string;
    docsUrl: string;
    credentials: { name: string; required: boolean }[];
    operationModes: string[];
  };
  sharedFields: INodeProperties[];
  retrieveFields: INodeProperties[];
  getVectorStoreClient: (context: IExecuteFunctions, filter: any, embeddings: any, itemIndex: number) => Promise<any>;
  populateVectorStore: (context: IExecuteFunctions, embeddings: any, documents: any, itemIndex: number) => Promise<any>;
  similaritySearch: (query: string, k: number, clientConfig: any) => Promise<any[]>;
}

export function createVectorStoreNode<T = any>(args: VectorStoreNodeArgs): new () => INodeType {
  return class VectorStoreNode implements INodeType {
    description: INodeTypeDescription = {
      displayName: args.meta.displayName,
      name: args.meta.name,
      description: args.meta.description,
      icon: args.meta.icon as Icon,
      group: ['transform'],
      inputs: [NodeConnectionType.Main],
      outputs: [NodeConnectionType.Main],
      version: 1,
      defaults: {
        name: args.meta.displayName,
      },
      credentials: args.meta.credentials,
      properties: [
        ...args.sharedFields,
        ...args.retrieveFields,
      ],
    };

    async execute(this: IExecuteFunctions): Promise<any[][]> {
      const items = this.getInputData();
      const returnData = [];
      for (let i = 0; i < items.length; i++) {
        const query = this.getNodeParameter('query', i, '') as string;
        const topK = this.getNodeParameter('topK', i, 4) as number;
        const clientConfig = await args.getVectorStoreClient(this, undefined, undefined, i);
        const results = await args.similaritySearch(query, topK, clientConfig);
        returnData.push({ json: { results } });
      }
      return [returnData];
    }
  };
}
