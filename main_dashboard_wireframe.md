# Main Dashboard Wireframe

```
+----------------------------------------------------------------------------------------------------------------------+
|  [LOGO] Bug Bounty Hunter                                                 [Search]           [Settings] [Profile]     |
+----------------------------------------------------------------------------------------------------------------------+
|                                                                                                                      |
|  +------------------+  +------------------------------------------------------------------------------------------------+
|  | NAVIGATION       |  |                                                                                            |
|  |                  |  |                                DASHBOARD HOME                                               |
|  | > Dashboard      |  |                                                                                            |
|  | > Proxy          |  |  +-------------------------+  +-------------------------+  +-------------------------+      |
|  | > Repeater       |  |  |                         |  |                         |  |                         |      |
|  | > Crawler        |  |  |   ACTIVITY SUMMARY      |  |   VULNERABILITY STATS   |  |   OLLAMA AI STATUS      |      |
|  | > OWASP Tests    |  |  |                         |  |                         |  |                         |      |
|  | > Ollama AI      |  |  |  - Requests: 1,243      |  |  [PIE CHART]            |  |  - Status: Connected    |      |
|  | > Reports        |  |  |  - Findings: 12         |  |                         |  |  - Model: SecScan v2    |      |
|  |                  |  |  |  - Scans Active: 2      |  |  High: 3                |  |  - Analysis: Enabled    |      |
|  |                  |  |  |                         |  |  Medium: 5               |  |  - CPU Usage: 42%       |      |
|  | PROJECTS         |  |  |  [LINE CHART - TRAFFIC] |  |  Low: 4                 |  |  [AI DETECTION METRICS] |      |
|  |                  |  |  |                         |  |                         |  |                         |      |
|  | > Current Project|  |  +-------------------------+  +-------------------------+  +-------------------------+      |
|  | + New Project    |  |                                                                                            |
|  |                  |  |  +-------------------------+  +------------------------------------------------+           |
|  |                  |  |  |                         |  |                                                |           |
|  | RECENT ACTIVITY  |  |  |   QUICK ACTIONS         |  |   RECENT FINDINGS                              |           |
|  |                  |  |  |                         |  |                                                |           |
|  | > SQL Injection  |  |  |  [Start Scan]           |  |  [TABLE OF RECENT VULNERABILITIES]             |           |
|  | > XSS Found      |  |  |  [Configure Proxy]      |  |                                                |           |
|  | > Scan Completed |  |  |  [Generate Report]      |  |  - SQL Injection in login.php                  |           |
|  |                  |  |  |  [Export Data]          |  |  - XSS in comment form                         |           |
|  |                  |  |  |                         |  |  - CSRF in profile update                      |           |
|  |                  |  |  |                         |  |  - Outdated jQuery library                     |           |
|  |                  |  |  |                         |  |                                                |           |
|  +------------------+  |  +-------------------------+  +------------------------------------------------+           |
|                        |                                                                                            |
|                        +--------------------------------------------------------------------------------------------+
|                                                                                                                      |
|  [Proxy Status: Active]    [Requests: 1,243]    [Findings: 12]    [CPU: 42%]    [Memory: 1.2GB]                     |
+----------------------------------------------------------------------------------------------------------------------+
```

## Key Elements

1. **Top Navigation Bar**
   - Application logo and name on the left
   - Global search in the center
   - Settings and profile buttons on the right

2. **Left Sidebar**
   - Module navigation with highlighted current selection
   - Projects section with current project highlighted
   - Recent activity section showing latest events

3. **Main Content Area - Dashboard Home**
   - Activity Summary card with traffic visualization
   - Vulnerability Statistics with severity distribution
   - Ollama AI Status showing connection and performance metrics
   - Quick Actions panel with primary function buttons
   - Recent Findings table showing latest discovered vulnerabilities

4. **Status Bar**
   - Proxy status indicator
   - Request counter
   - Findings counter
   - System resource usage metrics

## Interaction Points

- All navigation items are clickable to switch between modules
- Quick action buttons trigger their respective functions
- Recent findings entries are clickable to view details
- Charts and visualizations support hover interactions for detailed information
- Status indicators provide additional information on click or hover
