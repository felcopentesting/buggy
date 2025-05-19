// Crawler Service for discovering web application structure
const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');
const { EventEmitter } = require('events');
const path = require('path');

class CrawlerService extends EventEmitter {
  constructor() {
    super();
    this.baseUrl = null;
    this.visited = new Set();
    this.queue = [];
    this.findings = [];
    this.forms = [];
    this.endpoints = new Map();
    this.resources = new Map();
    this.isRunning = false;
    this.isStopped = false;
    this.maxDepth = 3;
    this.maxPages = 100;
    this.respectRobotsTxt = true;
    this.crawlSingleDomain = true;
    this.excludePatterns = [
      /\.(jpg|jpeg|png|gif|bmp|svg|webp|ico|css|js|woff|woff2|ttf|eot|pdf|doc|docx|xls|xlsx|zip|rar|tar|gz)$/i,
      /\/(logout|signout|log-out|sign-out)/i
    ];
    this.includePatterns = [];
    this.delay = 500; // ms between requests
    this.timeout = 10000; // request timeout
    this.concurrency = 2; // concurrent requests
    this.activeRequests = 0;
    this.robotsTxtRules = null;
    this.cookies = {};
    this.headers = {
      'User-Agent': 'BugBountyHunter/1.0 Web Crawler'
    };
    this.proxy = null;
  }

  async initialize(config = {}) {
    if (config.maxDepth !== undefined) this.maxDepth = config.maxDepth;
    if (config.maxPages !== undefined) this.maxPages = config.maxPages;
    if (config.respectRobotsTxt !== undefined) this.respectRobotsTxt = config.respectRobotsTxt;
    if (config.crawlSingleDomain !== undefined) this.crawlSingleDomain = config.crawlSingleDomain;
    if (config.excludePatterns) this.excludePatterns = [...this.excludePatterns, ...config.excludePatterns];
    if (config.includePatterns) this.includePatterns = config.includePatterns;
    if (config.delay !== undefined) this.delay = config.delay;
    if (config.timeout !== undefined) this.timeout = config.timeout;
    if (config.concurrency !== undefined) this.concurrency = config.concurrency;
    if (config.cookies) this.cookies = config.cookies;
    if (config.headers) this.headers = { ...this.headers, ...config.headers };
    if (config.proxy) this.proxy = config.proxy;

    return { success: true };
  }

  async start(url, options = {}) {
    if (this.isRunning) {
      return { success: false, error: 'Crawler is already running' };
    }

    try {
      // Reset state
      this.reset();
      
      // Update config if provided
      if (options) {
        await this.initialize(options);
      }
      
      // Parse and validate URL
      this.baseUrl = new URL(url);
      
      // Fetch robots.txt if enabled
      if (this.respectRobotsTxt) {
        await this.fetchRobotsTxt();
      }
      
      // Start crawling
      this.isRunning = true;
      this.isStopped = false;
      
      // Add initial URL to queue
      this.addToQueue(url, 0);
      
      // Start processing queue
      this.processQueue();
      
      this.emit('started', { url });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to start crawler:', error);
      return { success: false, error: error.message };
    }
  }

  stop() {
    if (!this.isRunning) {
      return { success: false, error: 'Crawler is not running' };
    }
    
    this.isStopped = true;
    this.isRunning = false;
    this.emit('stopped');
    
    return { success: true };
  }

  reset() {
    this.visited.clear();
    this.queue = [];
    this.findings = [];
    this.forms = [];
    this.endpoints.clear();
    this.resources.clear();
    this.isRunning = false;
    this.isStopped = false;
    this.activeRequests = 0;
    this.robotsTxtRules = null;
  }

