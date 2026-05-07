# Neo4j — AI Skill

## Capability
Neo4j graph database service management: install, start/stop, restart, check status, execute Cypher queries, and retrieve connection info. Supports both HTTP API (port 7474) and Bolt protocol (port 7687).

## Auth
JWT token required (Authorization: Bearer TOKEN).

## Service Lifecycle

### Install & Start
- **POST /api/services/install**
  - **Body**: `{ "appId": "neo4j", "installConfig": { "NEO4J_USER": "neo4j", "NEO4J_PASSWORD": "your-password" } }`
  - Password must be at least 8 characters (Neo4j requirement).
  - Docker image `neo4j:latest` is pulled and container is started automatically.
  - Two ports are allocated from host pool (9000–9999):
    - **Primary (HTTP/Browser)**: container port 7474 → auto-assigned host port
    - **Extra (Bolt)**: container port 7687 → auto-assigned host port
  - Volume: `${APP_VOLUME}:/data` — persistent named volume for database files.
  - **Response**: `{ ok, app, port, containerId }`

### Stop
- **POST /api/docker/stop**
  - **Body**: `{ "appId": "neo4j" }`
  - Removes the container and releases both allocated ports.
  - **Response**: `{ ok: true }`

### Restart (Client-Side)
The component.js handles restart by stopping → re-reading config → re-running the container with saved installConfig.

## API Endpoints

### GET /api/services/neo4j
Returns service status and connection details.
- **Response**:
```json
{
  "id": "neo4j",
  "running": true,
  "port": 9005,
  "containerName": "cloudpc-neo4j",
  "internalUrl": "http://cloudpc-neo4j:7474",
  "portMappings": { "7474": 9005, "7687": 9006 },
  "installConfig": { "NEO4J_USER": "neo4j", "NEO4J_PASSWORD": "..." },
  "installedAt": "2026-05-06T..."
}
```
- `port` = host port mapped to container 7474 (HTTP/Browser).
- `portMappings[7687]` = host port mapped to Bolt protocol.

### GET /api/docker/status/neo4j
Low-level Docker container status.
- **Response**: `{ running, containerId, port, portMappings }`

### POST /api/docker/exec
Execute commands inside the running Neo4j container.
- **Body**: `{ "appId": "neo4j", "cmd": ["cypher-shell", "-u", "neo4j", "-p", "PASSWORD", "MATCH (n) RETURN count(n)"] }`
- **Response**: `{ ok: true, stdout: "count(n)\n42\n" }`

## Cypher Query Execution

### Via cypher-shell (docker exec)
```json
POST /api/docker/exec
{
  "appId": "neo4j",
  "cmd": ["cypher-shell", "-u", "neo4j", "-p", "PASSWORD", "MATCH (n) RETURN n LIMIT 10"],
  "timeout": 30000
}
```

### Common Cypher Examples

#### Create nodes
```cypher
CREATE (p:Person {name: 'Alice', age: 30})
CREATE (p:Person {name: 'Bob', age: 25})
```

#### Create relationships
```cypher
MATCH (a:Person {name: 'Alice'}), (b:Person {name: 'Bob'})
CREATE (a)-[:KNOWS {since: 2020}]->(b)
```

#### Query nodes
```cypher
MATCH (n:Person) RETURN n.name, n.age
```

#### Query with relationships
```cypher
MATCH (a:Person)-[r:KNOWS]->(b:Person)
RETURN a.name, type(r), b.name
```

#### Count all nodes
```cypher
MATCH (n) RETURN count(n) AS total_nodes
```

#### Count all relationships
```cypher
MATCH ()-[r]->() RETURN count(r) AS total_relationships
```

#### List all labels
```cypher
CALL db.labels() YIELD label RETURN label
```

#### List all relationship types
```cypher
CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType
```

#### Delete all data (caution)
```cypher
MATCH (n) DETACH DELETE n
```

#### Create index
```cypher
CREATE INDEX FOR (p:Person) ON (p.name)
```

#### Full-text search index
```cypher
CREATE FULLTEXT INDEX personNames FOR (p:Person) ON EACH [p.name]
```

## Connection Info

### External (from host machine)
- **Browser UI**: `http://localhost:{port}` (where port = allocated HTTP port)
- **Bolt**: `bolt://localhost:{boltPort}` (where boltPort = allocated Bolt port)

### Internal (from other Docker containers on cloudpc-net)
- **Browser UI**: `http://cloudpc-neo4j:7474`
- **Bolt**: `bolt://cloudpc-neo4j:7687`

### Driver Connection Strings
- **JavaScript**: `neo4j.driver('bolt://localhost:{boltPort}', neo4j.auth.basic('neo4j', 'PASSWORD'))`
- **Python**: `GraphDatabase.driver('bolt://localhost:{boltPort}', auth=('neo4j', 'PASSWORD'))`
- **Java**: `GraphDatabase.driver("bolt://localhost:{boltPort}", AuthTokens.basic("neo4j", "PASSWORD"))`

## Docker Details

| Property | Value |
|---|---|
| Image | `neo4j:latest` |
| Container name | `cloudpc-neo4j` |
| Network | `cloudpc-net` |
| HTTP port (container) | 7474 |
| Bolt port (container) | 7687 |
| Volume | `${APP_VOLUME}:/data` |
| Env | `NEO4J_AUTH={user}/{password}` |
| Restart policy | `always` |

## Storage
- Service config: `data/users/{username}/services.json` (port allocations, installConfig)
- Database data: Docker named volume `cloudpc-{instanceId}-neo4j`

## Notes
- Neo4j requires a minimum password length of 8 characters.
- The Neo4j Browser UI is accessible at the HTTP port — it provides an interactive Cypher query editor.
- Bolt is the binary protocol used by Neo4j drivers for application connectivity.
- Both ports (HTTP + Bolt) are allocated from the shared 9000–9999 range and persisted in `docker-ports.json`.
- To get the Bolt port programmatically, read `portMappings[7687]` from `/api/services/neo4j`.
