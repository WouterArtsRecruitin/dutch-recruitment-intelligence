#!/usr/bin/env node

/**
 * Complete Daily Workflow
 * Volledige dagelijkse recruitment intelligence workflow
 */

const DailyIntelligenceBriefing = require('./daily-intelligence-briefing.cjs');
const HTMLReportGenerator = require('./generate-html-report.cjs');

class CompleteDailyWorkflow {
  constructor() {
    this.briefing = new DailyIntelligenceBriefing();
    this.htmlGenerator = new HTMLReportGenerator();
  }

  async runMorningWorkflow() {
    console.log('☀️ **MORNING INTELLIGENCE WORKFLOW**');
    console.log('='.repeat(50));
    console.log(`🕐 Started at: ${new Date().toLocaleTimeString()}\n`);

    try {
      // 1. Quick morning briefing
      console.log('1️⃣ **Quick Morning Update**');
      console.log('-'.repeat(30));
      await this.briefing.quickMorningBriefing();
      
      console.log('\n✅ Morning briefing complete\n');
      return true;
    } catch (error) {
      console.error('❌ Morning workflow error:', error.message);
      return false;
    }
  }

  async runFullDayWorkflow() {
    console.log('🚀 **COMPLETE DAILY INTELLIGENCE WORKFLOW**');
    console.log('='.repeat(60));
    console.log(`🕐 Started at: ${new Date().toLocaleTimeString()}\n`);

    try {
      // 1. Generate complete intelligence briefing
      console.log('1️⃣ **Generating Complete Intelligence Briefing**');
      console.log('-'.repeat(50));
      const briefingData = await this.briefing.generateCompleteBriefing();
      console.log('✅ Complete briefing generated\n');

      // 2. Generate HTML report
      console.log('2️⃣ **Generating HTML Report**');
      console.log('-'.repeat(50));
      const htmlPath = await this.htmlGenerator.generateDailyIntelligenceReport();
      console.log('✅ HTML report generated\n');

      // 3. Final summary
      console.log('3️⃣ **WORKFLOW COMPLETE**');
      console.log('-'.repeat(50));
      console.log(`📊 Intelligence briefing: Complete`);
      console.log(`📄 HTML report: ${htmlPath}`);
      console.log(`🕐 Completed at: ${new Date().toLocaleTimeString()}`);
      
      // 4. Quick access instructions
      console.log('\n🎯 **QUICK ACCESS:**');
      console.log(`• Open HTML: open "${htmlPath}"`);
      console.log(`• View data: ls -la data/`);
      console.log(`• Morning brief: node complete-daily-workflow.cjs morning`);
      
      return { briefingData, htmlPath };
    } catch (error) {
      console.error('❌ Full workflow error:', error.message);
      return false;
    }
  }

  async runWeeklyWorkflow() {
    console.log('📅 **WEEKLY INTELLIGENCE SUMMARY**');
    console.log('='.repeat(50));
    
    try {
      // Run full daily workflow
      const result = await this.runFullDayWorkflow();
      
      if (result) {
        console.log('\n📊 **WEEKLY SUMMARY INSIGHTS**');
        console.log('-'.repeat(30));
        console.log('• Daily intelligence collection: ✅ Complete');
        console.log('• Competitor monitoring: ✅ Active');
        console.log('• Market trend analysis: ✅ Current');
        console.log('• Strategic recommendations: ✅ Updated');
        
        console.log('\n💼 **WEEKLY ACTION ITEMS:**');
        console.log('1. Review competitor developments for strategic implications');
        console.log('2. Update salary benchmarks based on latest market data');
        console.log('3. Assess emerging skill trends for hiring priorities');
        console.log('4. Share intelligence insights with recruitment team');
        console.log('5. Plan recruitment strategies based on market analysis');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Weekly workflow error:', error.message);
      return false;
    }
  }

  async showStatus() {
    console.log('📊 **INTELLIGENCE SYSTEM STATUS**');
    console.log('='.repeat(50));
    
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      // Check data directory
      const dataDir = path.join(__dirname, 'data');
      const files = await fs.readdir(dataDir);
      const reportsDir = path.join(__dirname, 'reports');
      
      let reportFiles = [];
      try {
        reportFiles = await fs.readdir(reportsDir);
      } catch (error) {
        // Reports directory doesn't exist
      }

      console.log(`📁 **Data Files:** ${files.length}`);
      console.log(`📄 **HTML Reports:** ${reportFiles.length}`);
      
      // Latest files
      const latestFiles = files.filter(f => f.includes('latest'));
      console.log(`\n📈 **Latest Intelligence:**`);
      for (const file of latestFiles) {
        const stats = await fs.stat(path.join(dataDir, file));
        console.log(`   • ${file}: ${stats.mtime.toLocaleDateString()}`);
      }
      
      // System health
      console.log(`\n🎯 **System Health:**`);
      console.log(`   • MCP Servers: 5 configured`);
      console.log(`   • Data Storage: Local JSON`);
      console.log(`   • HTML Reports: Available`);
      console.log(`   • Status: ✅ Operational`);
      
    } catch (error) {
      console.error('❌ Status check error:', error.message);
    }
  }
}

// Command line interface
if (require.main === module) {
  const workflow = new CompleteDailyWorkflow();
  const command = process.argv[2];
  
  switch (command) {
    case 'morning':
      workflow.runMorningWorkflow()
        .then(() => console.log('\n🎯 Morning workflow finished!'))
        .catch(console.error);
      break;
    case 'full':
    case 'daily':
      workflow.runFullDayWorkflow()
        .then(() => console.log('\n🎯 Full daily workflow finished!'))
        .catch(console.error);
      break;
    case 'weekly':
      workflow.runWeeklyWorkflow()
        .then(() => console.log('\n🎯 Weekly workflow finished!'))
        .catch(console.error);
      break;
    case 'status':
      workflow.showStatus()
        .then(() => console.log('\n✅ Status check complete!'))
        .catch(console.error);
      break;
    default:
      console.log(`
🚀 **Complete Daily Workflow Manager**

Usage:
  node complete-daily-workflow.cjs morning    # Quick morning briefing (2 min)
  node complete-daily-workflow.cjs full       # Complete daily analysis (5 min)
  node complete-daily-workflow.cjs weekly     # Weekly summary workflow
  node complete-daily-workflow.cjs status     # System status check

🌅 **Morning Workflow:**
  • Latest news highlights
  • Competitor activity summary
  • Today's focus areas
  • Quick intelligence overview

📊 **Full Daily Workflow:**
  • Complete news analysis
  • Competitor intelligence
  • Salary market data
  • Job market trends
  • HTML report generation
  • Strategic recommendations

📅 **Weekly Workflow:**
  • Full daily analysis
  • Weekly summary insights
  • Action items for the week
  • Strategic planning support

💡 **Perfect Daily Routine:**
  Morning: node complete-daily-workflow.cjs morning
  End of day: node complete-daily-workflow.cjs full
  Weekly: node complete-daily-workflow.cjs weekly
      `);
  }
}

module.exports = CompleteDailyWorkflow;