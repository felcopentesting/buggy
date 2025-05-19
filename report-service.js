// Report Service for generating and managing security reports

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('events');

class ReportService extends EventEmitter {
  constructor(storageDir) {
    super();
    this.storageDir = storageDir || path.join(process.env.HOME || process.env.USERPROFILE, '.bug-bounty-hunter', 'reports');
    this.reports = [];
  }

  async initialize() {
    try {
      // Create storage directory if it doesn't exist
      if (!fs.existsSync(this.storageDir)) {
        fs.mkdirSync(this.storageDir, { recursive: true });
      }

      // Load existing reports
      await this.loadReports();
      
      console.log(`Report service initialized with ${this.reports.length} reports`);
      return true;
    } catch (error) {
      console.error('Failed to initialize report service:', error);
      throw error;
    }
  }

  async loadReports() {
    try {
      const files = fs.readdirSync(this.storageDir);
      const reportFiles = files.filter(file => file.endsWith('.json'));
      
      this.reports = [];
      
      for (const file of reportFiles) {
        try {
          const reportData = fs.readFileSync(path.join(this.storageDir, file), 'utf8');
          const report = JSON.parse(reportData);
          this.reports.push(report);
        } catch (error) {
          console.error(`Failed to load report ${file}:`, error);
        }
      }
      
      // Sort reports by date (newest first)
      this.reports.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      return this.reports;
    } catch (error) {
      console.error('Failed to load reports:', error);
      return [];
    }
  }

