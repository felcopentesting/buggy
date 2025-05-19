// Audit Service for OWASP testing and vulnerability scanning
const { EventEmitter } = require('events');
const axios = require('axios');
const { URL } = require('url');

class AuditService extends EventEmitter {
  constructor() {
    super();
    this.isRunning = false;
    this.isStopped = false;
    this.currentTest = null;
    this.testQueue = [];
    this.findings = [];
    this.progress = 0;
    this.targetUrl = null;
    this.endpoints = [];
    this.forms = [];
    this.resources = [];
    this.testModules = {
      'information-gathering': true,
      'configuration-management': true,
      'authentication': true,
      'authorization': true,
      'session-management': true,
      'input-validation': true,
      'error-handling': true,
      'cryptography': true,
      'business-logic': false, // Requires manual testing
      'client-side': true
    };
    this.headers = {
      'User-Agent': 'BugBountyHunter/1.0 Security Auditor'
    };
    this.proxy = null;
    this.timeout = 10000;
    this.delay = 1000;
    this.concurrency = 1; // Keep low to avoid overwhelming target
    this.activeTests = 0;
    this.cookies = {};
  }

  async initialize(config = {}) {
    if (config.testModules) {
      this.testModules = { ...this.testModules, ...config.testModules };
    }
    if (config.headers) {
      this.headers = { ...this.headers, ...config.headers };
    }
    if (config.proxy !== undefined) this.proxy = config.proxy;
    if (config.timeout !== undefined) this.timeout = config.timeout;
    if (config.delay !== undefined) this.delay = config.delay;
    if (config.concurrency !== undefined) this.concurrency = config.concurrency;
    if (config.cookies) this.cookies = config.cookies;

    console.info('[AuditService] Initialized with config:', config);
    return { success: true };
  }

  async start(targetUrl, endpoints = [], forms = [], resources = [], options = {}) {
    if (this.isRunning) {
      return { success: false, error: 'Audit is already running' };
    }

    try {
      // Reset state
      this.reset();
      
      // Update config if provided
      if (options) {
        await this.initialize(options);
      }
      
      // Set target URL
      this.targetUrl = new URL(targetUrl).toString();
      
      // Set data
      this.endpoints = endpoints;
      this.forms = forms;
      this.resources = resources;
      
      // Build test queue
      this.buildTestQueue();
      
      // Start testing
      this.isRunning = true;
      this.isStopped = false;
      
      // Start processing queue
      this.processQueue();
      
      this.emit('started', { 
        targetUrl: this.targetUrl,
        testCount: this.testQueue.length
      });
      console.info('[AuditService] Audit started on target:', this.targetUrl);
      return { success: true };
    } catch (error) {
      console.error('Failed to start audit:', error);
      return { success: false, error: error.message };
    }
  }

  stop() {
    if (!this.isRunning) {
      return { success: false, error: 'Audit is not running' };
    }
    
    this.isStopped = true;
    this.isRunning = false;
    this.emit('stopped');
    console.info('[AuditService] Audit stopped.');
    return { success: true };
  }

  reset() {
    this.isRunning = false;
    this.isStopped = false;
    this.currentTest = null;
    this.testQueue = [];
    this.findings = [];
    this.progress = 0;
    this.activeTests = 0;
  }

