// Main process entry point for the Electron application

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const ProxyService = require('../src/services/proxy-service');
const StorageService = require('../src/services/storage-service');
const OllamaService = require('../src/services/ollama-service');
const CrawlerService = require('../src/services/crawler-service');
const AuditService = require('../src/services/audit-service');
const CertificateService = require('../src/services/certificate-service'); // Add this

// Global reference to prevent garbage collection
let mainWindow; 
let proxyService;
let storageService;
let ollamaService;
let crawlerService;
let auditService;
let certificateService; // Add this

async function createWindow() {
  // Initialize services
  try {
    certificateService = new CertificateService();
    await certificateService.initialize();
    
    storageService = new StorageService();
    await storageService.initialize();
    
    proxyService = new ProxyService(certificateService); // Pass certificate service
    await proxyService.initialize(); // Add initialization
    
    ollamaService = new OllamaService();
    await ollamaService.initialize();
    
    crawlerService = new CrawlerService();
    await crawlerService.initialize();
    
    auditService = new AuditService();
    await auditService.initialize();
  } catch (error) {
    console.error('Failed to initialize services:', error);
  }
  
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // update path if needed
      contextIsolation: true,
      nodeIntegration: false, // for better security
      enableRemoteModule: false // optional, for extra security
    },
    icon: path.join(__dirname, 'assets/icons/icon.png'),
    show: false, // Don't show until ready-to-show
    backgroundColor: '#1E2130' // Dark background to prevent white flash
  });

  // Load the index.html of the app
  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

  // Open DevTools in development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // Show window when ready to prevent white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Set up IPC handlers for proxy service
  setupIpcHandlers();
  
  // Set up event forwarding from services to renderer
  setupEventForwarding();
}

