![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-elasticsearch-vector

This is an n8n community node. It lets you use Elasticsearch in your n8n workflows.

Elasticsearch is a distributed, RESTful search and analytics engine capable of handling structured and unstructured data. This node leverages Elasticsearch's `semantic_text` feature for semantic search and hybrid queries.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  
[Version history](#version-history)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

This node supports the following operations:

### Index Management
- Create an index with `semantic_text` mappings.
- Delete an index.

### Document Management
- Create a document with `semantic_text` fields.
- Get a document by ID.
- Delete a document by ID.

### Search
- Perform semantic searches using `semantic_text` fields.
- Execute custom searches using user-defined query templates.

## Credentials

To use this node, you need to authenticate with an Elasticsearch instance. Follow these steps:

1. Ensure you have an Elasticsearch instance running (version 8.9 or higher).
2. Obtain the necessary credentials (e.g., API Key, username, and password).
3. Configure the credentials in n8n by selecting "Elasticsearch API" in the node's credentials section.

## Compatibility

- Minimum n8n version: 0.200.0
- Tested with Elasticsearch version 8.9 and above.

## Usage

### Example: Hybrid Search Query

This node allows you to perform hybrid searches combining semantic and lexical queries. For example:

```json
{
  "retriever": {
    "rrf": {
      "retrievers": [
        {
          "standard": {
            "query": {
              "semantic": {
                "field": "respuesta_semantic",
                "query": "{query}"
              }
            }
          }
        },
        {
          "standard": {
            "query": {
              "match": {
                "respuesta": {
                  "query": "{query}"
                }
              }
            }
          }
        }
      ]
    }
  }
}
```

Replace `{query}` with your search term.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Elasticsearch documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)

## Version history

- **0.1.0**: Initial release with support for `semantic_text` fields, index management, document management, and search operations.

## Licencia

Apache License 2.0

Copyright 2025 Alejandro Sánchez Losa (alejandrosl@gmail.com)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