  async fetchRobotsTxt() {
    try {
      const robotsUrl = new URL('/robots.txt', this.baseUrl);
      const response = await axios.get(robotsUrl.toString(), {
        timeout: this.timeout,
        headers: this.headers,
        proxy: this.proxy
      });
      
      if (response.status === 200) {
        this.robotsTxtRules = this.parseRobotsTxt(response.data);
      }
    } catch (error) {
      console.warn('Failed to fetch robots.txt:', error.message);
      // Continue without robots.txt
    }
  }

  parseRobotsTxt(content) {
    const rules = {
      disallowed: [],
      allowed: []
    };
    
    const lines = content.split('\n');
    let isRelevantUserAgent = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip comments and empty lines
      if (trimmedLine === '' || trimmedLine.startsWith('#')) {
        continue;
      }
      
      // Check if line defines user agent
      if (trimmedLine.toLowerCase().startsWith('user-agent:')) {
        const userAgent = trimmedLine.substring(11).trim().toLowerCase();
        isRelevantUserAgent = userAgent === '*' || 
                             this.headers['User-Agent'].toLowerCase().includes(userAgent);
      }
      // Process rules for relevant user agent
      else if (isRelevantUserAgent) {
        if (trimmedLine.toLowerCase().startsWith('disallow:')) {
          const path = trimmedLine.substring(9).trim();
          if (path) {
            rules.disallowed.push(path);
          }
        } else if (trimmedLine.toLowerCase().startsWith('allow:')) {
          const path = trimmedLine.substring(6).trim();
          if (path) {
            rules.allowed.push(path);
          }
        }
      }
    }
    