// Set up IPC handlers for communication between renderer and main processes
function setupIpcHandlers() {
  // Proxy service handlers
  ipcMain.handle('proxy:start', async (_event, options) => {
    try {
      await proxyService.start(options);
      return { success: true };
    } catch (error) {
      console.error('Failed to start proxy:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('proxy:stop', async () => {
    try {
      await proxyService.stop();
      return { success: true };
    } catch (error) {
      console.error('Failed to stop proxy:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('proxy:getStatus', () => {
    return proxyService.getStatus();
  });

  ipcMain.handle('proxy:getRequests', () => {
    return proxyService.getRequests();
  });

  ipcMain.handle('proxy:clearRequests', () => {
    proxyService.clearRequests();
    return { success: true };
  });

  ipcMain.handle('proxy:forwardRequest', (_event, requestId) => {
    return proxyService.forwardRequest(requestId);
  });

  ipcMain.handle('proxy:dropRequest', (_event, requestId) => {
    return proxyService.dropRequest(requestId);
  });

  ipcMain.handle('proxy:modifyRequest', (_event, requestId, modifications) => {
    return proxyService.modifyRequest(requestId, modifications);
  });

  // Repeater service handlers
  ipcMain.handle('repeater:sendRequest', async (_event, request) => {
    try {
      const response = await proxyService.sendRepeaterRequest(request);
      return { success: true, response };
    } catch (error) {
      console.error('Failed to send repeater request:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('repeater:saveRequest', async (_event, request) => {
    try {
      await storageService.saveRepeaterRequest(request);
      return { success: true };
    } catch (error) {
      console.error('Failed to save repeater request:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('repeater:getRequests', async () => {
    try {
      const requests = await storageService.getRepeaterRequests();
      return { success: true, requests };
    } catch (error) {
      console.error('Failed to get repeater requests:', error);
      return { success: false, error: error.message };
    }
  });
  
  // Ollama service handlers
  ipcMain.handle('ollama:run', async (_event, ...args) => {
    try {
      return await ollamaService.run(...args);
    } catch (error) {
      console.error('Failed to run Ollama command:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('ollama:getStatus', () => {
    return ollamaService.getStatus();
  });

  ipcMain.handle('ollama:checkConnection', async () => {
    try {
      const connected = await ollamaService.checkConnection();
      return { success: true, connected };
    } catch (error) {
      console.error('Failed to check Ollama connection:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('ollama:getAvailableModels', async () => {
    try {
      return await ollamaService.getAvailableModels();
    } catch (error) {
      console.error('Failed to get available models:', error);
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('ollama:setModel', async (_event, model) => {
    try {
      return await ollamaService.setModel(model);
    } catch (error) {
      console.error('Failed to set model:', error);
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('ollama:updateConfig', (_event, config) => {
    try {
      return ollamaService.updateConfig(config);
    } catch (error) {
      console.error('Failed to update Ollama config:', error);
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('ollama:analyzeRequest', async (_event, request) => {
    try {
      return await ollamaService.analyzeRequest(request);
    } catch (error) {
      console.error('Failed to analyze request:', error);
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('ollama:analyzeResponse', async (_event, request, response) => {
    try {
      return await ollamaService.analyzeResponse(request, response);
    } catch (error) {
      console.error('Failed to analyze response:', error);
      return { success: false, error: error.message };
    }
  });

  // Crawler service handlers
  ipcMain.handle('crawler:start', async (_event, url, options) => {
    try {
      return await crawlerService.start(url, options);
    } catch (error) {
      console.error('Failed to start crawler:', error);
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('crawler:stop', () => {
    try {
      return crawlerService.stop();
    } catch (error) {
      console.error('Failed to stop crawler:', error);
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('crawler:getStatus', () => {
    return crawlerService.getStatus();
  });
  
  ipcMain.handle('crawler:getEndpoints', () => {
    return crawlerService.getEndpoints();
  });
  
  ipcMain.handle('crawler:getForms', () => {
    return crawlerService.getForms();
  });
  
  ipcMain.handle('crawler:getResources', () => {
    return crawlerService.getResources();
  });
  
  ipcMain.handle('crawler:getFindings', () => {
    return crawlerService.getFindings();
  });
  
  ipcMain.handle('crawler:getSiteMap', () => {
    return crawlerService.getSiteMap();
  });
  
  // Audit service handlers
  ipcMain.handle('audit:start', async (_event, targetUrl, endpoints, forms, resources, options) => {
    try {
      return await auditService.start(targetUrl, endpoints, forms, resources, options);
    } catch (error) {
      console.error('Failed to start audit:', error);
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('audit:stop', () => {
    try {
      return auditService.stop();
    } catch (error) {
      console.error('Failed to stop audit:', error);
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('audit:getStatus', () => {
    return auditService.getStatus();
  });
  
  ipcMain.handle('audit:getFindings', () => {
    return auditService.getFindings();
  });
  
  // Report service handlers
  ipcMain.handle('report:generate', async (_event, data) => {
    try {
      const report = await storageService.generateReport(data);
      return { success: true, report };
    } catch (error) {
      console.error('Failed to generate report:', error);
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('report:getReports', async () => {
    try {
      const reports = await storageService.getReports();
      return { success: true, reports };
    } catch (error) {
      console.error('Failed to get reports:', error);
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('report:getReport', async (_event, id) => {
    try {
      const report = await storageService.getReport(id);
      return { success: true, report };
    } catch (error) {
      console.error('Failed to get report:', error);
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('report:deleteReport', async (_event, id) => {
    try {
      await storageService.deleteReport(id);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete report:', error);
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('report:exportReport', async (_event, id, format) => {
    try {
      const filePath = await storageService.exportReport(id, format);
      return { success: true, filePath };
    } catch (error) {
      console.error('Failed to export report:', error);
      return { success: false, error: error.message };
    }
  });
}

// Set up event forwarding from services to renderer
function setupEventForwarding() {
  // Forward proxy events to renderer
  proxyService.on('requestIntercepted', (request) => {
    if (mainWindow) {
      mainWindow.webContents.send('proxy:requestIntercepted', request);
    }
    
    // Auto-analyze if enabled
    if (ollamaService.autoAnalyze) {
      ollamaService.analyzeRequest(request);
    }
  });
  
  proxyService.on('requestCompleted', (request) => {
    if (mainWindow) {
      mainWindow.webContents.send('proxy:requestCompleted', request);
    }
    
    // Auto-analyze response if enabled
    if (ollamaService.autoAnalyze && request.response) {
      ollamaService.analyzeResponse(request, request.response);
    }
  });
  
  proxyService.on('requestError', (request) => {
    if (mainWindow) {
      mainWindow.webContents.send('proxy:requestError', request);
    }
  });
  
  proxyService.on('requestDropped', (request) => {
    if (mainWindow) {
      mainWindow.webContents.send('proxy:requestDropped', request);
    }
  });
  
  proxyService.on('requestModified', (request) => {
    if (mainWindow) {
      mainWindow.webContents.send('proxy:requestModified', request);
    }
  });
  
  proxyService.on('started', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('proxy:started', data);
    }
  });
  
  proxyService.on('stopped', () => {
    if (mainWindow) {
      mainWindow.webContents.send('proxy:stopped');
    }
  });
  
  // Forward Ollama events to renderer
  ollamaService.on('connectionStatus', (status) => {
    if (mainWindow) {
      mainWindow.webContents.send('ollama:connectionStatus', status);
    }
  });
  
  ollamaService.on('analysisComplete', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('ollama:analysisComplete', data);
    }
  });
  
  ollamaService.on('configUpdated', (config) => {
    if (mainWindow) {
      mainWindow.webContents.send('ollama:configUpdated', config);
    }
  });
  
  ollamaService.on('learningDataStored', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('ollama:learningDataStored', data);
    }
  });
  
  // Forward Crawler events to renderer
  crawlerService.on('started', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('crawler:started', data);
    }
  });
  
  crawlerService.on('stopped', () => {
    if (mainWindow) {
      mainWindow.webContents.send('crawler:stopped');
    }
  });
  
  crawlerService.on('completed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('crawler:completed', data);
    }
  });
  
  crawlerService.on('urlQueued', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('crawler:urlQueued', data);
    }
  });
  
  crawlerService.on('visiting', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('crawler:visiting', data);
    }
  });
  
  crawlerService.on('visited', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('crawler:visited', data);
    }
  });
  
  crawlerService.on('formFound', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('crawler:formFound', data);
    }
  });
  
  crawlerService.on('resourceFound', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('crawler:resourceFound', data);
    }
  });
  
  crawlerService.on('findingDetected', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('crawler:findingDetected', data);
    }
  });
  
  crawlerService.on('error', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('crawler:error', data);
    }
  });
  
  // Forward Audit events to renderer
  auditService.on('started', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('audit:started', data);
    }
  });
  
  auditService.on('stopped', () => {
    if (mainWindow) {
      mainWindow.webContents.send('audit:stopped');
    }
  });
  
  auditService.on('completed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('audit:completed', data);
    }
  });
  
  auditService.on('testStarted', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('audit:testStarted', data);
    }
  });
  
  auditService.on('testCompleted', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('audit:testCompleted', data);
    }
  });
  
  auditService.on('testError', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('audit:testError', data);
    }
  });
  
  auditService.on('findingDetected', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('audit:findingDetected', data);
    }
  });
  
  auditService.on('progressUpdate', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('audit:progressUpdate', data);
    }
  });
}

// App lifecycle events
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Clean up before quitting
app.on('before-quit', async () => {
  if (proxyService) {
    await proxyService.stop();
  }
  
  if (crawlerService && crawlerService.isRunning) {
    crawlerService.stop();
  }
  
  if (auditService && auditService.isRunning) {
    auditService.stop();
  }
});