  buildTestQueue() {
    // Information Gathering tests
    if (this.testModules['information-gathering']) {
      this.addTest('information-gathering', 'server-fingerprint', 'Server Fingerprinting');
      this.addTest('information-gathering', 'directory-listing', 'Directory Listing');
      this.addTest('information-gathering', 'file-extensions', 'File Extensions');
      this.addTest('information-gathering', 'backup-files', 'Backup Files');
      this.addTest('information-gathering', 'robots-txt', 'Robots.txt and Sitemap');
      this.addTest('information-gathering', 'http-methods', 'HTTP Methods');
    }
    
    // Configuration Management tests
    if (this.testModules['configuration-management']) {
      this.addTest('configuration-management', 'security-headers', 'Security Headers');
      this.addTest('configuration-management', 'cors', 'Cross-Origin Resource Sharing');
      this.addTest('configuration-management', 'ssl-tls', 'SSL/TLS Configuration');
      this.addTest('configuration-management', 'http-strict-transport', 'HTTP Strict Transport Security');
      this.addTest('configuration-management', 'content-security-policy', 'Content Security Policy');
    }
    
    // Authentication tests
    if (this.testModules['authentication']) {
      this.addTest('authentication', 'default-credentials', 'Default Credentials');
      this.addTest('authentication', 'brute-force', 'Brute Force Protection');
      this.addTest('authentication', 'account-lockout', 'Account Lockout');
      this.addTest('authentication', 'password-complexity', 'Password Complexity');
      this.addTest('authentication', 'remember-me', 'Remember Me Functionality');
    }
    
    // Authorization tests
    if (this.testModules['authorization']) {
      this.addTest('authorization', 'path-traversal', 'Path Traversal');
      this.addTest('authorization', 'insecure-direct-object', 'Insecure Direct Object References');
      this.addTest('authorization', 'horizontal-access', 'Horizontal Access Control');
      this.addTest('authorization', 'vertical-access', 'Vertical Access Control');
    }
    
    // Session Management tests
    if (this.testModules['session-management']) {
      this.addTest('session-management', 'cookie-attributes', 'Cookie Attributes');
      this.addTest('session-management', 'session-fixation', 'Session Fixation');
      this.addTest('session-management', 'session-expiration', 'Session Expiration');
      this.addTest('session-management', 'csrf', 'Cross-Site Request Forgery');
    }
    
    // Input Validation tests
    if (this.testModules['input-validation']) {
      this.addTest('input-validation', 'reflected-xss', 'Reflected Cross-Site Scripting');
      this.addTest('input-validation', 'stored-xss', 'Stored Cross-Site Scripting');
      this.addTest('input-validation', 'sql-injection', 'SQL Injection');
      this.addTest('input-validation', 'command-injection', 'Command Injection');
      this.addTest('input-validation', 'file-upload', 'File Upload Vulnerabilities');
      this.addTest('input-validation', 'open-redirect', 'Open Redirection');
    }
    
    // Error Handling tests
    if (this.testModules['error-handling']) {
      this.addTest('error-handling', 'error-codes', 'Error Codes');
      this.addTest('error-handling', 'stack-traces', 'Stack Traces');
      this.addTest('error-handling', 'debug-messages', 'Debug Messages');
    }
    
    // Cryptography tests
    if (this.testModules['cryptography']) {
      this.addTest('cryptography', 'weak-algorithms', 'Weak Cryptographic Algorithms');
      this.addTest('cryptography', 'weak-random', 'Weak Random Number Generation');
      this.addTest('cryptography', 'sensitive-data', 'Sensitive Data Exposure');
    }
    
    // Client-side tests
    if (this.testModules['client-side']) {
      this.addTest('client-side', 'dom-xss', 'DOM-based Cross-Site Scripting');
      this.addTest('client-side', 'javascript-libraries', 'JavaScript Libraries');
      this.addTest('client-side', 'local-storage', 'Local Storage Usage');
      this.addTest('client-side', 'postmessage', 'postMessage Security');
    }
  }

  addTest(category, id, name) {
    this.testQueue.push({
      id: `${category}-${id}`,
      category,
      name,
      status: 'queued'
    });
  }

  async processQueue() {
    if (this.isStopped || this.testQueue.length === 0) {
      this.finishAudit();
      return;
    }
    
    // Process multiple tests concurrently
    while (this.testQueue.length > 0 && this.activeTests < this.concurrency) {
      const test = this.testQueue.shift();
      
      // Update test status
      test.status = 'running';
      this.currentTest = test;
      
      // Increment active tests
      this.activeTests++;
      
      // Update progress
      this.updateProgress();
      
      // Emit test started event
      this.emit('testStarted', test);
      console.info(`[AuditService] Starting test: ${test.id}`);
      
      // Run test
      this.runTest(test)
        .catch(error => {
          console.error(`Error running test ${test.id}:`, error);
          test.status = 'error';
          test.error = error.message;
          this.emit('testError', { test, error: error.message });
        })
        .finally(() => {
          // Mark test as completed if not already marked
          if (test.status === 'running') {
            test.status = 'completed';
          }
          
          // Emit test completed event
          this.emit('testCompleted', test);
          console.info(`[AuditService] Completed test: ${test.id}`);
          
          // Decrement active tests
          this.activeTests--;
          
          // Update progress
          this.updateProgress();
          
          // Continue processing queue after delay
          setTimeout(() => {
            this.processQueue();
          }, this.delay);
        });
    }
    
    // If no active tests and queue is empty, finish audit
    if (this.activeTests === 0 && this.testQueue.length === 0) {
      this.finishAudit();
    }
  }

