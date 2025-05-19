// Update renderer.js to include Crawler, Audit, and Reporting UI components

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize modules
  initNavigation();
  initProxyModule();
  initRepeaterModule();
  initOllamaModule();
  initCrawlerModule();
  initAuditModule();
  initReportingModule();
  
  // Update status bar periodically
  updateStatusBar();
  setInterval(updateStatusBar, 5000);

  document.getElementById("start-proxy").addEventListener("click", () => {
    document.querySelector('.nav-item[data-module="proxy"]').click();
  });
  document.getElementById("launch-crawler").addEventListener("click", () => {
    document.querySelector('.nav-item[data-module="crawler"]').click();
  });
});

// Module navigation
function initNavigation() {
  document.querySelectorAll('.nav-item[data-module]').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const moduleId = this.getAttribute('data-module');
      
      // Update active nav item
      document.querySelectorAll('.nav-item').forEach(navItem => {
        navItem.classList.remove('active');
      });
      this.classList.add('active');
      
      // Show selected module
      document.querySelectorAll('.module-container').forEach(module => {
        module.classList.remove('active');
      });
      document.getElementById(moduleId).classList.add('active');
    });
  });
}

// Proxy module functionality
function initProxyModule() {
  const proxyModule = document.getElementById('proxy');
  if (!proxyModule) return;
  
  proxyModule.innerHTML = `
    <h1>Proxy Module</h1>
    <div style="padding: 20px;">
      <div>
        <label for="proxy-port">Port:</label>
        <input type="number" id="proxy-port" class="input-field" value="8080" style="width: 100px;">
      </div>
      <div style="margin-top: 10px;">
        <button id="start-proxy-server" class="button button-primary">Start Proxy</button>
        <button id="stop-proxy-server" class="button button-secondary" disabled>Stop Proxy</button>
      </div>
      <div id="proxy-log" style="margin-top: 20px; min-height: 100px; border: 1px solid #ccc; padding: 10px;">
        Proxy log will appear here.
      </div>
    </div>
  `;
  
  const startBtn = document.getElementById('start-proxy-server');
  const stopBtn = document.getElementById('stop-proxy-server');
  const portInput = document.getElementById('proxy-port');
  const logDiv = document.getElementById('proxy-log');
  
  startBtn.addEventListener('click', async () => {
    const port = parseInt(portInput.value);
    if (isNaN(port)) {
      alert('Please enter a valid port number.');
      return;
    }
    
    try {
      // Start proxy server logic via API call
      const result = await window.api.proxy.start(port);
      if (result.success) {
        logDiv.textContent = `Proxy started on port ${port}`;
        startBtn.disabled = true;
        stopBtn.disabled = false;
      } else {
        logDiv.textContent = `Failed to start proxy: ${result.error}`;
      }
    } catch (error) {
      logDiv.textContent = `Error: ${error.message}`;
    }
  });
  
  stopBtn.addEventListener('click', async () => {
    try {
      // Stop proxy server logic via API call
      const result = await window.api.proxy.stop();
      if (result.success) {
        logDiv.textContent = `Proxy stopped.`;
        startBtn.disabled = false;
        stopBtn.disabled = true;
      } else {
        logDiv.textContent = `Failed to stop proxy: ${result.error}`;
      }
    } catch (error) {
      logDiv.textContent = `Error: ${error.message}`;
    }
  });
  
  console.log("Proxy module initialized");
}

