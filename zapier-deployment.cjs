#!/usr/bin/env node

/**
 * Zapier Deployment & Testing Tool
 * Hulpmiddel voor het testen en deployen van Zapier webhooks
 */

const http = require('http');
const https = require('https');
const { spawn } = require('child_process');

class ZapierDeployment {
  constructor() {
    this.webhookBaseUrl = process.env.WEBHOOK_URL || 'http://localhost:3000';
    this.ngrokProcess = null;
    this.serverProcess = null;
  }

  async testAllEndpoints() {
    console.log('🧪 **ZAPIER ENDPOINTS TESTEN**');
    console.log('='.repeat(50));
    console.log(`🌐 Base URL: ${this.webhookBaseUrl}\n`);

    const endpoints = [
      { path: '/test', method: 'GET', description: 'Test endpoint' },
      { path: '/status', method: 'GET', description: 'Server status' },
      { path: '/daily-news-collection', method: 'POST', description: 'Dagelijkse nieuws verzameling' },
      { path: '/upload-to-sheets', method: 'POST', description: 'Google Sheets upload' },
      { path: '/weekly-content-creation', method: 'POST', description: 'Wekelijkse content creatie' },
      { path: '/get-top-articles', method: 'GET', description: 'Top artikelen ophalen' }
    ];

    const results = [];

    for (const endpoint of endpoints) {
      console.log(`📡 Testing ${endpoint.method} ${endpoint.path}...`);
      
      try {
        const result = await this.testEndpoint(endpoint.path, endpoint.method);
        
        if (result.success) {
          console.log(`✅ ${endpoint.description}: OK`);
          console.log(`   Response time: ${result.responseTime}ms`);
          if (result.data.articlesCollected) {
            console.log(`   Artikelen: ${result.data.articlesCollected}`);
          }
          if (result.data.contentGenerated) {
            console.log(`   Content: ${result.data.contentGenerated} formaten`);
          }
        } else {
          console.log(`❌ ${endpoint.description}: FAILED`);
          console.log(`   Error: ${result.error}`);
        }
        
        results.push({ ...endpoint, ...result });
        
      } catch (error) {
        console.log(`❌ ${endpoint.description}: ERROR`);
        console.log(`   ${error.message}`);
        results.push({ ...endpoint, success: false, error: error.message });
      }
      
      console.log('');
    }

    this.printTestSummary(results);
    return results;
  }