  async generateReport(data) {
    try {
      // Create report object
      const report = {
        id: uuidv4(),
        title: data.title || 'Security Assessment Report',
        target: data.target,
        date: data.date || new Date().toISOString(),
        findings: data.findings || [],
        format: data.format || 'html'
      };
      
      // Save report to file
      const reportPath = path.join(this.storageDir, `${report.id}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      // Add to reports list
      this.reports.unshift(report);
      
      // Generate report file
      const exportPath = await this.exportReport(report.id, report.format);
      
      // Emit event
      this.emit('reportGenerated', { report, exportPath });
      
      return report;
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }

  async getReports() {
    return this.reports;
  }

  async getReport(id) {
    const report = this.reports.find(r => r.id === id);
    
    if (!report) {
      throw new Error(`Report with ID ${id} not found`);
    }
    
    return report;
  }

  async deleteReport(id) {
    const reportIndex = this.reports.findIndex(r => r.id === id);
    
    if (reportIndex === -1) {
      throw new Error(`Report with ID ${id} not found`);
    }
    
    // Remove from reports list
    this.reports.splice(reportIndex, 1);
    
    // Delete report file
    const reportPath = path.join(this.storageDir, `${id}.json`);
    if (fs.existsSync(reportPath)) {
      fs.unlinkSync(reportPath);
    }
    
    // Delete exported report files
    const exportFormats = ['html', 'pdf', 'json'];
    for (const format of exportFormats) {
      const exportPath = path.join(this.storageDir, `${id}.${format}`);
      if (fs.existsSync(exportPath)) {
        fs.unlinkSync(exportPath);
      }
    }
    
    // Emit event
    this.emit('reportDeleted', { id });
    
    return true;
  }

  async exportReport(id, format = 'html') {
    const report = await this.getReport(id);
    const exportPath = path.join(this.storageDir, `${id}.${format}`);
    
    switch (format) {
      case 'html':
        await this.exportHtml(report, exportPath);
        break;
      case 'pdf':
        await this.exportPdf(report, exportPath);
        break;
      case 'json':
        await this.exportJson(report, exportPath);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
    
    return exportPath;
  }

  async exportHtml(report, exportPath) {
    // Generate HTML content
    const html = this.generateHtmlReport(report);
    
    // Write to file
    fs.writeFileSync(exportPath, html);
    
    return exportPath;
  }

  async exportPdf(report, exportPath) {
    // In a real implementation, this would use a PDF generation library
    // For this demo, we'll just create a simple text file
    const content = `PDF Report for ${report.title}\nTarget: ${report.target}\nDate: ${report.date}\nFindings: ${report.findings.length}`;
    
    // Write to file
    fs.writeFileSync(exportPath, content);
    
    return exportPath;
  }

  async exportJson(report, exportPath) {
    // Write to file
    fs.writeFileSync(exportPath, JSON.stringify(report, null, 2));
    
    return exportPath;
  }

  generateHtmlReport(report) {
    // Group findings by category
    const findingsByCategory = {};
    report.findings.forEach(finding => {
      if (!findingsByCategory[finding.category]) {
        findingsByCategory[finding.category] = [];
      }
      findingsByCategory[finding.category].push(finding);
    });
    
    // Count findings by severity
    const severityCounts = {
      high: report.findings.filter(f => f.severity === 'high').length,
      medium: report.findings.filter(f => f.severity === 'medium').length,
      low: report.findings.filter(f => f.severity === 'low').length,
      info: report.findings.filter(f => f.severity === 'info').length
    };
    
    // Generate HTML
    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${report.title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3 {
            color: #2c3e50;
          }
          .report-meta {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .severity-summary {
            display: flex;
            gap: 20px;
            margin: 20px 0;
          }
          .severity-item {
            padding: 15px;
            border-radius: 5px;
            text-align: center;
            color: white;
            flex: 1;
          }
          .severity-count {
            font-size: 24px;
            font-weight: bold;
          }
          .finding {
            border: 1px solid #ddd;
            border-radius: 5px;
            margin-bottom: 20px;
            overflow: hidden;
          }
          .finding-header {
            display: flex;
            justify-content: space-between;
            padding: 10px 15px;
            background-color: #f8f9fa;
            border-bottom: 1px solid #ddd;
          }
          .finding-title {
            font-weight: bold;
          }
          .finding-severity {
            padding: 3px 8px;
            border-radius: 3px;
            color: white;
          }
          .finding-content {
            padding: 15px;
          }
          .finding-description {
            margin-bottom: 15px;
          }
          .finding-details div {
            margin-bottom: 5px;
          }
          code {
            background-color: #f8f9fa;
            padding: 2px 5px;
            border-radius: 3px;
            font-family: monospace;
            word-break: break-all;
          }
          .report-category {
            margin-bottom: 30px;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #777;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <h1>${report.title}</h1>
        
        <div class="report-meta">
          <div><strong>Target:</strong> ${report.target}</div>
          <div><strong>Date:</strong> ${new Date(report.date).toLocaleString()}</div>
          <div><strong>Total Findings:</strong> ${report.findings.length}</div>
        </div>
        
        <h2>Executive Summary</h2>
        <p>
          This security assessment identified ${report.findings.length} findings across 
          ${Object.keys(findingsByCategory).length} categories. The findings are categorized 
          by severity as shown below.
        </p>
        
        <div class="severity-summary">
          <div class="severity-item" style="background-color: #dc3545;">
            <div class="severity-count">${severityCounts.high}</div>
            <div class="severity-label">High</div>
          </div>
          <div class="severity-item" style="background-color: #fd7e14;">
            <div class="severity-count">${severityCounts.medium}</div>
            <div class="severity-label">Medium</div>
          </div>
          <div class="severity-item" style="background-color: #28a745;">
            <div class="severity-count">${severityCounts.low}</div>
            <div class="severity-label">Low</div>
          </div>
          <div class="severity-item" style="background-color: #6c757d;">
            <div class="severity-count">${severityCounts.info}</div>
            <div class="severity-label">Info</div>
          </div>
        </div>
        
        <h2>Findings</h2>
    `;
    
    // Add findings by category
    for (const [category, findings] of Object.entries(findingsByCategory)) {
      const formattedCategory = category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      html += `
        <div class="report-category">
          <h3>${formattedCategory}</h3>
      `;
      
      findings.forEach(finding => {
        const severityColor = 
          finding.severity === 'high' ? '#dc3545' : 
          finding.severity === 'medium' ? '#fd7e14' : 
          finding.severity === 'low' ? '#28a745' : 
          '#6c757d';
        
        html += `
          <div class="finding">
            <div class="finding-header">
              <div class="finding-title">${finding.name || finding.type}</div>
              <div class="finding-severity" style="background-color: ${severityColor};">${finding.severity.toUpperCase()}</div>
            </div>
            <div class="finding-content">
              <div class="finding-description">${finding.description}</div>
              <div class="finding-details">
                <div><strong>URL:</strong> <a href="${finding.url}" target="_blank">${finding.url}</a></div>
                <div><strong>Evidence:</strong> <code>${finding.evidence}</code></div>
                <div><strong>Remediation:</strong> ${finding.remediation}</div>
              </div>
            </div>
          </div>
        `;
      });
      
      html += `
        </div>
      `;
    }
    
    html += `
        <div class="footer">
          <p>Generated by Bug Bounty Hunter on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
    
    return html;
  }
}

module.exports = ReportService;