// Repeater module functionality
function initRepeaterModule() {
  // Get UI element for the repeater module
  const repeaterModule = document.getElementById('repeater');
  if (!repeaterModule) return;
  
  // Set up the repeater UI
  repeaterModule.innerHTML = `
    <h1>Repeater Module</h1>
    <div style="padding: 20px;">
      <textarea id="repeater-request" class="input-field" placeholder="Enter your HTTP request here..." style="width:100%; height:150px;"></textarea>
      <button id="send-repeater" class="button button-primary" style="margin-top:10px;">Send Request</button>
      <div id="repeater-response" style="margin-top:10px; min-height:100px; border:1px solid #ccc; padding:10px;">
        Response will be displayed here.
      </div>
    </div>
  `;

  // Attach event listener to the send button
  document.getElementById('send-repeater').addEventListener('click', async () => {
    const requestContent = document.getElementById('repeater-request').value.trim();
    if (!requestContent) {
      alert('Please enter a HTTP request.');
      return;
    }
    
    try {
      // Call the repeater API via window.api (replace with actual logic)
      const result = await window.api.repeater.send(requestContent);
      document.getElementById('repeater-response').textContent = result.response || 'No response returned';
    } catch (error) {
      document.getElementById('repeater-response').textContent = 'Error: ' + error.message;
    }
  });
  
  console.log("Repeater module initialized");
}

// Ollama module functionality
function initOllamaModule() {
  const ollamaModule = document.getElementById('ollama');
  if (!ollamaModule) return;
  
  ollamaModule.innerHTML = `
    <h1>Ollama Module</h1>
    <div style="padding: 20px;">
      <p>This module provides interactions with the Ollama API.</p>
      <button id="ollama-run" class="button button-primary">Run Ollama</button>
      <div id="ollama-output" style="margin-top:10px; min-height:100px; border:1px solid #ccc; padding:10px;"></div>
    </div>
  `;
  
  document.getElementById('ollama-run').addEventListener('click', async function() {
    const outputDiv = document.getElementById('ollama-output');
    outputDiv.textContent = 'Running Ollama command...';
    
    try {
      const result = await window.api.ollama.run('your command here');
      if (result.success) {
        outputDiv.textContent = `Success: ${result.response}`;
      } else {
        outputDiv.textContent = `Error: ${result.error}`;
      }
    } catch (error) {
      outputDiv.textContent = `Error: ${error.message}`;
    }
  });
  
  console.log("Ollama module initialized");
}

// Inside your event handler where you're trying to run Ollama:
async function runOllamaCommand() {
  try {
    const result = await window.api.ollama.run('your command here');
    if (result.success) {
      console.log('Ollama response:', result.response);
    } else {
      console.error('Ollama error:', result.error);
    }
  } catch (error) {
    console.error('Failed to run Ollama command:', error);
  }
}