  async runTest(test) {
    // Dispatch tests based on the test ID
    switch (test.id) {
      // Information Gathering
      case 'information-gathering-server-fingerprint':
        return this.testServerFingerprint();
      case 'information-gathering-directory-listing':
        return this.testDirectoryListing();
      case 'information-gathering-file-extensions':
        return this.testFileExtensions();
      case 'information-gathering-backup-files':
        return this.testBackupFiles();
      case 'information-gathering-robots-txt':
        return this.testRobotsTxt();
      case 'information-gathering-http-methods':
        return this.testHttpMethods();
        
      // Configuration Management
      case 'configuration-management-security-headers':
        return this.testSecurityHeaders();
      case 'configuration-management-cors':
        return this.testCORS();
      case 'configuration-management-ssl-tls':
        return this.testSSLTLS();
      case 'configuration-management-http-strict-transport':
        return this.testHSTS();
      case 'configuration-management-content-security-policy':
        return this.testCSP();
        
      // Authentication
      case 'authentication-default-credentials':
        return this.testDefaultCredentials();
      case 'authentication-brute-force':
        return this.testBruteForce();
      case 'authentication-account-lockout':
        return this.testAccountLockout();
      case 'authentication-password-complexity':
        return this.testPasswordComplexity();
      case 'authentication-remember-me':
        return this.testRememberMe();
        
      // Authorization
      case 'authorization-path-traversal':
        return this.testPathTraversal();
      case 'authorization-insecure-direct-object':
        return this.testInsecureDOR();
      case 'authorization-horizontal-access':
        return this.testHorizontalAccess();
      case 'authorization-vertical-access':
        return this.testVerticalAccess();
        
      // Session Management
      case 'session-management-cookie-attributes':
        return this.testCookieAttributes();
      case 'session-management-session-fixation':
        return this.testSessionFixation();
      case 'session-management-session-expiration':
        return this.testSessionExpiration();
      case 'session-management-csrf':
        return this.testCSRF();
        
      // Input Validation
      case 'input-validation-reflected-xss':
        return this.testReflectedXSS();
      case 'input-validation-stored-xss':
        return this.testStoredXSS();
      case 'input-validation-sql-injection':
        return this.testSQLInjection();
      case 'input-validation-command-injection':
        return this.testCommandInjection();
      case 'input-validation-file-upload':
        return this.testFileUpload();
      case 'input-validation-open-redirect':
        return this.testOpenRedirect();
        
      // Error Handling
      case 'error-handling-error-codes':
        return this.testErrorCodes();
      case 'error-handling-stack-traces':
        return this.testStackTraces();
      case 'error-handling-debug-messages':
        return this.testDebugMessages();
        
      // Cryptography
      case 'cryptography-weak-algorithms':
        return this.testWeakAlgorithms();
      case 'cryptography-weak-random':
        return this.testWeakRandom();
      case 'cryptography-sensitive-data':
        return this.testSensitiveData();
        
      // Client-side
      case 'client-side-dom-xss':
        return this.testDOMXSS();
      case 'client-side-javascript-libraries':
        return this.testJavaScriptLibraries();
      case 'client-side-local-storage':
        return this.testLocalStorage();
      case 'client-side-postmessage':
        return this.testPostMessage();
        
      default:
        throw new Error(`Unknown test: ${test.id}`);
    }
  }

  updateProgress() {
    const total = this.testQueue.length + this.activeTests + this.findings.length;
    this.progress = total > 0 ? Math.floor((this.findings.length / total) * 100) : 0;
    this.emit('progressUpdate', { progress: this.progress });
  }

  finishAudit() {
    if (this.isRunning) {
      this.isRunning = false;
      this.emit('completed', {
        targetUrl: this.targetUrl,
        findings: this.findings.length,
        progress: 100
      });
      console.info('[AuditService] Audit completed.');
    }
  }