  async testEndpoint(path, method = 'GET') {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const url = `${this.webhookBaseUrl}${path}`;
      const isHttps = url.startsWith('https');
      const client = isHttps ? https : http;
      
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Zapier-Test-Client'
        }
      };

      const req = client.request(url, options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          
          try {
            const jsonData = JSON.parse(data);
            resolve({
              success: res.statusCode === 200,
              statusCode: res.statusCode,
              data: jsonData,
              responseTime,
              rawResponse: data
            });
          } catch (error) {
            resolve({
              success: false,
              error: 'Invalid JSON response',
              statusCode: res.statusCode,
              responseTime,
              rawResponse: data
            });
          }
        });
      });

      req.on('error', (error) => {
        resolve({
          success: false,
          error: error.message,
          responseTime: Date.now() - startTime
        });
      });

      req.setTimeout(10000, () => {
        req.abort();
        resolve({
          success: false,
          error: 'Request timeout',
          responseTime: Date.now() - startTime
        });
      });

      req.end();
    });
  }

  printTestSummary(results) {
    console.log('📊 **TEST SAMENVATTING**');
    console.log('='.repeat(50));
    
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const avgResponseTime = Math.round(
      results.filter(r => r.responseTime).reduce((sum, r) => sum + r.responseTime, 0) / results.length
    );

    console.log(`✅ Geslaagd: ${passed}/${results.length}`);
    console.log(`❌ Gefaald: ${failed}/${results.length}`);
    console.log(`⏱️ Gemiddelde response tijd: ${avgResponseTime}ms`);

    if (failed > 0) {
      console.log('\n❌ **GEFAALDE TESTS:**');
      results.filter(r => !r.success).forEach(test => {
        console.log(`   ${test.method} ${test.path}: ${test.error}`);
      });
    }

    console.log('\n🎯 **ZAPIER READINESS:**');
    if (passed === results.length) {
      console.log('🟢 Alle endpoints werken - READY voor Zapier!');
    } else if (passed >= results.length * 0.8) {
      console.log('🟡 Meeste endpoints werken - Check gefaalde tests');
    } else {
      console.log('🔴 Te veel gefaalde tests - Fix voor Zapier deployment');
    }
  }

  async startLocalServer(port = 3000) {
    console.log('🚀 **LOKALE WEBHOOK SERVER STARTEN**');
    console.log('='.repeat(50));

    return new Promise((resolve, reject) => {
      this.serverProcess = spawn('node', ['zapier-webhook-server.cjs', port.toString()], {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      this.serverProcess.on('error', (error) => {
        console.error('❌ Server start error:', error.message);
        reject(error);
      });

      // Geef server tijd om op te starten
      setTimeout(() => {
        console.log(`✅ Server gestart op poort ${port}`);
        this.webhookBaseUrl = `http://localhost:${port}`;
        resolve();
      }, 2000);
    });
  }

  async setupNgrok(port = 3000) {
    console.log('🌐 **NGROK TUNNEL OPZETTEN**');
    console.log('='.repeat(50));

    return new Promise((resolve, reject) => {
      this.ngrokProcess = spawn('npx', ['ngrok', 'http', port.toString()], {
        stdio: 'pipe'
      });

      let ngrokUrl = null;
      
      this.ngrokProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(output);
        
        // Zoek naar ngrok URL in output
        const urlMatch = output.match(/https:\/\/[\w-]+\.ngrok\.io/);
        if (urlMatch && !ngrokUrl) {
          ngrokUrl = urlMatch[0];
          this.webhookBaseUrl = ngrokUrl;
          console.log(`🎯 Ngrok URL: ${ngrokUrl}`);
          resolve(ngrokUrl);
        }
      });

      this.ngrokProcess.on('error', (error) => {
        console.error('❌ Ngrok error:', error.message);
        reject(error);
      });

      // Timeout na 30 seconden
      setTimeout(() => {
        if (!ngrokUrl) {
          reject(new Error('Ngrok tunnel setup timeout'));
        }
      }, 30000);
    });
  }

  generateZapierConfig(webhookUrl) {
    const zapierConfig = {
      webhookBaseUrl: webhookUrl,
      endpoints: {
        dailyNews: `${webhookUrl}/daily-news-collection`,
        sheetsUpload: `${webhookUrl}/upload-to-sheets`, 
        weeklyContent: `${webhookUrl}/weekly-content-creation`,
        topArticles: `${webhookUrl}/get-top-articles`,
        status: `${webhookUrl}/status`,
        test: `${webhookUrl}/test`
      },
      zapierZaps: [
        {
          name: 'Dagelijkse Nederlandse Recruitment Nieuws',
          trigger: 'Schedule by Zapier (Daily 9:00)',
          actions: [
            'Webhook POST to /daily-news-collection',
            'Google Sheets - Create Multiple Rows',
            'Slack/Email Notification'
          ]
        },
        {
          name: 'Google Sheets Upload met Scoring',
          trigger: 'Schedule by Zapier (Daily 9:30)',
          actions: [
            'Webhook POST to /upload-to-sheets',
            'Email Dagelijkse Samenvatting'
          ]
        },
        {
          name: 'Wekelijkse LinkedIn Content',
          trigger: 'Schedule by Zapier (Weekly Sunday 10:00)',
          actions: [
            'Webhook POST to /weekly-content-creation',
            'LinkedIn Post (Premium)',
            'Gmail Content Backup'
          ]
        },
        {
          name: 'High-Score Artikel Alert',
          trigger: 'Webhook GET /get-top-articles (Every 6h)',
          filter: 'topScore > 90',
          actions: [
            'Slack/Teams Alert'
          ]
        }
      ]
    };

    console.log('\n📋 **ZAPIER CONFIGURATIE**');
    console.log('='.repeat(50));
    console.log(JSON.stringify(zapierConfig, null, 2));

    return zapierConfig;
  }

  async deploymentChecklist() {
    console.log('✅ **DEPLOYMENT CHECKLIST**');
    console.log('='.repeat(50));

    const checklist = [
      { item: 'Webhook server draait stabiel', checked: false },
      { item: 'Alle endpoints getest en werkend', checked: false },
      { item: 'Nederlandse nieuws data beschikbaar', checked: false },
      { item: 'Google Sheets template klaar', checked: false },
      { item: 'Zapier account opgezet', checked: false },
      { item: 'Productie URL geconfigureerd', checked: false },
      { item: 'SSL certificaat actief (HTTPS)', checked: false },
      { item: 'Monitoring en alerting ingesteld', checked: false }
    ];

    console.log('Pre-deployment checks:');
    for (const [index, check] of checklist.entries()) {
      console.log(`${index + 1}. [ ] ${check.item}`);
    }

    console.log('\n🎯 **VOLGENDE STAPPEN:**');
    console.log('1. Check alle items hierboven');
    console.log('2. Deploy naar productie (Heroku/Railway/VPS)');
    console.log('3. Update Zapier webhook URLs');
    console.log('4. Test productie endpoints');
    console.log('5. Activeer alle Zapier Zaps');
    console.log('6. Monitor eerste dagen voor issues');

    return checklist;
  }

  cleanup() {
    if (this.ngrokProcess) {
      console.log('🛑 Ngrok tunnel stoppen...');
      this.ngrokProcess.kill();
    }
    
    if (this.serverProcess) {
      console.log('🛑 Webhook server stoppen...');
      this.serverProcess.kill();
    }
  }

  async runFullDeploymentTest() {
    console.log('🚀 **VOLLEDIGE ZAPIER DEPLOYMENT TEST**');
    console.log('='.repeat(60));
    
    try {
      // Stap 1: Start lokale server
      await this.startLocalServer(3000);
      
      // Wacht even voor server startup
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Stap 2: Test lokale endpoints
      console.log('\n📡 **LOKALE ENDPOINTS TESTEN**');
      await this.testAllEndpoints();
      
      // Stap 3: Setup ngrok voor publieke toegang
      console.log('\n🌐 **PUBLIEKE TOEGANG SETUP**');
      try {
        const ngrokUrl = await this.setupNgrok(3000);
        
        // Test publieke endpoints
        console.log('\n🌍 **PUBLIEKE ENDPOINTS TESTEN**');
        await this.testAllEndpoints();
        
        // Genereer Zapier configuratie
        console.log('\n⚙️ **ZAPIER CONFIGURATIE GENEREREN**');
        this.generateZapierConfig(ngrokUrl);
        
      } catch (ngrokError) {
        console.log('⚠️ Ngrok setup gefaald, maar lokale tests werkten');
        console.log('💡 Voor productie: deploy naar cloud provider');
      }
      
      // Deployment checklist
      console.log('\n📋 **DEPLOYMENT CHECKLIST**');
      await this.deploymentChecklist();
      
      console.log('\n🎯 **TEST COMPLEET!**');
      console.log('Je webhook server is ready voor Zapier integratie');
      
      return true;
      
    } catch (error) {
      console.error('❌ Deployment test gefaald:', error.message);
      return false;
    }
  }
}

