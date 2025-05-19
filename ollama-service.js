// Ollama MCP Service for AI-powered vulnerability detection
const axios = require('axios');
const { EventEmitter } = require('events');

class OllamaService extends EventEmitter {
  constructor() {
    super();
    this.baseUrl = 'http://localhost:11434'; // Default Ollama API endpoint
    this.model = 'llama2:latest'; // Default model
    this.isConnected = false;
    this.sensitivity = 'medium'; // low, medium, high
    this.categories = {
      injection: true,
      authentication: true,
      dataExposure: true,
      securityMisconfig: true,
      otherCategories: true
    };
    this.analysisScope = {
      requests: true,
      responses: true,
      headers: true,
      body: true
    };
    this.autoAnalyze = false;
    this.learningMode = false;
  }

  async initialize(config = {}) {
    if (config.baseUrl) this.baseUrl = config.baseUrl;
    if (config.model) this.model = config.model;
    if (config.sensitivity) this.sensitivity = config.sensitivity;
    if (config.categories) this.categories = { ...this.categories, ...config.categories };
    if (config.analysisScope) this.analysisScope = { ...this.analysisScope, ...config.analysisScope };
    if (config.autoAnalyze !== undefined) this.autoAnalyze = config.autoAnalyze;
    if (config.learningMode !== undefined) this.learningMode = config.learningMode;

    try {
      await this.checkConnection();
      return { success: true, status: this.isConnected };
    } catch (error) {
      console.error('Failed to initialize Ollama service:', error);
      return { success: false, error: error.message };
    }
  }

  async checkConnection() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      this.isConnected = response.status === 200;
      
      // Check if our model is available
      if (this.isConnected && response.data && response.data.models) {
        const modelExists = response.data.models.some(m => m.name === this.model);
        if (!modelExists) {
          console.warn(`Model ${this.model} not found. Using default model.`);
        }
      }
      