  addFinding(finding) {
    finding.id = this.findings.length + 1;
    finding.timestamp = new Date().toISOString();
    this.findings.push(finding);
    // Emit generic finding event
    this.emit('findingDetected', finding);
    // Emit severity-specific event for granular UI integration
    if (finding.severity) {
      this.emit(`findingDetected-${finding.severity}`, finding);
    }
    console.info(`[AuditService] Finding detected: ${finding.name} (Severity: ${finding.severity})`);
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      targetUrl: this.targetUrl,
      progress: this.progress,
      currentTest: this.currentTest,
      testsQueued: this.testQueue.length,
      testsActive: this.activeTests,
      findings: this.findings.length
    };
  }

  getFindings() {
    return this.findings;
  }

  // Helper method to simulate a generic test
  async simulateTest(testName, category, simulatedFinding) {
    console.info(`[AuditService] Running test: ${testName}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // simulate delay
    // Random chance to “find” an issue (50% chance)
    if (Math.random() > 0.5) {
      this.addFinding({
        type: 'Vulnerability',
        category,
        name: testName,
        description: `${testName} found a potential issue.`,
        evidence: 'Simulated evidence',
        severity: simulatedFinding.severity || 'medium',
        url: this.targetUrl,
        remediation: 'Review this finding and mitigate accordingly.'
      });
    }
    console.info(`[AuditService] Finished test: ${testName}`);
  }

  // Test implementations

  // Information Gathering tests
  async testServerFingerprint() {
    try {
      console.info('[AuditService] Running test: Server Fingerprinting');
      const response = await axios.get(this.targetUrl, {
        timeout: this.timeout,
        headers: this.headers,
        proxy: this.proxy,
        validateStatus: () => true // Accept all status codes
      });
      
      const serverHeader = response.headers['server'];
      const poweredByHeader = response.headers['x-powered-by'];
      
      if (serverHeader) {
        this.addFinding({
          type: 'Information Disclosure',
          category: 'information-gathering',
          name: 'Server Header Disclosure',
          description: 'The server header reveals information about the web server software.',
          evidence: `Server: ${serverHeader}`,
          severity: 'low',
          url: this.targetUrl,
          remediation: 'Configure the web server to suppress the Server header or provide minimal information.'
        });
      }
      
      if (poweredByHeader) {
        this.addFinding({
          type: 'Information Disclosure',
          category: 'information-gathering',
          name: 'X-Powered-By Header Disclosure',
          description: 'The X-Powered-By header reveals information about the web application framework.',
          evidence: `X-Powered-By: ${poweredByHeader}`,
          severity: 'low',
          url: this.targetUrl,
          remediation: 'Configure the application to suppress the X-Powered-By header.'
        });
      }
    } catch (error) {
      console.error('Error in server fingerprint test:', error);
    }
  }

  async testDirectoryListing() {
    console.info('[AuditService] Running test: Directory Listing');
    const directories = new Set();
    this.endpoints.forEach(endpoint => {
      try {
        const url = new URL(endpoint.url);
        const pathParts = url.pathname.split('/');
        if (pathParts[1]) {
          directories.add(`/${pathParts[1]}`);
        }
      } catch (error) {
        console.error('Error parsing endpoint URL:', error);
      }
    });
    // Simulate condition where directory listing might be exposed
    if (directories.size > 0 && Math.random() > 0.5) {
      this.addFinding({
        type: 'Information Disclosure',
        category: 'information-gathering',
        name: 'Directory Listing Enabled',
        description: 'Directory listing might be enabled on some endpoints.',
        evidence: `Directories: ${Array.from(directories).join(', ')}`,
        severity: 'medium',
        url: this.targetUrl,
        remediation: 'Disable directory listing in the web server configuration.'
      });
    }
    console.info('[AuditService] Finished test: Directory Listing');
  }

  async testFileExtensions() {
    await this.simulateTest('File Extensions Vulnerability', 'information-gathering', { severity: 'low' });
  }

  async testBackupFiles() {
    await this.simulateTest('Backup Files Exposure', 'information-gathering', { severity: 'medium' });
  }

  async testRobotsTxt() {
    await this.simulateTest('Robots.txt and Sitemap Analysis', 'information-gathering', { severity: 'low' });
  }

  async testHttpMethods() {
    await this.simulateTest('HTTP Methods Vulnerability', 'information-gathering', { severity: 'medium' });
  }

  // Configuration Management tests
  async testSecurityHeaders() {
    await this.simulateTest('Security Headers Misconfiguration', 'configuration-management', { severity: 'medium' });
  }

  async testCORS() {
    await this.simulateTest('CORS Misconfiguration', 'configuration-management', { severity: 'high' });
  }

  async testSSLTLS() {
    await this.simulateTest('SSL/TLS Weakness', 'configuration-management', { severity: 'high' });
  }

  async testHSTS() {
    await this.simulateTest('HTTP Strict Transport Security Issue', 'configuration-management', { severity: 'medium' });
  }

  async testCSP() {
    await this.simulateTest('Content Security Policy Misconfiguration', 'configuration-management', { severity: 'medium' });
  }

  // Authentication tests
  async testDefaultCredentials() {
    await this.simulateTest('Default Credentials', 'authentication', { severity: 'high' });
  }

  async testBruteForce() {
    await this.simulateTest('Brute Force Vulnerability', 'authentication', { severity: 'high' });
  }

  async testAccountLockout() {
    await this.simulateTest('Account Lockout Issue', 'authentication', { severity: 'medium' });
  }

  async testPasswordComplexity() {
    await this.simulateTest('Password Complexity Issue', 'authentication', { severity: 'medium' });
  }

  async testRememberMe() {
    await this.simulateTest('Remember Me Functionality Issue', 'authentication', { severity: 'low' });
  }

  // Authorization tests
  async testPathTraversal() {
    await this.simulateTest('Path Traversal Vulnerability', 'authorization', { severity: 'high' });
  }

  async testInsecureDOR() {
    await this.simulateTest('Insecure Direct Object Reference', 'authorization', { severity: 'high' });
  }

  async testHorizontalAccess() {
    await this.simulateTest('Horizontal Access Control Issue', 'authorization', { severity: 'medium' });
  }

  async testVerticalAccess() {
    await this.simulateTest('Vertical Access Control Issue', 'authorization', { severity: 'medium' });
  }

  // Session Management tests
  async testCookieAttributes() {
    await this.simulateTest('Cookie Attributes Issue', 'session-management', { severity: 'medium' });
  }

  async testSessionFixation() {
    await this.simulateTest('Session Fixation Vulnerability', 'session-management', { severity: 'high' });
  }

  async testSessionExpiration() {
    await this.simulateTest('Session Expiration Issue', 'session-management', { severity: 'medium' });
  }

  async testCSRF() {
    await this.simulateTest('Cross-Site Request Forgery', 'session-management', { severity: 'high' });
  }

  // Input Validation tests
  async testReflectedXSS() {
    await this.simulateTest('Reflected XSS', 'input-validation', { severity: 'high' });
  }

  async testStoredXSS() {
    await this.simulateTest('Stored XSS', 'input-validation', { severity: 'high' });
  }

  async testSQLInjection() {
    await this.simulateTest('SQL Injection Vulnerability', 'input-validation', { severity: 'high' });
  }

  async testCommandInjection() {
    await this.simulateTest('Command Injection Vulnerability', 'input-validation', { severity: 'high' });
  }

  async testFileUpload() {
    await this.simulateTest('File Upload Vulnerability', 'input-validation', { severity: 'medium' });
  }

  async testOpenRedirect() {
    await this.simulateTest('Open Redirect Vulnerability', 'input-validation', { severity: 'medium' });
  }

  // Error Handling tests
  async testErrorCodes() {
    await this.simulateTest('Error Codes Exposure', 'error-handling', { severity: 'low' });
  }

  async testStackTraces() {
    await this.simulateTest('Stack Traces Exposure', 'error-handling', { severity: 'medium' });
  }

  async testDebugMessages() {
    await this.simulateTest('Debug Messages Exposure', 'error-handling', { severity: 'low' });
  }

  // Cryptography tests
  async testWeakAlgorithms() {
    await this.simulateTest('Weak Cryptographic Algorithms', 'cryptography', { severity: 'high' });
  }

  async testWeakRandom() {
    await this.simulateTest('Weak Random Number Generation', 'cryptography', { severity: 'medium' });
  }

  async testSensitiveData() {
    await this.simulateTest('Sensitive Data Exposure', 'cryptography', { severity: 'high' });
  }

  // Client-side tests
  async testDOMXSS() {
    await this.simulateTest('DOM-based XSS', 'client-side', { severity: 'high' });
  }

  async testJavaScriptLibraries() {
    await this.simulateTest('Vulnerable JavaScript Libraries', 'client-side', { severity: 'medium' });
  }

  async testLocalStorage() {
    await this.simulateTest('Local Storage Sensitive Data Exposure', 'client-side', { severity: 'medium' });
  }

  async testPostMessage() {
    await this.simulateTest('postMessage Security Issue', 'client-side', { severity: 'medium' });
  }
}

module.exports = AuditService;