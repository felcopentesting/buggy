# Reporting Interface Wireframe

```
+----------------------------------------------------------------------------------------------------------------------+
|  [LOGO] Bug Bounty Hunter                                                 [Search]           [Settings] [Profile]     |
+----------------------------------------------------------------------------------------------------------------------+
|                                                                                                                      |
|  +------------------+  +------------------------------------------------------------------------------------------------+
|  | NAVIGATION       |  |                                                                                            |
|  |                  |  |                                REPORTING                                                    |
|  | > Dashboard      |  |                                                                                            |
|  | > Proxy          |  |  +---------------------------+  +--------------------------------------------------+       |
|  | > Repeater       |  |  |                           |  |                                                  |       |
|  | > Crawler        |  |  |  REPORT CONFIGURATION     |  |  PREVIEW                                         |       |
|  | > OWASP Tests    |  |  |                           |  |                                                  |       |
|  | > Ollama AI      |  |  |  Report Type:             |  |  [Page 1 of 12]  [< Prev | Next >]              |       |
|  | > Reports        |  |  |  [Executive Summary ▼]    |  |                                                  |       |
|  |                  |  |  |                           |  |  +------------------------------------------+    |       |
|  |                  |  |  |  Include Sections:        |  |  |                                          |    |       |
|  | PROJECTS         |  |  |  [x] Executive Summary    |  |  |     [WYSIWYG REPORT PREVIEW WITH         |    |       |
|  |                  |  |  |  [x] Methodology          |  |  |      ACTUAL FORMATTING, CHARTS,          |    |       |
|  | > Current Project|  |  |  [x] Findings             |  |  |      TABLES AND CONTENT]                 |    |       |
|  | + New Project    |  |  |  [x] Recommendations      |  |  |                                          |    |       |
|  |                  |  |  |  [x] Appendices           |  |  |                                          |    |       |
|  |                  |  |  |                           |  |  |                                          |    |       |
|  |                  |  |  |  Findings to Include:     |  |  |                                          |    |       |
|  | SAVED REPORTS    |  |  |  [x] High (3)             |  |  |                                          |    |       |
|  |                  |  |  |  [x] Medium (5)           |  |  |                                          |    |       |
|  | > Weekly Report  |  |  |  [x] Low (8)              |  |  |                                          |    |       |
|  | > Full Audit     |  |  |  [ ] Info (12)            |  |  |                                          |    |       |
|  | > Client Demo    |  |  |                           |  |  |                                          |    |       |
|  |                  |  |  |  Branding:                |  |  |                                          |    |       |
|  | [+ New Report]   |  |  |  [x] Include logo         |  |  |                                          |    |       |
|  |                  |  |  |  [x] Custom colors        |  |  |                                          |    |       |
|  |                  |  |  |  [Select Theme ▼]         |  |  +------------------------------------------+    |       |
|  |                  |  |  |                           |  |                                                  |       |
|  |                  |  |  |  [Generate Preview]       |  |                                                  |       |
|  |                  |  |  +---------------------------+  +--------------------------------------------------+       |
|  |                  |  |                                                                                            |
|  |                  |  |  +-----------------------------------------------------------------------------+           |
|  |                  |  |  |                                                                             |           |
|  |                  |  |  |  EXPORT OPTIONS                                                             |           |
|  |                  |  |  |                                                                             |           |
|  |                  |  |  |  Format:                                                                    |           |
|  |                  |  |  |  [●PDF] [HTML] [DOCX] [CSV] [JSON]                                          |           |
|  |                  |  |  |                                                                             |           |
|  |                  |  |  |  Options:                                                                   |           |
|  |                  |  |  |  [x] Include evidence screenshots                                           |           |
|  |                  |  |  |  [x] Include remediation steps                                              |           |
|  |                  |  |  |  [x] Include OWASP references                                               |           |
|  |                  |  |  |  [x] Include technical details                                              |           |
|  |                  |  |  |                                                                             |           |
|  |                  |  |  |  Delivery:                                                                  |           |
|  |                  |  |  |  [Save to Disk] [Email Report] [Share Link]                                 |           |
|  |                  |  |  |                                                                             |           |
|  |                  |  |  |  [Export Report]                                                            |           |
|  |                  |  |  |                                                                             |           |
|  +------------------+  |  +-----------------------------------------------------------------------------+           |
|                        |                                                                                            |
|                        +--------------------------------------------------------------------------------------------+
|                                                                                                                      |
|  [Report Type: Executive]    [Findings: 16]    [Pages: 12]    [Last Generated: 2m ago]                              |
+----------------------------------------------------------------------------------------------------------------------+
```

## Key Elements

1. **Report Configuration Panel**
   - Report type selector (Executive Summary, Technical Detail, etc.)
   - Section inclusion checkboxes
   - Finding severity filters
   - Branding and theme options
   - Preview generation button

2. **Preview Panel**
   - Page navigation controls
   - WYSIWYG preview of the actual report
   - Accurate representation of formatting, charts, and tables
   - Zoom and view options

3. **Export Options Panel**
   - Format selection (PDF, HTML, DOCX, CSV, JSON)
   - Content inclusion options
   - Delivery method selection
   - Export button

4. **Saved Reports Section**
   - List of previously generated reports
   - Quick access to common report templates
   - New report creation button

5. **Status Bar**
   - Current report type
   - Finding count
   - Page count
   - Last generation timestamp

## Interaction Points

- Report type selector changes the overall report structure
- Section and finding checkboxes control content inclusion
- Generate Preview button refreshes the preview panel
- Format selection changes export options
- Export button generates and delivers the final report
- Saved reports provide quick access to common configurations
