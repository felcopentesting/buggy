# Crawler Interface Wireframe

```
+----------------------------------------------------------------------------------------------------------------------+
|  [LOGO] Bug Bounty Hunter                                                 [Search]           [Settings] [Profile]     |
+----------------------------------------------------------------------------------------------------------------------+
|                                                                                                                      |
|  +------------------+  +------------------------------------------------------------------------------------------------+
|  | NAVIGATION       |  |                                                                                            |
|  |                  |  |                                CRAWLER                                                      |
|  | > Dashboard      |  |                                                                                            |
|  | > Proxy          |  |  +---------------------------+  +--------------------------------------------------+       |
|  | > Repeater       |  |  |                           |  |                                                  |       |
|  | > Crawler        |  |  |  CONFIGURATION            |  |  SITE MAP VISUALIZATION                          |       |
|  | > OWASP Tests    |  |  |                           |  |                                                  |       |
|  | > Ollama AI      |  |  |  Start URL:               |  |  [Controls: Zoom +/-] [Filter ▼] [Export]        |       |
|  | > Reports        |  |  |  [https://example.com]    |  |                                                  |       |
|  |                  |  |  |                           |  |                                                  |       |
|  |                  |  |  |  Crawl Depth: [3]         |  |         [INTERACTIVE GRAPH/TREE VIEW             |       |
|  | PROJECTS         |  |  |  Max Pages: [100]         |  |          OF DISCOVERED PAGES WITH                |       |
|  |                  |  |  |                           |  |          CONNECTIONS AND COLOR CODING]           |       |
|  | > Current Project|  |  |  Authentication:          |  |                                                  |       |
|  | + New Project    |  |  |  [x] Use credentials      |  |                                                  |       |
|  |                  |  |  |  User: [admin]            |  |                                                  |       |
|  |                  |  |  |  Pass: [********]         |  |                                                  |       |
|  |                  |  |  |                           |  |                                                  |       |
|  | CRAWL CONTROLS   |  |  |  Exclusions:              |  |                                                  |       |
|  |                  |  |  |  [/logout, /admin/.*]     |  |                                                  |       |
|  | [▶ Start]        |  |  |                           |  |                                                  |       |
|  | [⏸ Pause]        |  |  |  Rate Limiting:           |  |                                                  |       |
|  | [⏹ Stop]         |  |  |  [x] Respect robots.txt   |  |                                                  |       |
|  |                  |  |  |  Requests/sec: [5]        |  |                                                  |       |
|  | Progress: 45%    |  |  |                           |  |                                                  |       |
|  | [===========--]  |  |  |  [Save Config] [Load]     |  |                                                  |       |
|  |                  |  |  +---------------------------+  +--------------------------------------------------+       |
|  |                  |  |                                                                                            |
|  |                  |  |  +-----------------------------------------------------------------------------+           |
|  |                  |  |  |                                                                             |           |
|  |                  |  |  |  DISCOVERED ITEMS                                                           |           |
|  |                  |  |  |                                                                             |           |
|  |                  |  |  |  [All] [Pages] [Forms] [Scripts] [APIs] [Resources]  [Search: _________]    |           |
|  |                  |  |  |                                                                             |           |
|  |                  |  |  |  +-------+---------------------------+----------------+----------------+     |           |
|  |                  |  |  |  | Type  | URL                       | Status         | Content        |     |           |
|  |                  |  |  |  +-------+---------------------------+----------------+----------------+     |           |
|  |                  |  |  |  | Page  | /index.html               | 200 OK         | HTML           |     |           |
|  |                  |  |  |  | Page  | /about.html               | 200 OK         | HTML           |     |           |
|  |                  |  |  |  | Form  | /contact.php              | 200 OK         | HTML+Form      |     |           |
|  |                  |  |  |  | API   | /api/users                | 200 OK         | JSON           |     |           |
|  |                  |  |  |  | Script| /js/main.js               | 200 OK         | JavaScript     |     |           |
|  |                  |  |  |  | Res   | /css/style.css            | 200 OK         | CSS            |     |           |
|  |                  |  |  |  | Page  | /products.html            | 200 OK         | HTML           |     |           |
|  |                  |  |  |  | Form  | /login.php                | 200 OK         | HTML+Form      |     |           |
|  |                  |  |  |  +-------+---------------------------+----------------+----------------+     |           |
|  |                  |  |  |                                                                             |           |
|  |                  |  |  |  [Export List] [Send to OWASP Tests] [Send to Repeater]                     |           |
|  |                  |  |  |                                                                             |           |
|  +------------------+  |  +-----------------------------------------------------------------------------+           |
|                        |                                                                                            |
|                        +--------------------------------------------------------------------------------------------+
|                                                                                                                      |
|  [Pages: 45/100]    [Forms: 12]    [APIs: 8]    [Scripts: 23]    [Crawl Time: 2m 34s]                               |
+----------------------------------------------------------------------------------------------------------------------+
```

## Key Elements

1. **Configuration Panel**
   - Start URL input for the crawl seed
   - Crawl depth and maximum pages limits
   - Authentication settings for protected areas
   - Exclusion patterns to avoid certain paths
   - Rate limiting controls to prevent overloading the target
   - Configuration save and load options

2. **Site Map Visualization**
   - Interactive graph or tree view of discovered pages
   - Zoom and pan controls for navigation
   - Filtering options for different content types
   - Color coding by status, content type, or security issues
   - Export options for site map data

3. **Discovered Items List**
   - Tabbed interface for different types of discoveries
   - Searchable and filterable table
   - Type, URL, status, and content information
   - Export and integration options with other modules
   - Context menu for additional operations

4. **Crawl Controls**
   - Start, pause, and stop buttons
   - Progress indicator with percentage
   - Progress bar for visual feedback
   - Current crawl statistics

5. **Status Bar**
   - Page count and limits
   - Form, API, and script counts
   - Total crawl time

## Interaction Points

- Configuration panel controls the crawl parameters
- Start/pause/stop buttons control the crawl process
- Clicking on nodes in the site map shows details
- Double-clicking on discovered items opens them in appropriate viewers
- Tab selection filters the discovered items list
- Export buttons save data in various formats
- Integration buttons send data to other modules
