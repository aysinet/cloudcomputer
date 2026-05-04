# Requestly — AI Skill

## Capability
HTTP request testing tool (Postman-like): send requests, save history, organize into collections/projects.

## Auth
JWT token required.

## API Endpoints

### GET /api/requestly/data
Gets saved request data (collections/projects, history, environments).

### POST /api/requestly/data
Saves request data.
- **Body**: `{ collections, history, environments }`

### POST /api/requestly/send
Sends an HTTP request (proxy).
- **Body**: `{ url, method, headers?, body?, timeout? }`
- **Response**: `{ status, statusText, headers, body, time }` // "data" is now "body" based on requestly's api shape in component.js

## Storage
JSON file — `data/users/{username}/requestly-data.json`

---

## AI Project & Test Runner Guide

Requestly supports multiple **Projects** (also referred to as `collections`). The AI can create projects, add tests (requests), and execute them automatically by running a Node.js script against the user's data file and the proxy endpoint.

### Method Structure & Example
Write a Node.js script locally (e.g., `tests-runner.js`) using the `node-fetch` module or built-in `fetch` to manipulate `requestly-data.json` and run requests via `http://localhost:3000/api/requestly/send`.

```javascript
// Example AI Script: Add a Project, Request, and Run Test
const fs = require('fs');

// Note: Ensure you get the correct JWT token from environment or config,
// For local execution against the desktop.js server, we map it to standard HTTP requests.
// Here is a simpler approach: direct file manipulation + fetch using absolute URLs.
async function manageAndRunTests() {
  const dataPath = 'c:/dv/cloudcomputer/data/users/scorpio/requestly-data.json';
  
  // 1. Read Data
  let data = { collections: [], history: [], environments: [] };
  if (fs.existsSync(dataPath)) {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  }

  // 2. Create Project (Collection)
  const newProject = {
    id: 'proj_' + Date.now(),
    name: 'My New AI DB Project',
    items: [],
    variables: []
  };

  // 3. Add Test Request Structure to Project
  const newTestRequest = {
    id: 'req_' + Date.now(),
    name: 'Get Users Test',
    type: 'request',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/users/1',
    headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
    params: [{ key: '', value: '', enabled: true }],
    bodyType: 'none',
    requestTab: 'params',
    responseTab: 'pretty',
    response: null
  };
  
  newProject.items.push(newTestRequest);
  data.collections.push(newProject);
  
  // Save updated data (Project & Test Request added)
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log('Project and Test Request created successfully!');

  // 4. Run the Test and Get Results
  console.log(`Running test: ${newTestRequest.name} (${newTestRequest.url})`);
  try {
     // NOTE: Replace with direct fetch since AI operates natively in node
     const res = await fetch(newTestRequest.url, {
       method: newTestRequest.method,
       headers: { 'Accept': 'application/json' }
     });
     
     const status = res.status;
     const resultBody = await res.text();
     
     console.log('Test Status:', status);
     console.log('Test Result:', resultBody);
     
     // Evaluate condition
     if (status === 200) {
        console.log('Test Passed!');
     } else {
        console.log('Test Failed!');
     }
  } catch (error) {
     console.error('Test Execution Error:', error);
  }
}

manageAndRunTests();
```

By following this pattern, the AI can:
1. Parse the JSON file directly.
2. Initialize or modify projects in the `collections` array.
3. Fetch endpoints natively inside Node.js to evaluate assertions.
4. Output the results.
