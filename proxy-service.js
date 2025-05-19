// Proxy Service for intercepting and modifying HTTP/HTTPS traffic

const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const https = require('https');
const net = require('net');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { CertificateService } = require('./certificate-service');


class ProxyService extends EventEmitter {
  constructor(certificateService) {
    super();
    this.isRunning = false;
    this.server = null;
    this.port = 8080;
    this.requests = [];
    this.interceptedRequests = new Map();
    this.certificateService = certificateService;
  }

  async start(options = {}) {
    if (this.isRunning) {
      throw new Error('Proxy is already running');
    }

    // Set options
    this.port = options.port || 8080;
    this.interceptEnabled = options.intercept !== false;
    this.logEnabled = options.log !== false;

    try {
      // Initialize certificate service if needed
      if (!this.certificateService.isInitialized()) {
        await this.certificateService.initialize();
      }

      // Create HTTP server
      this.server = http.createServer();
      
      // Handle HTTP requests
      this.server.on('request', this.handleHttpRequest.bind(this));
      
      // Handle HTTPS tunneling
      this.server.on('connect', this.handleHttpsConnect.bind(this));
      
      // Handle errors
      this.server.on('error', (error) => {
        console.error('Proxy server error:', error);
        this.emit('error', error);
      });
      
      // Start listening
      await new Promise((resolve, reject) => {
        this.server.listen(this.port, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
      
      this.isRunning = true;
      this.emit('started', { port: this.port });
      
      console.log(`Proxy server started on port ${this.port}`);
      return { success: true, port: this.port };
    } catch (error) {
      console.error('Failed to start proxy server:', error);
      throw error;
    }
  }

  async stop() {
    if (!this.isRunning) {
      return { success: true };
    }

    try {
      await new Promise((resolve, reject) => {
        this.server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
      
      this.isRunning = false;
      this.emit('stopped');
      
      console.log('Proxy server stopped');
      return { success: true };
    } catch (error) {
      console.error('Failed to stop proxy server:', error);
      throw error;
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      port: this.port,
      interceptEnabled: this.interceptEnabled,
      logEnabled: this.logEnabled,
      requestCount: this.requests.length,
      interceptedCount: this.interceptedRequests.size
    };
  }

  getRequests() {
    return this.requests;
  }

  clearRequests() {
    this.requests = [];
    return { success: true };
  }

  async handleHttpRequest(clientReq, clientRes) {
    const requestId = uuidv4();
    const requestUrl = url.parse(clientReq.url);
    
    // Create request object
    const request = {
      id: requestId,
      url: clientReq.url,
      method: clientReq.method,
      headers: clientReq.headers,
      timestamp: new Date().toISOString(),
      body: null,
      response: null,
      status: 'pending'
    };
    
    // Add to requests list
    this.requests.unshift(request);
    
    // Log request
    if (this.logEnabled) {
      console.log(`[${request.method}] ${request.url}`);
    }
    
    // Check if interception is enabled
    if (this.interceptEnabled) {
      // Collect request body
      let requestBody = [];
      
      clientReq.on('data', (chunk) => {
        requestBody.push(chunk);
      });
      
      clientReq.on('end', async () => {
        // Set request body
        if (requestBody.length > 0) {
          request.body = Buffer.concat(requestBody).toString();
        }
        
        // Emit request intercepted event
        this.emit('requestIntercepted', request);
        
        // Add to intercepted requests map
        this.interceptedRequests.set(requestId, {
          request,
          clientReq,
          clientRes
        });
        
        // Update request status
        request.status = 'intercepted';
      });
    } else {
      // Forward request directly
      this.forwardHttpRequest(request, clientReq, clientRes);
    }
  }

  async handleHttpsConnect(clientReq, clientSocket, head) {
    const requestId = uuidv4();
    const targetUrl = url.parse(`https://${clientReq.url}`);
    
    // Create request object
    const request = {
      id: requestId,
      url: `https://${clientReq.url}`,
      method: 'CONNECT',
      headers: clientReq.headers,
      timestamp: new Date().toISOString(),
      body: null,
      response: null,
      status: 'pending'
    };
    
    // Add to requests list
    this.requests.unshift(request);
    
    // Log request
    if (this.logEnabled) {
      console.log(`[CONNECT] ${request.url}`);
    }
    
    // Create connection to target server
    const targetSocket = net.connect(
      targetUrl.port || 443,
      targetUrl.hostname,
      () => {
        // Send connection established response
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                          'Connection: close\r\n' +
                          '\r\n');
        
        // Connect sockets
        targetSocket.write(head);
        targetSocket.pipe(clientSocket);
        clientSocket.pipe(targetSocket);
        
        // Update request status
        request.status = 'completed';
        
        // Handle socket close
        clientSocket.on('close', () => {
          targetSocket.end();
        });
        
        targetSocket.on('close', () => {
          clientSocket.end();
        });
      }
    );
    
    // Handle errors
    targetSocket.on('error', (error) => {
      console.error('Target socket error:', error);
      clientSocket.end();
      
      // Update request status
      request.status = 'error';
      request.error = error.message;
      
      // Emit request error event
      this.emit('requestError', request);
    });
    
    clientSocket.on('error', (error) => {
      console.error('Client socket error:', error);
      targetSocket.end();
      
      // Update request status
      request.status = 'error';
      request.error = error.message;
      
      // Emit request error event
      this.emit('requestError', request);
    });
  }

  async forwardHttpRequest(request, clientReq, clientRes) {
    // Parse URL
    const parsedUrl = url.parse(request.url);
    
    // Create options for forwarding request
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path: parsedUrl.path,
      method: request.method,
      headers: request.headers
    };
    
    // Create forwarded request
    const forwardReq = http.request(options, (forwardRes) => {
      // Set response headers
      Object.keys(forwardRes.headers).forEach((key) => {
        clientRes.setHeader(key, forwardRes.headers[key]);
      });
      
      // Set response status code
      clientRes.writeHead(forwardRes.statusCode);
      
      // Create response object
      const response = {
        statusCode: forwardRes.statusCode,
        headers: forwardRes.headers,
        body: null
      };
      
      // Collect response body
      let responseBody = [];
      
      forwardRes.on('data', (chunk) => {
        responseBody.push(chunk);
        clientRes.write(chunk);
      });
      
      forwardRes.on('end', () => {
        // Set response body
        if (responseBody.length > 0) {
          response.body = Buffer.concat(responseBody).toString();
        }
        
        // End client response
        clientRes.end();
        
        // Update request with response
        request.response = response;
        request.status = 'completed';
        
        // Emit request completed event
        this.emit('requestCompleted', request);
      });
    });
    
    // Handle errors
    forwardReq.on('error', (error) => {
      console.error('Forward request error:', error);
      
      // Send error response to client
      clientRes.writeHead(502);
      clientRes.end(`Proxy Error: ${error.message}`);
      
      // Update request status
      request.status = 'error';
      request.error = error.message;
      
      // Emit request error event
      this.emit('requestError', request);
    });
    
    // Forward request body if available
    if (request.body) {
      forwardReq.write(request.body);
    }
    
    // End forwarded request
    forwardReq.end();
  }

  async forwardRequest(requestId) {
    const intercepted = this.interceptedRequests.get(requestId);
    
    if (!intercepted) {
      throw new Error(`Request with ID ${requestId} not found or already forwarded`);
    }
    
    const { request, clientReq, clientRes } = intercepted;
    
    // Remove from intercepted requests map
    this.interceptedRequests.delete(requestId);
    
    // Forward request
    this.forwardHttpRequest(request, clientReq, clientRes);
    
    // Emit request forwarded event
    this.emit('requestForwarded', request);
    
    return { success: true };
  }

  async dropRequest(requestId) {
    const intercepted = this.interceptedRequests.get(requestId);
    
    if (!intercepted) {
      throw new Error(`Request with ID ${requestId} not found or already forwarded`);
    }
    
    const { request, clientRes } = intercepted;
    
    // Remove from intercepted requests map
    this.interceptedRequests.delete(requestId);
    
    // Send error response to client
    clientRes.writeHead(444);
    clientRes.end('Request dropped by user');
    
    // Update request status
    request.status = 'dropped';
    
    // Emit request dropped event
    this.emit('requestDropped', request);
    
    return { success: true };
  }

  async modifyRequest(requestId, modifications) {
    const intercepted = this.interceptedRequests.get(requestId);
    
    if (!intercepted) {
      throw new Error(`Request with ID ${requestId} not found or already forwarded`);
    }
    
    const { request, clientReq, clientRes } = intercepted;
    
    // Apply modifications
    if (modifications.url) {
      request.url = modifications.url;
    }
    
    if (modifications.method) {
      request.method = modifications.method;
    }
    
    if (modifications.headers) {
      request.headers = modifications.headers;
    }
    
    if (modifications.body !== undefined) {
      request.body = modifications.body;
    }
    
    // Remove from intercepted requests map
    this.interceptedRequests.delete(requestId);
    
    // Forward modified request
    this.forwardHttpRequest(request, clientReq, clientRes);
    
    // Emit request modified event
    this.emit('requestModified', request);
    
    return { success: true };
  }

  async sendRepeaterRequest(request) {
    // Parse URL
    const parsedUrl = url.parse(request.url);
    const isHttps = parsedUrl.protocol === 'https:';
    
    // Create options for request
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.path,
      method: request.method,
      headers: request.headers
    };
    
    // Create request object
    const requestObj = {
      id: uuidv4(),
      url: request.url,
      method: request.method,
      headers: request.headers,
      timestamp: new Date().toISOString(),
      body: request.body,
      response: null,
      status: 'pending'
    };
    
    try {
      // Send request
      const response = await new Promise((resolve, reject) => {
        // Create request
        const req = (isHttps ? https : http).request(options, (res) => {
          // Create response object
          const responseObj = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: null
          };
          
          // Collect response body
          let responseBody = [];
          
          res.on('data', (chunk) => {
            responseBody.push(chunk);
          });
          
          res.on('end', () => {
            // Set response body
            if (responseBody.length > 0) {
              responseObj.body = Buffer.concat(responseBody).toString();
            }
            
            resolve(responseObj);
          });
        });
        
        // Handle errors
        req.on('error', (error) => {
          reject(error);
        });
        
        // Send request body if available
        if (request.body) {
          req.write(request.body);
        }
        
        // End request
        req.end();
      });
      
      // Update request with response
      requestObj.response = response;
      requestObj.status = 'completed';
      
      // Add to requests list
      this.requests.unshift(requestObj);
      
      // Emit request sent event
      this.emit('repeaterRequestSent', requestObj);
      
      return requestObj;
    } catch (error) {
      // Update request status
      requestObj.status = 'error';
      requestObj.error = error.message;
      
      // Add to requests list
      this.requests.unshift(requestObj);
      
      // Emit request error event
      this.emit('requestError', requestObj);
      
      throw error;
    }
  }
}

module.exports = ProxyService;