      this.emit('connectionStatus', { connected: this.isConnected });
      return this.isConnected;
    } catch (error) {
      this.isConnected = false;
      this.emit('connectionStatus', { connected: false, error: error.message });
      throw error;
    }
  }

  async getAvailableModels() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      if (response.status === 200 && response.data && response.data.models) {
        return { success: true, models: response.data.models };
      }
      return { success: false, error: 'Invalid response from Ollama API' };
    } catch (error) {
      console.error('Failed to get available models:', error);
      return { success: false, error: error.message };
    }
  }

  async setModel(model) {
    this.model = model;
    try {
      // Check if model exists
      const models = await this.getAvailableModels();
      if (models.success) {
        const modelExists = models.models.some(m => m.name === model);
        if (!modelExists) {
          return { success: false, error: `Model ${model} not found` };
        }
      }
      return { success: true };
    } catch (error) {
      console.error('Failed to set model:', error);
      return { success: false, error: error.message };
    }
  }

  async analyzeRequest(request) {
    if (!this.isConnected) {
      try {
        await this.checkConnection();
      } catch (error) {
        return { success: false, error: 'Ollama service not connected' };
      }
    }

    // Skip analysis if not in scope
    if (!this.analysisScope.requests) {
      return { success: true, findings: [] };
    }

    try {
      // Prepare the request data for analysis
      const requestData = this.prepareRequestData(request);
      
      // Create the prompt for vulnerability analysis
      const prompt = this.createAnalysisPrompt(requestData);
      
      // Send to Ollama for analysis
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false
      });

      // Parse the response to extract findings
      const findings = this.parseFindings(response.data.response, request);
      
      // Filter findings based on sensitivity
      const filteredFindings = this.filterFindingsBySensitivity(findings);
      
      // If in learning mode, store the request and findings for future training
      if (this.learningMode) {
        this.storeForLearning(request, filteredFindings);
      }
      
      // Emit event with findings
      this.emit('analysisComplete', { requestId: request.id, findings: filteredFindings });
      
      return { success: true, findings: filteredFindings };
    } catch (error) {
      console.error('Failed to analyze request:', error);
      return { success: false, error: error.message };
    }
  }

  async analyzeResponse(request, response) {
    if (!this.isConnected) {
      try {
        await this.checkConnection();
      } catch (error) {
        return { success: false, error: 'Ollama service not connected' };
      }
    }

    // Skip analysis if not in scope
    if (!this.analysisScope.responses) {
      return { success: true, findings: [] };
    }

    try {
      // Prepare the response data for analysis
      const responseData = this.prepareResponseData(request, response);
      
      // Create the prompt for vulnerability analysis
      const prompt = this.createAnalysisPrompt(responseData);
      
      // Send to Ollama for analysis
      const result = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false
      });

      // Parse the response to extract findings
      const findings = this.parseFindings(result.data.response, request, response);
      
      // Filter findings based on sensitivity
      const filteredFindings = this.filterFindingsBySensitivity(findings);
      
      // If in learning mode, store the response and findings for future training
      if (this.learningMode) {
        this.storeForLearning(request, filteredFindings, response);
      }
      
      // Emit event with findings
      this.emit('analysisComplete', { requestId: request.id, findings: filteredFindings });
      
      return { success: true, findings: filteredFindings };
    } catch (error) {
      console.error('Failed to analyze response:', error);
      return { success: false, error: error.message };
    }
  }

  prepareRequestData(request) {
    // Extract relevant parts of the request based on analysis scope
    const data = {
      method: request.method,
      url: request.url,
      path: request.path
    };
    
    if (this.analysisScope.headers && request.headers) {
      data.headers = request.headers;
    }
    
    if (this.analysisScope.body && request.body) {
      // Convert Buffer to string if needed
      data.body = typeof request.body === 'string' ? 
        request.body : 
        (request.body instanceof Buffer ? 
          request.body.toString('utf8') : 
          JSON.stringify(request.body));
    }
    
    return data;
  }

  prepareResponseData(request, response) {
    // Combine request and response data for context
    const data = {
      request: {
        method: request.method,
        url: request.url,
        path: request.path
      },
      response: {
        status: response.status,
        statusText: response.statusText
      }
    };
    
    if (this.analysisScope.headers) {
      if (request.headers) data.request.headers = request.headers;
      if (response.headers) data.response.headers = response.headers;
    }
    
    if (this.analysisScope.body) {
      // Request body
      if (request.body) {
        data.request.body = typeof request.body === 'string' ? 
          request.body : 
          (request.body instanceof Buffer ? 
            request.body.toString('utf8') : 
            JSON.stringify(request.body));
      }
      
      // Response body
      if (response.body) {
        data.response.body = typeof response.body === 'string' ? 
          response.body : 
          (response.body instanceof Buffer ? 
            response.body.toString('utf8') : 
            JSON.stringify(response.body));
      }
    }
    
    return data;
  }

  createAnalysisPrompt(data) {
    // Create a prompt for the AI model to analyze for vulnerabilities
    let prompt = `You are a security expert analyzing web traffic for vulnerabilities. 
Analyze the following ${data.response ? 'HTTP request and response' : 'HTTP request'} for security issues.

`;

    // Add request details
    prompt += `HTTP Request:
Method: ${data.method || data.request?.method}
URL: ${data.url || data.request?.url}
Path: ${data.path || data.request?.path}
`;

    // Add request headers if available and in scope
    if ((data.headers || data.request?.headers) && this.analysisScope.headers) {
      prompt += `\nHeaders:\n`;
      const headers = data.headers || data.request?.headers;
      for (const [key, value] of Object.entries(headers)) {
        prompt += `${key}: ${value}\n`;
      }
    }

    // Add request body if available and in scope
    if ((data.body || data.request?.body) && this.analysisScope.body) {
      prompt += `\nBody:\n${data.body || data.request?.body}\n`;
    }

    // Add response details if available
    if (data.response) {
      prompt += `\nHTTP Response:
Status: ${data.response.status} ${data.response.statusText}
`;

      // Add response headers if available and in scope
      if (data.response.headers && this.analysisScope.headers) {
        prompt += `\nHeaders:\n`;
        for (const [key, value] of Object.entries(data.response.headers)) {
          prompt += `${key}: ${value}\n`;
        }
      }

      // Add response body if available and in scope
      if (data.response.body && this.analysisScope.body) {
        prompt += `\nBody:\n${data.response.body}\n`;
      }
    }

    // Add instructions for the analysis
    prompt += `\nAnalyze the above for the following types of vulnerabilities:`;
    
    if (this.categories.injection) {
      prompt += `
- SQL Injection
- Cross-Site Scripting (XSS)
- Command Injection
- LDAP Injection
- XML Injection`;
    }
    
    if (this.categories.authentication) {
      prompt += `
- Authentication Bypass
- Weak Credentials
- Session Fixation
- Insecure Authentication`;
    }
    
    if (this.categories.dataExposure) {
      prompt += `
- Sensitive Data Exposure
- Information Leakage
- Directory Traversal
- Path Disclosure`;
    }
    
    if (this.categories.securityMisconfig) {
      prompt += `
- Security Misconfiguration
- Default Credentials
- Unnecessary Features Enabled
- Outdated Software`;
    }
    
    if (this.categories.otherCategories) {
      prompt += `
- Cross-Site Request Forgery (CSRF)
- Server-Side Request Forgery (SSRF)
- Insecure Deserialization
- XML External Entities (XXE)
- Unvalidated Redirects`;
    }

    prompt += `\n\nFor each vulnerability found, provide:
1. Vulnerability type
2. Confidence level (percentage)
3. Description of the issue
4. Location in the request/response
5. Potential impact
6. Remediation suggestion

Format your response as JSON with an array of findings:
{
  "findings": [
    {
      "type": "vulnerability type",
      "confidence": 85,
      "description": "detailed description",
      "location": "specific location",
      "impact": "potential impact",
      "remediation": "how to fix"
    }
  ]
}

If no vulnerabilities are found, return an empty findings array.
`;

    return prompt;
  }

  parseFindings(responseText, request, response = null) {
    try {
      // Extract JSON from the response text
      let jsonStr = responseText;
      
      // If the response contains markdown code blocks, extract the JSON
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                        responseText.match(/```\n([\s\S]*?)\n```/) ||
                        responseText.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        jsonStr = jsonMatch[0].replace(/```json\n|```\n|```/g, '');
      }
      
      // Parse the JSON
      const result = JSON.parse(jsonStr);
      
      // Ensure findings is an array
      const findings = Array.isArray(result.findings) ? result.findings : [];
      
      // Add metadata to each finding
      return findings.map(finding => ({
        ...finding,
        requestId: request.id,
        timestamp: new Date().toISOString(),
        url: request.url,
        method: request.method,
        hasResponse: !!response
      }));
    } catch (error) {
      console.error('Failed to parse findings:', error);
      console.log('Response text:', responseText);
      return [];
    }
  }

  filterFindingsBySensitivity(findings) {
    // Filter findings based on confidence level and sensitivity setting
    const thresholds = {
      low: 50,
      medium: 70,
      high: 90
    };
    
    const threshold = thresholds[this.sensitivity] || thresholds.medium;
    
    return findings.filter(finding => finding.confidence >= threshold);
  }

  storeForLearning(request, findings, response = null) {
    // In a real implementation, this would store the data for future training
    // For now, we'll just log it
    console.log('Storing for learning:', {
      requestId: request.id,
      findingsCount: findings.length,
      hasResponse: !!response
    });
    
    // Emit learning event
    this.emit('learningDataStored', {
      requestId: request.id,
      findings: findings,
      timestamp: new Date().toISOString()
    });
  }

  getStatus() {
    return {
      connected: this.isConnected,
      model: this.model,
      sensitivity: this.sensitivity,
      autoAnalyze: this.autoAnalyze,
      learningMode: this.learningMode,
      categories: this.categories,
      analysisScope: this.analysisScope
    };
  }

  updateConfig(config) {
    if (config.model) this.model = config.model;
    if (config.sensitivity) this.sensitivity = config.sensitivity;
    if (config.autoAnalyze !== undefined) this.autoAnalyze = config.autoAnalyze;
    if (config.learningMode !== undefined) this.learningMode = config.learningMode;
    if (config.categories) this.categories = { ...this.categories, ...config.categories };
    if (config.analysisScope) this.analysisScope = { ...this.analysisScope, ...config.analysisScope };
    
    this.emit('configUpdated', this.getStatus());
    return { success: true };
  }

  async run(command, options = {}) {
    if (!this.isConnected) {
      try {
        await this.checkConnection();
      } catch (error) {
        return { success: false, error: 'Ollama service not connected' };
      }
    }

    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.model,
        prompt: command,
        ...options,
        stream: false
      });

      return { 
        success: true, 
        response: response.data.response 
      };
    } catch (error) {
      console.error('Failed to run Ollama command:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = OllamaService;