    return rules;
  }

  isAllowedByRobotsTxt(url) {
    if (!this.robotsTxtRules || !this.respectRobotsTxt) {
      return true;
    }
    
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname + parsedUrl.search;
    
    // Check if path is explicitly allowed
    for (const allowedPath of this.robotsTxtRules.allowed) {
      if (path.startsWith(allowedPath)) {
        return true;
      }
    }
    
    // Check if path is disallowed
    for (const disallowedPath of this.robotsTxtRules.disallowed) {
      if (path.startsWith(disallowedPath)) {
        return false;
      }
    }
    
    // Default to allowed if no matching rule
    return true;
  }

  addToQueue(url, depth) {
    try {
      // Normalize URL
      const normalizedUrl = this.normalizeUrl(url);
      
      // Skip if already visited or in queue
      if (this.visited.has(normalizedUrl)) {
        return;
      }
      
      // Skip if exceeds max depth
      if (depth > this.maxDepth) {
        return;
      }
      
      // Skip if reached max pages
      if (this.visited.size >= this.maxPages) {
        return;
      }
      
      // Check if URL is in the same domain (if single domain crawling is enabled)
      if (this.crawlSingleDomain) {
        const urlObj = new URL(normalizedUrl);
        if (urlObj.hostname !== this.baseUrl.hostname) {
          return;
        }
      }
      
      // Check exclude patterns
      for (const pattern of this.excludePatterns) {
        if (pattern.test(normalizedUrl)) {
          return;
        }
      }
      
      // Check include patterns if defined
      if (this.includePatterns.length > 0) {
        let included = false;
        for (const pattern of this.includePatterns) {
          if (pattern.test(normalizedUrl)) {
            included = true;
            break;
          }
        }
        if (!included) {
          return;
        }
      }
      
      // Check robots.txt
      if (!this.isAllowedByRobotsTxt(normalizedUrl)) {
        return;
      }
      
      // Add to queue
      this.queue.push({
        url: normalizedUrl,
        depth
      });
      
      this.emit('urlQueued', { url: normalizedUrl, depth });
    } catch (error) {
      console.error('Error adding URL to queue:', error);
    }
  }

  async processQueue() {
    if (this.isStopped || this.visited.size >= this.maxPages) {
      this.finishCrawling();
      return;
    }
    
    // Process multiple URLs concurrently
    while (this.queue.length > 0 && this.activeRequests < this.concurrency) {
      const { url, depth } = this.queue.shift();
      
      // Skip if already visited
      if (this.visited.has(url)) {
        continue;
      }
      
      // Mark as visited
      this.visited.add(url);
      
      // Increment active requests
      this.activeRequests++;
      
      // Process URL
      this.processUrl(url, depth)
        .catch(error => {
          console.error(`Error processing ${url}:`, error);
          this.emit('error', { url, error: error.message });
        })
        .finally(() => {
          // Decrement active requests
          this.activeRequests--;
          
          // Continue processing queue
          setTimeout(() => {
            this.processQueue();
          }, 0);
        });
    }
    
    // If no active requests and queue is empty, finish crawling
    if (this.activeRequests === 0 && this.queue.length === 0) {
      this.finishCrawling();
    }
  }

  async processUrl(url, depth) {
    try {
      this.emit('visiting', { url, depth });
      
      // Fetch URL
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: this.headers,
        proxy: this.proxy,
        maxRedirects: 5,
        validateStatus: status => status < 500 // Accept all responses except server errors
      });
      
      // Add to endpoints
      this.addEndpoint(url, response);
      
      // Process response
      await this.processResponse(url, response, depth);
      
      // Delay before next request
      await new Promise(resolve => setTimeout(resolve, this.delay));
      
      this.emit('visited', { 
        url, 
        status: response.status, 
        contentType: response.headers['content-type'] 
      });
    } catch (error) {
      this.emit('error', { url, error: error.message });
      
      // Add to endpoints even if error
      this.addEndpoint(url, null, error);
    }
  }

  async processResponse(url, response, depth) {
    // Skip non-HTML responses
    const contentType = response.headers['content-type'] || '';
    if (!contentType.includes('text/html')) {
      return;
    }
    
    // Parse HTML
    const $ = cheerio.load(response.data);
    
    // Extract links
    this.extractLinks($, url, depth);
    
    // Extract forms
    this.extractForms($, url);
    
    // Extract resources
    this.extractResources($, url);
    
    // Look for potential security issues
    this.findSecurityIssues($, url, response);
  }

  extractLinks($, baseUrl, depth) {
    $('a[href]').each((i, element) => {
      const href = $(element).attr('href');
      if (!href) return;
      
      try {
        // Resolve relative URL
        const resolvedUrl = new URL(href, baseUrl).toString();
        
        // Add to queue
        this.addToQueue(resolvedUrl, depth + 1);
      } catch (error) {
        // Invalid URL, skip
      }
    });
  }

  extractForms($, url) {
    $('form').each((i, element) => {
      try {
        const $form = $(element);
        const method = ($form.attr('method') || 'get').toLowerCase();
        const action = $form.attr('action') || '';
        
        // Resolve form action URL
        const actionUrl = action ? new URL(action, url).toString() : url;
        
        // Extract form fields
        const fields = [];
        $form.find('input, select, textarea').each((j, field) => {
          const $field = $(field);
          const name = $field.attr('name');
          const type = $field.attr('type') || 'text';
          const value = $field.attr('value') || '';
          
          if (name) {
            fields.push({
              name,
              type,
              value,
              required: $field.attr('required') !== undefined
            });
          }
        });
        
        // Add to forms list
        const formData = {
          id: this.forms.length + 1,
          url,
          actionUrl,
          method,
          fields
        };
        
        this.forms.push(formData);
        this.emit('formFound', formData);
      } catch (error) {
        console.error('Error extracting form:', error);
      }
    });
  }

  extractResources($, url) {
    // Extract scripts
    $('script[src]').each((i, element) => {
      try {
        const src = $(element).attr('src');
        if (src) {
          const resolvedUrl = new URL(src, url).toString();
          this.addResource(resolvedUrl, 'script');
        }
      } catch (error) {
        // Invalid URL, skip
      }
    });
    
    // Extract stylesheets
    $('link[rel="stylesheet"]').each((i, element) => {
      try {
        const href = $(element).attr('href');
        if (href) {
          const resolvedUrl = new URL(href, url).toString();
          this.addResource(resolvedUrl, 'stylesheet');
        }
      } catch (error) {
        // Invalid URL, skip
      }
    });
    
    // Extract images
    $('img[src]').each((i, element) => {
      try {
        const src = $(element).attr('src');
        if (src) {
          const resolvedUrl = new URL(src, url).toString();
          this.addResource(resolvedUrl, 'image');
        }
      } catch (error) {
        // Invalid URL, skip
      }
    });
  }

  findSecurityIssues($, url, response) {
    // Check for common security issues
    
    // 1. Check for sensitive information in HTML comments
    const htmlComments = [];
    const commentRegex = /<!--([\s\S]*?)-->/g;
    let match;
    while ((match = commentRegex.exec(response.data)) !== null) {
      htmlComments.push(match[1].trim());
    }
    
    const sensitivePatterns = [
      /password/i, /api[_\s-]?key/i, /secret/i, /token/i, /credential/i,
      /username/i, /user[_\s-]?id/i, /account/i, /todo/i, /fix ?me/i
    ];
    
    for (const comment of htmlComments) {
      for (const pattern of sensitivePatterns) {
        if (pattern.test(comment)) {
          this.addFinding({
            type: 'Sensitive Information Disclosure',
            url,
            description: 'Potentially sensitive information found in HTML comment',
            evidence: comment.substring(0, 100) + (comment.length > 100 ? '...' : ''),
            severity: 'medium'
          });
          break;
        }
      }
    }
    
    // 2. Check for insecure form submission
    $('form').each((i, element) => {
      const $form = $(element);
      const action = $form.attr('action') || '';
      
      // Check if form submits to HTTP instead of HTTPS
      if (action.startsWith('http:') || (url.startsWith('https:') && !action.startsWith('https:'))) {
        this.addFinding({
          type: 'Insecure Form Submission',
          url,
          description: 'Form submits data over unencrypted HTTP connection',
          evidence: $form.toString().substring(0, 100) + '...',
          severity: 'high'
        });
      }
      
      // Check for password field in non-HTTPS form
      if (url.startsWith('http:') && $form.find('input[type="password"]').length > 0) {
        this.addFinding({
          type: 'Password Over HTTP',
          url,
          description: 'Password field found in form on non-HTTPS page',
          evidence: $form.find('input[type="password"]').toString(),
          severity: 'high'
        });
      }
    });
    
    // 3. Check for missing security headers
    const securityHeaders = {
      'strict-transport-security': 'Strict-Transport-Security header is missing',
      'content-security-policy': 'Content-Security-Policy header is missing',
      'x-content-type-options': 'X-Content-Type-Options header is missing',
      'x-frame-options': 'X-Frame-Options header is missing',
      'x-xss-protection': 'X-XSS-Protection header is missing'
    };
    
    for (const [header, description] of Object.entries(securityHeaders)) {
      if (!response.headers[header]) {
        this.addFinding({
          type: 'Missing Security Header',
          url,
          description,
          evidence: `Header '${header}' not present in response`,
          severity: 'low'
        });
      }
    }
  }
  
  // Stub functions for functionality assumed to be implemented elsewhere
  normalizeUrl(url) {
    try {
      return new URL(url).toString();
    } catch {
      return url;
    }
  }
  
  addEndpoint(url, response, error) {
    // Implementation for storing endpoint information
  }
  
  addResource(url, type) {
    this.resources.set(url, type);
    this.emit('resourceFound', { url, type });
  }
  
  addFinding(finding) {
    this.findings.push(finding);
    this.emit('findingFound', finding);
  }
  
  finishCrawling() {
    this.isRunning = false;
    this.emit('finished', {
      findings: this.findings,
      forms: this.forms,
      endpoints: Array.from(this.endpoints.values()),
      resources: Array.from(this.resources.entries())
    });
  }
}

module.exports = CrawlerService;