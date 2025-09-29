#!/usr/bin/env node

/**
 * Claude Code MCP Tools - Interactive Runner
 * Voor eenvoudig gebruik in Claude Code sessies
 */

const ClaudeCodeTools = require('./claude-code-tools.cjs');

async function runInteractiveTools() {
  const tools = new ClaudeCodeTools();
  
  console.log('🚀 **CLAUDE CODE MCP TOOLS SUITE**');
  console.log('='.repeat(60));
  console.log('Lokaal werkende recruitment intelligence tools\n');

  // 1. Competitor Intelligence Scan
  console.log('1️⃣ **COMPETITOR INTELLIGENCE SCAN**');
  console.log('-'.repeat(40));
  await tools.scanCompetitors();
  
  // Generate intelligence report
  console.log('\n📊 **GENERATING INTELLIGENCE REPORT**');
  console.log('-'.repeat(40));
  await tools.generateIntelligenceReport({ format: 'executive' });

  console.log('\n' + '='.repeat(60));
  
  // 2. Salary Benchmark
  console.log('\n2️⃣ **SALARY BENCHMARK ANALYSIS**');
  console.log('-'.repeat(40));
  await tools.collectSalaryData({ 
    role: 'Software Engineer', 
    industry: 'Technology' 
  });
  
  await tools.collectSalaryData({ 
    role: 'DevOps Engineer', 
    industry: 'Technology' 
  });
  
  await tools.collectSalaryData({ 
    role: 'Product Manager', 
    industry: 'Technology' 
  });

  console.log('\n📊 **SALARY BENCHMARK REPORT**');
  console.log('-'.repeat(40));
  await tools.generateSalaryReport({ format: 'detailed' });

  console.log('\n' + '='.repeat(60));
  
  // 3. Job Market Research
  console.log('\n3️⃣ **JOB MARKET RESEARCH**');
  console.log('-'.repeat(40));
  await tools.scanVacatures({ 
    role: 'Software Engineer',
    location: 'Netherlands',
    industry: 'Technology'
  });
  
  await tools.scanVacatures({ 
    role: 'DevOps Engineer',
    location: 'Netherlands' 
  });

  console.log('\n📝 **JOB TEMPLATE GENERATION**');
  console.log('-'.repeat(40));
  await tools.generateVacancyTemplate({ 
    role: 'Senior Software Engineer',
    company_type: 'scaleup',
    style: 'innovative' 
  });

  console.log('\n' + '='.repeat(60));
  
  // 4. Database Status
  console.log('\n4️⃣ **DATABASE & SYSTEM STATUS**');
  console.log('-'.repeat(40));
  await tools.getDatabaseStatus();

  console.log('\n' + '='.repeat(60));
  console.log('✅ **ALL TOOLS EXECUTED SUCCESSFULLY**');
  console.log('💾 **Data saved locally voor cross-sessie gebruik**');
  console.log('🎯 **Ready voor strategic recruitment decisions**');
  console.log('='.repeat(60));
}

// Quick individual tool functions
async function quickCompetitorScan() {
  const tools = new ClaudeCodeTools();
  console.log('🔍 **QUICK COMPETITOR SCAN**\n');
  const results = await tools.scanCompetitors();
  await tools.generateIntelligenceReport({ format: 'executive' });
  return results;
}

async function quickDailyNews() {
  const DailyNewsReader = require('./daily-news-reader.cjs');
  const newsReader = new DailyNewsReader();
  console.log('📰 **QUICK DAILY NEWS BRIEFING**\n');
  
  await newsReader.analyzeLatestNews();
  await newsReader.getTrendingSummary();
  await newsReader.generateExecutiveBrief();
  
  return true;
}

async function quickSalaryBenchmark(role = 'Software Engineer', industry = 'Technology') {
  const tools = new ClaudeCodeTools();
  console.log(`💰 **QUICK SALARY BENCHMARK: ${role}**\n`);
  const results = await tools.collectSalaryData({ role, industry });
  return results;
}

async function quickJobScan(role = 'Software Engineer') {
  const tools = new ClaudeCodeTools();
  console.log(`🔍 **QUICK JOB MARKET SCAN: ${role}**\n`);
  const results = await tools.scanVacatures({ role });
  return results;
}

