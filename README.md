![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-elasticsearch-vector

Este es un nodo de comunidad para n8n que permite realizar búsquedas semánticas en Elasticsearch usando el campo `semantic_text`.

- Permite búsquedas semánticas sobre un índice de Elasticsearch sin necesidad de definir o gestionar modelos de embeddings manualmente.
- Diseñado para integrarse como Tool en el nodo "AI Agent (Tools Agent)" de n8n.
- No implementa operaciones de gestión de índices ni CRUD de documentos.

[n8n](https://n8n.io/) es una plataforma de automatización de flujos de trabajo con licencia [fair-code](https://docs.n8n.io/reference/license/).

[Instalación](#instalación)  
[Operación soportada](#operación-soportada)  
[Credenciales](#credenciales)  
[Compatibilidad](#compatibilidad)  
[Uso](#uso)  
[Recursos](#recursos)  
[Historial de versiones](#historial-de-versiones)  

## Instalación

Sigue la [guía oficial de instalación de nodos de comunidad](https://docs.n8n.io/integrations/community-nodes/installation/).

## Operación soportada

- **Búsqueda semántica**: realiza consultas semánticas sobre un índice de Elasticsearch usando el modelo `semantic_text` integrado en Elasticsearch 8.9+.

## Credenciales

1. Asegúrate de tener una instancia de Elasticsearch (v8.9 o superior) con el modelo semantic_text habilitado.
2. Obtén las credenciales necesarias (API Key, usuario y contraseña, etc).
3. Configura las credenciales en n8n seleccionando "Elasticsearch API" en el nodo.

## Compatibilidad

- Versión mínima de n8n: 0.200.0
- Probado con Elasticsearch 8.9+

## Uso

### Como Tool en el AI Agent

1. Añade el nodo "AI Agent (Tools Agent)" en tu flujo de n8n.
2. En la sección Tool, selecciona "Elasticsearch Vector Store".
3. Configura el índice y los parámetros de búsqueda.
4. El agente podrá realizar búsquedas semánticas sobre tu índice de Elasticsearch usando el modelo `semantic_text`.

#### Ejemplo de configuración

- **Elasticsearch Index**: nombre del índice donde tienes tus documentos vectorizados.
- **Query**: texto de la consulta semántica.
- **Top K**: número de resultados a devolver.
- **Query Field**: campo sobre el que se realiza la búsqueda (por defecto `text`).

## Recursos

- [Documentación de nodos de comunidad n8n](https://docs.n8n.io/integrations/community-nodes/)
- [Documentación de Elasticsearch semantic_text](https://www.elastic.co/guide/en/elasticsearch/reference/current/semantic-search.html)

## Historial de versiones

- **0.1.0**: Primera versión. Búsqueda semántica como Tool para el AI Agent de n8n.

## Licencia

Apache License 2.0

Copyright 2025 Alejandro Sánchez Losa (alejandrosl@gmail.com)

Licenciado bajo la Apache License, Version 2.0 (la "Licencia");
puedes no usar este archivo excepto en cumplimiento con la Licencia.
Puedes obtener una copia de la Licencia en

    http://www.apache.org/licenses/LICENSE-2.0

A menos que lo requiera la ley aplicable o se acuerde por escrito, el software
se distribuye "TAL CUAL", SIN GARANTÍAS NI CONDICIONES DE NINGÚN TIPO,
ni expresas ni implícitas. Consulta la Licencia para el lenguaje específico
gobernando permisos y limitaciones bajo la Licencia.