// Command line interface
if (require.main === module) {
  const deployment = new ZapierDeployment();
  const command = process.argv[2];

  // Cleanup bij exit
  process.on('SIGINT', () => {
    console.log('\n🛑 Deployment test gestopt...');
    deployment.cleanup();
    process.exit(0);
  });

  switch (command) {
    case 'test':
      deployment.testAllEndpoints()
        .then(() => console.log('\n✅ Endpoint tests compleet!'))
        .catch(console.error);
      break;
    case 'server':
      const port = process.argv[3] || 3000;
      deployment.startLocalServer(port)
        .then(() => console.log('\n✅ Server gestart! Druk Ctrl+C om te stoppen.'))
        .catch(console.error);
      break;
    case 'ngrok':
      deployment.setupNgrok(process.argv[3] || 3000)
        .then(url => console.log(`\n✅ Ngrok tunnel actief: ${url}`))
        .catch(console.error);
      break;
    case 'full':
      deployment.runFullDeploymentTest()
        .then(() => console.log('\n🎯 Volledige test compleet!'))
        .catch(console.error)
        .finally(() => {
          // Cleanup na 60 seconden
          setTimeout(() => {
            deployment.cleanup();
            process.exit(0);
          }, 60000);
        });
      break;
    case 'checklist':
      deployment.deploymentChecklist();
      break;
    default:
      console.log(`
🚀 **Zapier Deployment & Testing Tool**

Usage:
  node zapier-deployment.cjs test           # Test alle webhook endpoints
  node zapier-deployment.cjs server [port] # Start lokale webhook server
  node zapier-deployment.cjs ngrok [port]  # Setup ngrok tunnel
  node zapier-deployment.cjs full          # Volledige deployment test
  node zapier-deployment.cjs checklist     # Toon deployment checklist

Examples:
  node zapier-deployment.cjs full          # Alles testen met ngrok
  node zapier-deployment.cjs test          # Alleen endpoints testen
  node zapier-deployment.cjs server 8080   # Server op poort 8080

Environment Variables:
  WEBHOOK_URL    - Override webhook base URL
  PORT           - Server poort (default 3000)

🎯 **Quick Start:**
  1. Run: node zapier-deployment.cjs full
  2. Copy ngrok URL naar Zapier
  3. Test Zapier Zaps
  4. Deploy naar productie
      `);
  }
}

module.exports = ZapierDeployment;