async function quickVacatureTemplate(role, style = 'professional') {
  const tools = new ClaudeCodeTools();
  console.log(`📝 **QUICK VACATURE TEMPLATE: ${role}**\n`);
  const results = await tools.generateVacancyTemplate({ role, style });
  return results;
}

// Command line interface
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'all':
      runInteractiveTools().catch(console.error);
      break;
    case 'competitors':
      quickCompetitorScan().catch(console.error);
      break;
    case 'salary':
      const role = process.argv[3] || 'Software Engineer';
      const industry = process.argv[4] || 'Technology';
      quickSalaryBenchmark(role, industry).catch(console.error);
      break;
    case 'jobs':
      const jobRole = process.argv[3] || 'Software Engineer';
      quickJobScan(jobRole).catch(console.error);
      break;
    case 'template':
      const templateRole = process.argv[3] || 'Software Engineer';
      const templateStyle = process.argv[4] || 'professional';
      quickVacatureTemplate(templateRole, templateStyle).catch(console.error);
      break;
    case 'html':
      const HTMLReportGenerator = require('./generate-html-report.cjs');
      const generator = new HTMLReportGenerator();
      generator.generateDailyIntelligenceReport()
        .then(filepath => {
          console.log(`\n🎯 HTML rapport gegenereerd!`);
          console.log(`📄 ${filepath}`);
          console.log(`🌐 Open met: open "${filepath}"`);
        })
        .catch(console.error);
      break;
    case 'dutch':
      const DutchScraper = require('./dutch-recruitment-news-scraper.cjs');
      const scraper = new DutchScraper();
      scraper.scrapeAllDutchSources()
        .then(() => console.log('\n🇳🇱 Nederlandse recruitment data verzameld!'))
        .catch(console.error);
      break;
    case 'sheets':
      const SheetsUploader = require('./google-sheets-uploader.cjs');
      const uploader = new SheetsUploader();
      uploader.runDailyUpload()
        .then(() => console.log('\n📤 Google Sheets upload compleet!'))
        .catch(console.error);
      break;
    case 'linkedin':
      const LinkedInCreator = require('./linkedin-content-creator.cjs');
      const creator = new LinkedInCreator();
      creator.runWeeklyContentCreation()
        .then(() => console.log('\n📝 LinkedIn content gecreëerd!'))
        .catch(console.error);
      break;
    case 'zapier':
      const ZapierServer = require('./zapier-webhook-server.cjs');
      const port = process.argv[3] || 3000;
      const server = new ZapierServer(port);
      server.startServer();
      console.log('\n🚀 Zapier webhook server gestart! Druk Ctrl+C om te stoppen.');
      break;
    case 'test-zapier':
      const ZapierDeployment = require('./zapier-deployment.cjs');
      const deployment = new ZapierDeployment();
      deployment.runFullDeploymentTest()
        .then(() => console.log('\n✅ Zapier test compleet!'))
        .catch(console.error);
      break;
    default:
      console.log(`
🚀 **CLAUDE CODE MCP TOOLS**

Usage:
  node run-tools.cjs all                    # Run alle tools
  node run-tools.cjs competitors            # Quick competitor scan
  node run-tools.cjs salary [role] [industry]  # Quick salary check  
  node run-tools.cjs jobs [role]            # Quick job market scan
  node run-tools.cjs template [role] [style]   # Quick vacancy template
  node run-tools.cjs html                   # Generate HTML rapport
  node run-tools.cjs dutch                  # Verzamel Nederlandse recruitment nieuws
  node run-tools.cjs sheets                 # Upload naar Google Sheets met scoring
  node run-tools.cjs linkedin               # Genereer wekelijkse LinkedIn content
  node run-tools.cjs zapier [port]          # Start Zapier webhook server
  node run-tools.cjs test-zapier            # Test volledige Zapier integratie

Examples:
  node run-tools.cjs salary "DevOps Engineer" "Technology"
  node run-tools.cjs jobs "Product Manager"
  node run-tools.cjs template "Data Scientist" "innovative"

💡 **Voor Claude Code gebruik:**
   Kopieer en run deze commands direct in je Claude Code sessie!
      `);
  }
}

// Export for direct import
module.exports = {
  runInteractiveTools,
  quickCompetitorScan,
  quickSalaryBenchmark,
  quickJobScan,
  quickVacatureTemplate,
  ClaudeCodeTools
};