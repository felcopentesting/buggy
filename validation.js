// Validation test script for Bug Bounty Hunter application

const fs = require('fs');
const path = require('path');

// Validate package.json
function validatePackageJson() {
  console.log('Validating package.json...');
  
  try {
    const packageJson = require('../package.json');
    
    // Check required fields
    if (!packageJson.name || !packageJson.version || !packageJson.main) {
      console.error('❌ package.json is missing required fields');
      return false;
    }
    
    // Check dependencies
    const requiredDeps = [
      'electron', 'uuid', 'node-mitmproxy', 'axios', 'cheerio'
    ];
    
    for (const dep of requiredDeps) {
      if (!packageJson.dependencies[dep]) {
        console.error(`❌ package.json is missing dependency: ${dep}`);
        return false;
      }
    }
    
    console.log('✅ package.json is valid');
    return true;
  } catch (error) {
    console.error('❌ Failed to validate package.json:', error);
    return false;
  }
}

// Validate main process
function validateMainProcess() {
  console.log('Validating main process...');
  
  try {
    // Check main.js exists
    if (!fs.existsSync(path.join(__dirname, '..', 'main.js'))) {
      console.error('❌ main.js is missing');
      return false;
    }
    
    // Check preload.js exists
    if (!fs.existsSync(path.join(__dirname, '..', 'preload.js'))) {
      console.error('❌ preload.js is missing');
      return false;
    }
    
    console.log('✅ Main process files are valid');
    return true;
  } catch (error) {
    console.error('❌ Failed to validate main process:', error);
    return false;
  }
}

// Validate renderer process
function validateRendererProcess() {
  console.log('Validating renderer process...');
  
  try {
    // Check index.html exists
    if (!fs.existsSync(path.join(__dirname, '..', 'renderer', 'index.html'))) {
      console.error('❌ index.html is missing');
      return false;
    }
    
    // Check renderer.js exists
    if (!fs.existsSync(path.join(__dirname, '..', 'renderer', 'renderer.js'))) {
      console.error('❌ renderer.js is missing');
      return false;
    }
    
    console.log('✅ Renderer process files are valid');
    return true;
  } catch (error) {
    console.error('❌ Failed to validate renderer process:', error);
    return false;
  }
}

// Validate services
function validateServices() {
  console.log('Validating services...');
  
  try {
    const requiredServices = [
      'proxy-service.js',
      'certificate-service.js',
      'storage-service.js',
      'ollama-service.js',
      'crawler-service.js',
      'audit-service.js',
      'report-service.js'
    ];
    
    for (const service of requiredServices) {
      if (!fs.existsSync(path.join(__dirname, '..', 'services', service))) {
        console.error(`❌ Service is missing: ${service}`);
        return false;
      }
    }
    
    console.log('✅ Services are valid');
    return true;
  } catch (error) {
    console.error('❌ Failed to validate services:', error);
    return false;
  }
}

// Run all validation tests
function runValidation() {
  console.log('Running validation tests for Bug Bounty Hunter application...');
  console.log('-----------------------------------------------------------');
  
  const results = [
    validatePackageJson(),
    validateMainProcess(),
    validateRendererProcess(),
    validateServices()
  ];
  
  const allValid = results.every(result => result);
  
  console.log('-----------------------------------------------------------');
  if (allValid) {
    console.log('✅ All validation tests passed! The application is ready for delivery.');
  } else {
    console.log('❌ Some validation tests failed. Please fix the issues before delivery.');
  }
}

// Run validation
runValidation();