// Crawler module functionality
function initCrawlerModule() {
  // Get UI elements
  const crawlerModule = document.getElementById('crawler');
  
  if (!crawlerModule) return;
  
  // Initialize crawler UI
  crawlerModule.innerHTML = `
    <h1>Web Crawler</h1>
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div class="dashboard-card">
        <div class="dashboard-card-title">Start Crawling</div>
        <div class="dashboard-card-content" style="align-items: flex-start; padding: 20px;">
          <div style="width: 100%;">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px;">Target URL:</label>
              <input type="text" id="crawler-url" class="input-field" placeholder="https://example.com" style="width: 100%;">
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px;">Crawl Settings:</label>
              <div style="display: flex; flex-wrap: wrap; gap: 15px;">
                <div>
                  <label style="display: block; margin-bottom: 5px;">Max Depth:</label>
                  <input type="number" id="crawler-max-depth" class="input-field" value="3" min="1" max="10">
                </div>
                <div>
                  <label style="display: block; margin-bottom: 5px;">Max Pages:</label>
                  <input type="number" id="crawler-max-pages" class="input-field" value="100" min="1" max="1000">
                </div>
                <div>
                  <label style="display: block; margin-bottom: 5px;">Delay (ms):</label>
                  <input type="number" id="crawler-delay" class="input-field" value="500" min="0" max="5000" step="100">
                </div>
                <div>
                  <label style="display: block; margin-bottom: 5px;">Concurrency:</label>
                  <input type="number" id="crawler-concurrency" class="input-field" value="2" min="1" max="10">
                </div>
              </div>
            </div>
            
            <div style="margin-bottom: 15px;">
              <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <label>
                  <input type="checkbox" id="crawler-respect-robots" checked> Respect robots.txt
                </label>
                <label>
                  <input type="checkbox" id="crawler-single-domain" checked> Stay on single domain
                </label>
              </div>
            </div>
            
            <div style="display: flex; gap: 10px;">
              <button id="start-crawler" class="button button-primary">Start Crawler</button>
              <button id="stop-crawler" class="button button-secondary" disabled>Stop Crawler</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dashboard-card">
        <div class="dashboard-card-title">Crawler Status</div>
        <div class="dashboard-card-content" style="align-items: flex-start; padding: 20px;">
          <div style="width: 100%;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
              <div>
                <strong>Status:</strong> <span id="crawler-status">Idle</span>
              </div>
              <div>
                <strong>URLs Visited:</strong> <span id="crawler-urls-visited">0</span>
              </div>
              <div>
                <strong>URLs Queued:</strong> <span id="crawler-urls-queued">0</span>
              </div>
              <div>
                <strong>Findings:</strong> <span id="crawler-findings-count">0</span>
              </div>
            </div>
            
            <div style="margin-bottom: 15px;">
              <div class="progress-bar-container">
                <div id="crawler-progress-bar" class="progress-bar" style="width: 0%;"></div>
              </div>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong>Current URL:</strong> <span id="crawler-current-url">-</span>
            </div>
            
            <div>
              <h3>Recent Activity</h3>
              <div id="crawler-activity-log" style="height: 150px; overflow-y: auto; background-color: rgba(0, 0, 0, 0.2); padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
                Crawler ready. Click "Start Crawler" to begin.
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dashboard-card">
        <div class="dashboard-card-title">Discovered Content</div>
        <div class="dashboard-card-content" style="align-items: flex-start; padding: 20px;">
          <div style="width: 100%;">
            <div style="margin-bottom: 15px;">
              <div class="tabs">
                <div class="tab active" data-tab="endpoints">Endpoints</div>
                <div class="tab" data-tab="forms">Forms</div>
                <div class="tab" data-tab="resources">Resources</div>
                <div class="tab" data-tab="sitemap">Site Map</div>
              </div>
              
              <div class="tab-content active" id="endpoints-tab">
                <div style="margin-top: 10px; margin-bottom: 10px;">
                  <input type="text" id="endpoints-filter" class="input-field" placeholder="Filter endpoints..." style="width: 100%;">
                </div>
                <div style="height: 300px; overflow-y: auto;">
                  <table class="data-table" id="endpoints-table">
                    <thead>
                      <tr>
                        <th>URL</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th>Content Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colspan="4" style="text-align: center; color: var(--text-secondary);">No endpoints discovered yet</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div class="tab-content" id="forms-tab">
                <div style="margin-top: 10px; margin-bottom: 10px;">
                  <input type="text" id="forms-filter" class="input-field" placeholder="Filter forms..." style="width: 100%;">
                </div>
                <div style="height: 300px; overflow-y: auto;">
                  <table class="data-table" id="forms-table">
                    <thead>
                      <tr>
                        <th>URL</th>
                        <th>Method</th>
                        <th>Action</th>
                        <th>Fields</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colspan="4" style="text-align: center; color: var(--text-secondary);">No forms discovered yet</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div class="tab-content" id="resources-tab">
                <div style="margin-top: 10px; margin-bottom: 10px;">
                  <input type="text" id="resources-filter" class="input-field" placeholder="Filter resources..." style="width: 100%;">
                </div>
                <div style="height: 300px; overflow-y: auto;">
                  <table class="data-table" id="resources-table">
                    <thead>
                      <tr>
                        <th>URL</th>
                        <th>Type</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colspan="3" style="text-align: center; color: var(--text-secondary);">No resources discovered yet</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div class="tab-content" id="sitemap-tab">
                <div style="margin-top: 10px; margin-bottom: 10px;">
                  <div style="height: 300px; overflow-y: auto; background-color: rgba(0, 0, 0, 0.2); padding: 10px; border-radius: 4px;">
                    <div id="sitemap-tree">
                      <div style="text-align: center; color: var(--text-secondary);">No site map available yet</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div style="display: flex; gap: 10px;">
              <button id="export-endpoints" class="button button-secondary" disabled>Export Endpoints</button>
              <button id="export-forms" class="button button-secondary" disabled>Export Forms</button>
              <button id="export-resources" class="button button-secondary" disabled>Export Resources</button>
              <button id="start-audit" class="button button-primary" disabled>Start Audit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Set up tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
      // Update active tab
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Show selected tab content
      const tabId = this.getAttribute('data-tab');
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });
  
  // Get UI elements
  const startCrawlerBtn = document.getElementById('start-crawler');
  const stopCrawlerBtn = document.getElementById('stop-crawler');
  const crawlerUrlInput = document.getElementById('crawler-url');
  const crawlerMaxDepthInput = document.getElementById('crawler-max-depth');
  const crawlerMaxPagesInput = document.getElementById('crawler-max-pages');
  const crawlerDelayInput = document.getElementById('crawler-delay');
  const crawlerConcurrencyInput = document.getElementById('crawler-concurrency');
  const crawlerRespectRobotsCheckbox = document.getElementById('crawler-respect-robots');
  const crawlerSingleDomainCheckbox = document.getElementById('crawler-single-domain');
  const crawlerStatusSpan = document.getElementById('crawler-status');
  const crawlerUrlsVisitedSpan = document.getElementById('crawler-urls-visited');
  const crawlerUrlsQueuedSpan = document.getElementById('crawler-urls-queued');
  const crawlerFindingsCountSpan = document.getElementById('crawler-findings-count');
  const crawlerProgressBar = document.getElementById('crawler-progress-bar');
  const crawlerCurrentUrlSpan = document.getElementById('crawler-current-url');
  const crawlerActivityLog = document.getElementById('crawler-activity-log');
  const endpointsTable = document.getElementById('endpoints-table');
  const formsTable = document.getElementById('forms-table');
  const resourcesTable = document.getElementById('resources-table');
  const sitemapTree = document.getElementById('sitemap-tree');
  const endpointsFilterInput = document.getElementById('endpoints-filter');
  const formsFilterInput = document.getElementById('forms-filter');
  const resourcesFilterInput = document.getElementById('resources-filter');
  const exportEndpointsBtn = document.getElementById('export-endpoints');
  const exportFormsBtn = document.getElementById('export-forms');
  const exportResourcesBtn = document.getElementById('export-resources');
  const startAuditBtn = document.getElementById('start-audit');
  
  // Start crawler button
  startCrawlerBtn.addEventListener('click', async function() {
    const url = crawlerUrlInput.value.trim();
    if (!url) {
      alert('Please enter a valid URL');
      return;
    }
    
    try {
      // Validate URL
      new URL(url);
      
      // Get crawler options
      const options = {
        maxDepth: parseInt(crawlerMaxDepthInput.value),
        maxPages: parseInt(crawlerMaxPagesInput.value),
        delay: parseInt(crawlerDelayInput.value),
        concurrency: parseInt(crawlerConcurrencyInput.value),
        respectRobotsTxt: crawlerRespectRobotsCheckbox.checked,
        crawlSingleDomain: crawlerSingleDomainCheckbox.checked
      };
      
      // Start crawler via API
      const result = await window.api.crawler.start(url, options);
      
      if (result.success) {
        // Update UI
        startCrawlerBtn.disabled = true;
        stopCrawlerBtn.disabled = false;
        crawlerStatusSpan.textContent = 'Running';
        crawlerStatusSpan.style.color = 'var(--success)';
        
        // Clear tables and logs
        clearCrawlerTables();
        addCrawlerLogEntry(`Started crawling ${url}`);
      } else {
        alert(`Failed to start crawler: ${result.error}`);
      }
    } catch (error) {
      alert(`Invalid URL: ${error.message}`);
    }
  });
  
  // Stop crawler button
  stopCrawlerBtn.addEventListener('click', async function() {
    try {
      const result = await window.api.crawler.stop();
      
      if (result.success) {
        // Update UI
        startCrawlerBtn.disabled = false;
        stopCrawlerBtn.disabled = true;
        crawlerStatusSpan.textContent = 'Stopped';
        crawlerStatusSpan.style.color = 'var(--warning)';
        
        // Add log entry
        addCrawlerLogEntry('Crawler stopped by user');
      } else {
        alert(`Failed to stop crawler: ${result.error}`);
      }
    } catch (error) {
      alert(`Error stopping crawler: ${error.message}`);
    }
  });
  
  // Export endpoints button
  exportEndpointsBtn.addEventListener('click', function() {
    exportCrawlerData('endpoints');
  });
  
  // Export forms button
  exportFormsBtn.addEventListener('click', function() {
    exportCrawlerData('forms');
  });
  
  // Export resources button
  exportResourcesBtn.addEventListener('click', function() {
    exportCrawlerData('resources');
  });
  
  // Start audit button
  startAuditBtn.addEventListener('click', async function() {
    try {
      // Get crawler data
      const endpoints = await window.api.crawler.getEndpoints();
      const forms = await window.api.crawler.getForms();
      // Process audit data here, e.g., send data to an audit function
      console.log('Audit data:', { endpoints, forms });
    } catch (error) {
      alert(`Error starting audit: ${error.message}`);
    }
  });
  
  // Helper functions
  
  // Clears data tables and site map
  function clearCrawlerTables() {
    if (endpointsTable) {
      endpointsTable.querySelector('tbody').innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-secondary);">No endpoints discovered yet</td></tr>';
    }
    if (formsTable) {
      formsTable.querySelector('tbody').innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-secondary);">No forms discovered yet</td></tr>';
    }
    if (resourcesTable) {
      resourcesTable.querySelector('tbody').innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-secondary);">No resources discovered yet</td></tr>';
    }
    if (sitemapTree) {
      sitemapTree.innerHTML = '<div style="text-align: center; color: var(--text-secondary);">No site map available yet</div>';
    }
  }
  
  // Appends a log entry to the crawler activity log
  function addCrawlerLogEntry(message) {
    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.textContent = `[${time}] ${message}`;
    crawlerActivityLog.appendChild(entry);
    crawlerActivityLog.scrollTop = crawlerActivityLog.scrollHeight;
  }
  
  // Exports crawler data as CSV based on given type
  function exportCrawlerData(type) {
    let filename = '';
    let columns = [];
    let rows = [];
    
    if (type === 'endpoints') {
      filename = 'endpoints.csv';
      columns = ['URL', 'Method', 'Status', 'Content Type'];
      rows = Array.from(endpointsTable.querySelectorAll('tbody tr')).map(row => 
        Array.from(row.querySelectorAll('td')).map(cell => cell.textContent.trim())
      );
    } else if (type === 'forms') {
      filename = 'forms.csv';
      columns = ['URL', 'Method', 'Action', 'Fields'];
      rows = Array.from(formsTable.querySelectorAll('tbody tr')).map(row => 
        Array.from(row.querySelectorAll('td')).map(cell => cell.textContent.trim())
      );
    } else if (type === 'resources') {
      filename = 'resources.csv';
      columns = ['URL', 'Type', 'Timestamp'];
      rows = Array.from(resourcesTable.querySelectorAll('tbody tr')).map(row => 
        Array.from(row.querySelectorAll('td')).map(cell => cell.textContent.trim())
      );
    }
    
    // If table contains default message, do not export
    if (rows.length === 1 && rows[0][0].includes('No')) {
      alert(`No data to export for ${type}`);
      return;
    }
    
    let csvContent = columns.join(",") + "\n";
    rows.forEach(r => {
      csvContent += r.join(",") + "\n";
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

// Dummy audit module
function initAuditModule() {
  // Implement audit module functionality as needed
  console.log("Audit module initialized");
}

// Dummy reporting module
function initReportingModule() {
  // Implement reporting module functionality as needed
  console.log("Reporting module initialized");
}

// Dummy status bar update functionality
function updateStatusBar() {
  // Update the status bar with relevant information
  console.log("Status bar updated");
}