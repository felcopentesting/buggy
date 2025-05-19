# Repeater Interface Wireframe

```
+----------------------------------------------------------------------------------------------------------------------+
|  [LOGO] Bug Bounty Hunter                                                 [Search]           [Settings] [Profile]     |
+----------------------------------------------------------------------------------------------------------------------+
|                                                                                                                      |
|  +------------------+  +------------------------------------------------------------------------------------------------+
|  | NAVIGATION       |  |                                                                                            |
|  |                  |  |                                REPEATER                                                     |
|  | > Dashboard      |  |                                                                                            |
|  | > Proxy          |  |  +---------------------------+  +--------------------------------------------------+       |
|  | > Repeater       |  |  |                           |  |                                                  |       |
|  | > Crawler        |  |  |  REQUEST COLLECTION       |  |  REQUEST BUILDER                                 |       |
|  | > OWASP Tests    |  |  |                           |  |                                                  |       |
|  | > Ollama AI      |  |  |  [Search: _____________]  |  |  Method: [GET ▼]  URL: [_______________________] |       |
|  | > Reports        |  |  |                           |  |                                                  |       |
|  |                  |  |  |  > Login Requests         |  |  [Raw] [Headers] [Params] [Body] [Auth]          |       |
|  |                  |  |  |    > Valid Login          |  |                                                  |       |
|  | PROJECTS         |  |  |    > Invalid Password     |  |  Host: example.com                               |       |
|  |                  |  |  |    > SQL Injection        |  |  User-Agent: Bug-Bounty-Hunter/1.0               |       |
|  | > Current Project|  |  |  > API Endpoints          |  |  Accept: */*                                     |       |
|  | + New Project    |  |  |    > Get User             |  |  Content-Type: application/json                  |       |
|  |                  |  |  |    > Update Profile       |  |  Content-Length: 42                              |       |
|  |                  |  |  |  > Form Submissions       |  |                                                  |       |
|  |                  |  |  |    > Contact Form         |  |  {                                               |       |
|  | ENVIRONMENT      |  |  |    > Comment Form         |  |    "username": "admin",                          |       |
|  |                  |  |  |                           |  |    "password": "password123"                     |       |
|  | > Production     |  |  |  [+ New Request]          |  |  }                                               |       |
|  | > Testing        |  |  |  [+ New Folder]           |  |                                                  |       |
|  | > Custom         |  |  |                           |  |  [Send]  [Save]  [Reset]                         |       |
|  |                  |  |  +---------------------------+  +--------------------------------------------------+       |
|  |                  |  |                                                                                            |
|  |                  |  |  +-----------------------------------------------------------------------------+           |
|  |                  |  |  |                                                                             |           |
|  |                  |  |  |  RESPONSE VIEWER                                                            |           |
|  |                  |  |  |                                                                             |           |
|  |                  |  |  |  Status: 200 OK  |  Time: 230ms  |  Size: 24 KB                            |           |
|  |                  |  |  |                                                                             |           |
|  |                  |  |  |  [Raw] [Headers] [Preview] [Rendered] [Ollama Analysis]                     |           |
|  |                  |  |  |                                                                             |           |
|  |                  |  |  |  HTTP/1.1 200 OK                                                            |           |
|  |                  |  |  |  Content-Type: application/json                                             |           |
|  |                  |  |  |  Content-Length: 24576                                                      |           |
|  |                  |  |  |  Cache-Control: no-cache                                                    |           |
|  |                  |  |  |                                                                             |           |
|  |                  |  |  |  {                                                                          |           |
|  |                  |  |  |    "status": "success",                                                     |           |
|  |                  |  |  |    "data": {                                                                |           |
|  |                  |  |  |      "user_id": 123,                                                        |           |
|  |                  |  |  |      "username": "admin",                                                   |           |
|  |                  |  |  |      "role": "administrator"                                                |           |
|  |                  |  |  |    }                                                                        |           |
|  |                  |  |  |  }                                                                          |           |
|  |                  |  |  |                                                                             |           |
|  +------------------+  |  +-----------------------------------------------------------------------------+           |
|                        |                                                                                            |
|                        +--------------------------------------------------------------------------------------------+
|                                                                                                                      |
|  [Environment: Production]    [Requests Sent: 12]    [Ollama: Active]    [Response Time: 230ms]                      |
+----------------------------------------------------------------------------------------------------------------------+
```

## Key Elements

1. **Request Collection**
   - Hierarchical organization of saved requests in folders
   - Search functionality for finding specific requests
   - New request and folder creation buttons
   - Context menu for additional operations (duplicate, delete, etc.)

2. **Request Builder**
   - Method selector dropdown (GET, POST, PUT, DELETE, etc.)
   - URL input field with autocomplete from history
   - Tabbed interface for different request components
   - Syntax highlighting for request body
   - Environment variable support with variable substitution
   - Send, Save, and Reset buttons

3. **Response Viewer**
   - Status, timing, and size information prominently displayed
   - Tabbed interface for different views of the response
   - Raw view showing complete response
   - Headers view for examining response headers
   - Preview and Rendered views for content visualization
   - Ollama Analysis tab for AI-powered vulnerability detection

4. **Environment Selector**
   - Quick switching between different environments
   - Environment-specific variables for request templating
   - Custom environment creation and configuration

5. **Status Bar**
   - Current environment indicator
   - Request count
   - Ollama connection status
   - Latest response time

## Interaction Points

- Double-clicking a saved request loads it into the request builder
- Tabs in editors switch between different views
- Send button executes the current request
- Save button stores the current request in the collection
- Environment selector changes variable context for requests
- Ollama Analysis tab provides AI insights about potential vulnerabilities
