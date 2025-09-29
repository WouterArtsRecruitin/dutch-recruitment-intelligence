#!/usr/bin/env node

/**
 * Local Database Manager for MCP Apps
 * Simple JSON-based storage with automatic persistence
 */

const fs = require('fs').promises;
const path = require('path');

class LocalDatabase {
  constructor(basePath = '/Users/wouterarts/Downloads/local-mcp-apps/data') {
    this.basePath = basePath;
    this.ensureDataDir();
  }

  async ensureDataDir() {
    try {
      await fs.mkdir(this.basePath, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  // Generate unique filename with timestamp
  getFileName(app, type, timestamp = new Date()) {
    const dateStr = timestamp.toISOString().split('T')[0];
    const timeStr = timestamp.toISOString().replace(/[:.]/g, '-');
    return `${app}-${type}-${timeStr}.json`;
  }

  // Save data with automatic backup
  async save(app, type, data) {
    const fileName = this.getFileName(app, type);
    const filePath = path.join(this.basePath, fileName);
    
    const record = {
      app,
      type,
      timestamp: new Date().toISOString(),
      data: Array.isArray(data) ? data : [data],
      metadata: {
        version: '1.0',
        count: Array.isArray(data) ? data.length : 1,
        size: JSON.stringify(data).length
      }
    };

    try {
      await fs.writeFile(filePath, JSON.stringify(record, null, 2));
      
      // Also save to latest file for easy access
      const latestPath = path.join(this.basePath, `${app}-${type}-latest.json`);
      await fs.writeFile(latestPath, JSON.stringify(record, null, 2));
      
      return {
        success: true,
        fileName,
        filePath,
        recordCount: record.metadata.count
      };
    } catch (error) {
      throw new Error(`Database save failed: ${error.message}`);
    }
  }

  // Load latest data for app/type
  async load(app, type = null) {
    try {
      if (type) {
        // Load specific type
        const latestPath = path.join(this.basePath, `${app}-${type}-latest.json`);
        const content = await fs.readFile(latestPath, 'utf-8');
        const record = JSON.parse(content);
        return record.data;
      } else {
        // Load all types for app
        const files = await fs.readdir(this.basePath);
        const appFiles = files.filter(f => f.startsWith(`${app}-`) && f.endsWith('-latest.json'));
        
        const results = {};
        for (const file of appFiles) {
          const filePath = path.join(this.basePath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const record = JSON.parse(content);
          const typeMatch = file.match(`${app}-(.*)-latest.json`);
          if (typeMatch) {
            results[typeMatch[1]] = record.data;
          }
        }
        return results;
      }
    } catch (error) {
      return null; // No data found
    }
  }

  // Get all available data files
  async list(app = null) {
    try {
      const files = await fs.readdir(this.basePath);
      let relevantFiles = files.filter(f => f.endsWith('.json') && !f.endsWith('-latest.json'));
      
      if (app) {
        relevantFiles = relevantFiles.filter(f => f.startsWith(`${app}-`));
      }

      const fileInfo = await Promise.all(
        relevantFiles.map(async (file) => {
          const filePath = path.join(this.basePath, file);
          const stats = await fs.stat(filePath);
          const content = await fs.readFile(filePath, 'utf-8');
          const record = JSON.parse(content);
          
          return {
            filename: file,
            app: record.app,
            type: record.type,
            timestamp: record.timestamp,
            count: record.metadata.count,
            size: stats.size,
            created: stats.birthtime
          };
        })
      );

      return fileInfo.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      throw new Error(`Database list failed: ${error.message}`);
    }
  }

  // Delete old files (keep last N files per app/type)
  async cleanup(app, type, keepCount = 5) {
    try {
      const allFiles = await this.list(app);
      const typeFiles = allFiles.filter(f => f.type === type);
      
      if (typeFiles.length > keepCount) {
        const filesToDelete = typeFiles.slice(keepCount);
        
        for (const file of filesToDelete) {
          const filePath = path.join(this.basePath, file.filename);
          await fs.unlink(filePath);
        }
        
        return {
          deleted: filesToDelete.length,
          kept: keepCount
        };
      }
      
      return { deleted: 0, kept: typeFiles.length };
    } catch (error) {
      throw new Error(`Database cleanup failed: ${error.message}`);
    }
  }

  // Get storage statistics
  async getStats() {
    try {
      const files = await this.list();
      const apps = [...new Set(files.map(f => f.app))];
      const types = [...new Set(files.map(f => f.type))];
      
      const totalSize = files.reduce((sum, f) => sum + f.size, 0);
      const totalRecords = files.reduce((sum, f) => sum + f.count, 0);

      const appStats = {};
      for (const app of apps) {
        const appFiles = files.filter(f => f.app === app);
        appStats[app] = {
          files: appFiles.length,
          totalSize: appFiles.reduce((sum, f) => sum + f.size, 0),
          totalRecords: appFiles.reduce((sum, f) => sum + f.count, 0),
          types: [...new Set(appFiles.map(f => f.type))]
        };
      }

      return {
        overview: {
          totalFiles: files.length,
          totalSize: Math.round(totalSize / 1024) + ' KB',
          totalRecords,
          apps: apps.length,
          types: types.length
        },
        apps: appStats,
        latestActivity: files.length > 0 ? files[0].timestamp : null
      };
    } catch (error) {
      throw new Error(`Stats failed: ${error.message}`);
    }
  }
}

module.exports = LocalDatabase;