const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

class CertificateService {
  constructor() {
    this.initialized = false;
    this.certPath = path.join(app.getPath('userData'), 'certs');
    this.caCert = null;
    this.caKey = null;
  }

  async initialize() {
    try {
      // Create certs directory if it doesn't exist
      if (!fs.existsSync(this.certPath)) {
        fs.mkdirSync(this.certPath, { recursive: true });
      }

      // Check for existing CA certificate and key
      const caCertPath = path.join(this.certPath, 'ca.crt');
      const caKeyPath = path.join(this.certPath, 'ca.key');

      if (!fs.existsSync(caCertPath) || !fs.existsSync(caKeyPath)) {
        // Generate new CA certificate and key
        const { cert, key } = this.generateCACertificate();
        fs.writeFileSync(caCertPath, cert);
        fs.writeFileSync(caKeyPath, key);
      }

      // Load CA certificate and key
      this.caCert = fs.readFileSync(caCertPath, 'utf8');
      this.caKey = fs.readFileSync(caKeyPath, 'utf8');
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize certificate service:', error);
      throw error;
    }
  }

  isInitialized() {
    return this.initialized;
  }

  getCACertificate() {
    return this.caCert;
  }

  getCAKey() {
    return this.caKey;
  }

  generateCACertificate() {
    // Generate a new certificate authority
    const keys = forge.pki.rsa.generateKeyPair(2048);
    const cert = forge.pki.createCertificate();

    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);

    const attrs = [{
      name: 'commonName',
      value: 'Bug Bounty Hunter CA'
    }, {
      name: 'countryName',
      value: 'US'
    }, {
      shortName: 'ST',
      value: 'California'
    }, {
      name: 'localityName',
      value: 'San Francisco'
    }, {
      name: 'organizationName',
      value: 'Bug Bounty Hunter'
    }, {
      shortName: 'OU',
      value: 'Development'
    }];

    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.setExtensions([{
      name: 'basicConstraints',
      cA: true
    }, {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true
    }]);

    // Self-sign the certificate
    cert.sign(keys.privateKey, forge.md.sha256.create());

    return {
      cert: forge.pki.certificateToPem(cert),
      key: forge.pki.privateKeyToPem(keys.privateKey)
    };
  }
}

module.exports = CertificateService;
