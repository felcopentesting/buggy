# Ollama Integration Interface Wireframe

```
+----------------------------------------------------------------------------------------------------------------------+
|  [LOGO] Bug Bounty Hunter                                                 [Search]           [Settings] [Profile]     |
+----------------------------------------------------------------------------------------------------------------------+
|                                                                                                                      |
|  +------------------+  +------------------------------------------------------------------------------------------------+
|  | NAVIGATION       |  |                                                                                            |
|  |                  |  |                                OLLAMA AI INTEGRATION                                        |
|  | > Dashboard      |  |                                                                                            |
|  | > Proxy          |  |  +---------------------------+  +--------------------------------------------------+       |
|  | > Repeater       |  |  |                           |  |                                                  |       |
|  | > Crawler        |  |  |  MODEL MANAGEMENT         |  |  ANALYSIS CONFIGURATION                          |       |
|  | > OWASP Tests    |  |  |                           |  |                                                  |       |
|  | > Ollama AI      |  |  |  Status: Connected        |  |  Detection Sensitivity:                          |       |
|  | > Reports        |  |  |                           |  |  [Low|●Medium|High]                              |       |
|  |                  |  |  |  Current Model:           |  |                                                  |       |
|  |                  |  |  |  [SecScan v2.1 ▼]         |  |  Analysis Scope:                                 |       |
|  | PROJECTS         |  |  |                           |  |  [x] Requests                                    |       |
|  |                  |  |  |  Available Models:        |  |  [x] Responses                                   |       |
|  | > Current Project|  |  |  - SecScan v2.1           |  |  [x] Headers                                     |       |
|  | + New Project    |  |  |  - VulnDetect Pro         |  |  [x] Body Content                                |       |
|  |                  |  |  |  - CodeAudit v1.0         |  |                                                  |       |
|  |                  |  |  |                           |  |  Vulnerability Categories:                        |       |
|  |                  |  |  |  [Download New Model]     |  |  [x] Injection                                   |       |
|  | AI CONTROLS      |  |  |                           |  |  [x] Authentication                              |       |
|  |                  |  |  |  Performance:             |  |  [x] Data Exposure                               |       |
|  | [x] Enable AI    |  |  |  CPU Usage: 42%           |  |  [x] Security Misconfig                          |       |
|  | [ ] Auto-analyze |  |  |  Memory: 1.2 GB           |  |  [x] All Other Categories                        |       |
|  |                  |  |  |  Avg. Response: 230ms     |  |                                                  |       |
|  | Learning Mode:   |  |  |                           |  |  [Save Configuration] [Reset to Default]         |       |
|  | [ ] Enabled      |  |  |  [Restart Model]          |  |                                                  |       |
|  |                  |  |  +---------------------------+  +--------------------------------------------------+       |
|  |                  |  |                                                                                            |
|  |                  |  |  +-----------------------------------------------------------------------------+           |
|  |                  |  |  |                                                                             |           |
|  |                  |  |  |  DETECTION RESULTS                                                          |           |
|  |                  |  |  |                                                                             |           |
|  |                  |  |  |  [All] [High] [Medium] [Low] [Info]  [Search: _________]                    |           |
|  |                  |  |  |                                                                             |           |
|  |                  |  |  |  +-------+---------------------------+----------------+----------------+     |           |
|  |                  |  |  |  | Conf. | Vulnerability             | Location       | Description    |     |           |
|  |                  |  |  |  +-------+---------------------------+----------------+----------------+     |           |
|  |                  |  |  |  | 95%   | SQL Injection             | /login.php     | Login form     |     |           |
|  |                  |  |  |  | 87%   | XSS Reflected             | /search.php    | Search param   |     |           |
|  |                  |  |  |  | 76%   | JWT Without Signature     | Auth Header    | Missing alg    |     |           |
|  |                  |  |  |  | 65%   | Potential IDOR            | /api/user/123  | User ID param  |     |           |
|  |                  |  |  |  | 52%   | Information Disclosure    | Error Response | Stack trace    |     |           |
|  |                  |  |  |  +-------+---------------------------+----------------+----------------+     |           |
|  |                  |  |  |                                                                             |           |
|  |                  |  |  |  [Generate Report] [Export Findings] [Send to OWASP Tests]                  |           |
|  |                  |  |  |                                                                             |           |
|  +------------------+  |  +-----------------------------------------------------------------------------+           |
|                        |                                                                                            |
|                        +--------------------------------------------------------------------------------------------+
|                                                                                                                      |
|  [Model: SecScan v2.1]    [Detections: 5]    [Avg. Confidence: 75%]    [Analysis Time: 1.2s]                        |
+----------------------------------------------------------------------------------------------------------------------+
```

## Key Elements

1. **Model Management Panel**
   - Connection status indicator
   - Current model selector
   - Available models list
   - Download new model option
   - Performance metrics (CPU, memory, response time)
   - Model restart button

2. **Analysis Configuration Panel**
   - Detection sensitivity slider
   - Analysis scope checkboxes
   - Vulnerability categories selection
   - Configuration save and reset buttons

3. **Detection Results Panel**
   - Confidence-based tabs for filtering results
   - Search functionality for specific findings
   - Detailed table with confidence score, vulnerability type, location, and description
   - Export and integration options with other modules
   - Report generation button

4. **AI Controls**
   - Enable/disable AI toggle
   - Auto-analyze toggle for automatic scanning
   - Learning mode toggle for improving detection over time

5. **Status Bar**
   - Current model indicator
   - Detection count
   - Average confidence score
   - Analysis time

## Interaction Points

- Model selector dropdown changes the active AI model
- Configuration options adjust the AI behavior
- Tab selection filters the detection results
- Clicking on detections shows detailed information and evidence
- Export buttons save data in various formats
- Integration buttons send data to other modules
