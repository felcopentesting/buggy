// Update preload.js to include Crawler and Audit API methods

const { ipcRenderer, contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    // Proxy methods
    proxy: {
      start: (options) => ipcRenderer.invoke('proxy:start', options),
      stop: () => ipcRenderer.invoke('proxy:stop'),
      getStatus: () => ipcRenderer.invoke('proxy:getStatus'),
      getRequests: () => ipcRenderer.invoke('proxy:getRequests'),
      clearRequests: () => ipcRenderer.invoke('proxy:clearRequests'),
      forwardRequest: (requestId) => ipcRenderer.invoke('proxy:forwardRequest', requestId),
      dropRequest: (requestId) => ipcRenderer.invoke('proxy:dropRequest', requestId),
      modifyRequest: (requestId, modifications) => ipcRenderer.invoke('proxy:modifyRequest', requestId, modifications)
    },
    
    // Repeater methods
    repeater: {
      sendRequest: (request) => ipcRenderer.invoke('repeater:sendRequest', request),
      saveRequest: (request) => ipcRenderer.invoke('repeater:saveRequest', request),
      getRequests: () => ipcRenderer.invoke('repeater:getRequests')
    },
    
    // Ollama methods
    ollama: {
      run: (...args) => ipcRenderer.invoke('ollama:run', ...args),
      getStatus: () => ipcRenderer.invoke('ollama:getStatus'),
      checkConnection: () => ipcRenderer.invoke('ollama:checkConnection'),
      getAvailableModels: () => ipcRenderer.invoke('ollama:getAvailableModels'),
      setModel: (model) => ipcRenderer.invoke('ollama:setModel', model),
      updateConfig: (config) => ipcRenderer.invoke('ollama:updateConfig', config),
      analyzeRequest: (request) => ipcRenderer.invoke('ollama:analyzeRequest', request),
      analyzeResponse: (request, response) => ipcRenderer.invoke('ollama:analyzeResponse', request, response)
    },
    
    // Crawler methods
    crawler: {
      start: (url, options) => ipcRenderer.invoke('crawler:start', url, options),
      stop: () => ipcRenderer.invoke('crawler:stop'),
      getStatus: () => ipcRenderer.invoke('crawler:getStatus'),
      getEndpoints: () => ipcRenderer.invoke('crawler:getEndpoints'),
      getForms: () => ipcRenderer.invoke('crawler:getForms'),
      getResources: () => ipcRenderer.invoke('crawler:getResources'),
      getFindings: () => ipcRenderer.invoke('crawler:getFindings'),
      getSiteMap: () => ipcRenderer.invoke('crawler:getSiteMap')
    },
    
    // Audit methods
    audit: {
      start: (targetUrl, endpoints, forms, resources, options) => 
        ipcRenderer.invoke('audit:start', targetUrl, endpoints, forms, resources, options),
      stop: () => ipcRenderer.invoke('audit:stop'),
      getStatus: () => ipcRenderer.invoke('audit:getStatus'),
      getFindings: () => ipcRenderer.invoke('audit:getFindings')
    },
    
    // Report methods
    report: {
      generate: (data) => ipcRenderer.invoke('report:generate', data),
      getReports: () => ipcRenderer.invoke('report:getReports'),
      getReport: (id) => ipcRenderer.invoke('report:getReport', id),
      deleteReport: (id) => ipcRenderer.invoke('report:deleteReport', id),
      exportReport: (id, format) => ipcRenderer.invoke('report:exportReport', id, format)
    },
    
    // Event listeners
    on: (channel, callback) => {
      // Whitelist channels that can be listened to
      const validChannels = [
        'proxy:requestIntercepted',
        'proxy:requestCompleted',
        'proxy:requestError',
        'proxy:requestDropped',
        'proxy:requestModified',
        'proxy:started',
        'proxy:stopped',
        'repeater:requestSent',
        'ollama:connectionStatus',
        'ollama:analysisComplete',
        'ollama:configUpdated',
        'ollama:learningDataStored',
        'crawler:started',
        'crawler:stopped',
        'crawler:completed',
        'crawler:urlQueued',
        'crawler:visiting',
        'crawler:visited',
        'crawler:formFound',
        'crawler:resourceFound',
        'crawler:findingDetected',
        'crawler:error',
        'audit:started',
        'audit:stopped',
        'audit:completed',
        'audit:testStarted',
        'audit:testCompleted',
        'audit:testError',
        'audit:findingDetected',
        'audit:progressUpdate'
      ];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => callback(...args));
      }
    },
    
    // Remove event listeners
    removeListener: (channel, callback) => {
      const validChannels = [
        'proxy:requestIntercepted',
        'proxy:requestCompleted',
        'proxy:requestError',
        'proxy:requestDropped',
        'proxy:requestModified',
        'proxy:started',
        'proxy:stopped',
        'repeater:requestSent',
        'ollama:connectionStatus',
        'ollama:analysisComplete',
        'ollama:configUpdated',
        'ollama:learningDataStored',
        'crawler:started',
        'crawler:stopped',
        'crawler:completed',
        'crawler:urlQueued',
        'crawler:visiting',
        'crawler:visited',
        'crawler:formFound',
        'crawler:resourceFound',
        'crawler:findingDetected',
        'crawler:error',
        'audit:started',
        'audit:stopped',
        'audit:completed',
        'audit:testStarted',
        'audit:testCompleted',
        'audit:testError',
        'audit:findingDetected',
        'audit:progressUpdate'
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, callback);
      }
    }
  }
);

contextBridge.exposeInMainWorld('electronAPI', {
  startScan: () => ipcRenderer.send('start-scan'),
  onScanComplete: (callback) => ipcRenderer.on('scan-complete', callback)
});
