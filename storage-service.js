// Storage Service for managing data persistence

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('events');
const ReportService = require('./report-service');

class StorageService extends EventEmitter {
  constructor(storageDir) {
    super();
    this.storageDir = storageDir || path.join(process.env.HOME || process.env.USERPROFILE, '.bug-bounty-hunter');
    this.repeaterRequestsDir = path.join(this.storageDir, 'repeater');
    this.projectsDir = path.join(this.storageDir, 'projects');
    this.reportService = new ReportService(path.join(this.storageDir, 'reports'));
  }

  async initialize() {
    try {
      // Create storage directories if they don't exist
      if (!fs.existsSync(this.storageDir)) {
        fs.mkdirSync(this.storageDir, { recursive: true });
      }
      
      if (!fs.existsSync(this.repeaterRequestsDir)) {
        fs.mkdirSync(this.repeaterRequestsDir, { recursive: true });
      }
      
      if (!fs.existsSync(this.projectsDir)) {
        fs.mkdirSync(this.projectsDir, { recursive: true });
      }
      
      // Initialize report service
      await this.reportService.initialize();
      
      console.log('Storage service initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize storage service:', error);
      throw error;
    }
  }

  async saveRepeaterRequest(request) {
    try {
      // Generate ID if not provided
      if (!request.id) {
        request.id = uuidv4();
      }
      
      // Add timestamp if not provided
      if (!request.timestamp) {
        request.timestamp = new Date().toISOString();
      }
      
      // Save to file
      const filePath = path.join(this.repeaterRequestsDir, `${request.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(request, null, 2));
      
      return request;
    } catch (error) {
      console.error('Failed to save repeater request:', error);
      throw error;
    }
  }

  async getRepeaterRequests() {
    try {
      const files = fs.readdirSync(this.repeaterRequestsDir);
      const requests = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const data = fs.readFileSync(path.join(this.repeaterRequestsDir, file), 'utf8');
            const request = JSON.parse(data);
            requests.push(request);
          } catch (error) {
            console.error(`Failed to read repeater request ${file}:`, error);
          }
        }
      }
      
      // Sort by timestamp (newest first)
      requests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return requests;
    } catch (error) {
      console.error('Failed to get repeater requests:', error);
      throw error;
    }
  }

  async deleteRepeaterRequest(id) {
    try {
      const filePath = path.join(this.repeaterRequestsDir, `${id}.json`);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      } else {
        throw new Error(`Request with ID ${id} not found`);
      }
    } catch (error) {
      console.error('Failed to delete repeater request:', error);
      throw error;
    }
  }

  // Project management methods
  async createProject(project) {
    try {
      // Generate ID if not provided
      if (!project.id) {
        project.id = uuidv4();
      }
      
      // Add timestamp if not provided
      if (!project.timestamp) {
        project.timestamp = new Date().toISOString();
      }
      
      // Create project directory
      const projectDir = path.join(this.projectsDir, project.id);
      if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
      }
      
      // Save project metadata
      const metadataPath = path.join(projectDir, 'metadata.json');
      fs.writeFileSync(metadataPath, JSON.stringify(project, null, 2));
      
      return project;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }

  async getProjects() {
    try {
      const dirs = fs.readdirSync(this.projectsDir);
      const projects = [];
      
      for (const dir of dirs) {
        const metadataPath = path.join(this.projectsDir, dir, 'metadata.json');
        
        if (fs.existsSync(metadataPath)) {
          try {
            const data = fs.readFileSync(metadataPath, 'utf8');
            const project = JSON.parse(data);
            projects.push(project);
          } catch (error) {
            console.error(`Failed to read project metadata ${dir}:`, error);
          }
        }
      }
      
      // Sort by timestamp (newest first)
      projects.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return projects;
    } catch (error) {
      console.error('Failed to get projects:', error);
      throw error;
    }
  }

  async getProject(id) {
    try {
      const metadataPath = path.join(this.projectsDir, id, 'metadata.json');
      
      if (fs.existsSync(metadataPath)) {
        const data = fs.readFileSync(metadataPath, 'utf8');
        return JSON.parse(data);
      } else {
        throw new Error(`Project with ID ${id} not found`);
      }
    } catch (error) {
      console.error('Failed to get project:', error);
      throw error;
    }
  }

  async updateProject(id, updates) {
    try {
      const project = await this.getProject(id);
      
      // Apply updates
      Object.assign(project, updates);
      
      // Update timestamp
      project.lastModified = new Date().toISOString();
      
      // Save project metadata
      const metadataPath = path.join(this.projectsDir, id, 'metadata.json');
      fs.writeFileSync(metadataPath, JSON.stringify(project, null, 2));
      
      return project;
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  }

  async deleteProject(id) {
    try {
      const projectDir = path.join(this.projectsDir, id);
      
      if (fs.existsSync(projectDir)) {
        // Recursively delete directory
        fs.rmdirSync(projectDir, { recursive: true });
        return true;
      } else {
        throw new Error(`Project with ID ${id} not found`);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  }

  // Report methods (delegated to ReportService)
  async generateReport(data) {
    return this.reportService.generateReport(data);
  }

  async getReports() {
    return this.reportService.getReports();
  }

  async getReport(id) {
    return this.reportService.getReport(id);
  }

  async deleteReport(id) {
    return this.reportService.deleteReport(id);
  }

  async exportReport(id, format) {
    return this.reportService.exportReport(id, format);
  }
}

module.exports = StorageService;
