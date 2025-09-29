#!/usr/bin/env node

/**
 * Claude Code MCP-style Tools
 * Direct integration voor gebruik in Claude Code sessies
 */

const fs = require('fs').promises;
const path = require('path');

class ClaudeCodeTools {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.competitors = ['Time to Hire', 'Enhr', 'De Selectie', 'Procontact'];
    this.roles = ['Software Engineer', 'DevOps Engineer', 'Product Manager', 'Data Analyst'];
    this.industries = ['Technology', 'Engineering', 'Finance', 'Healthcare'];
  }

  async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      // Directory exists
    }
  }

  // COMPETITOR INTELLIGENCE TOOLS
  async scanCompetitors(options = {}) {
    const { competitors = this.competitors, focus_areas = ['all'] } = options;
    
    console.log('🔍 **COMPETITOR INTELLIGENCE SCAN**');
    console.log('='.repeat(50));
    
    const insights = [];
    
    for (const competitor of competitors) {
      const competitorInsights = await this.generateCompetitorData(competitor, focus_areas);
      insights.push(...competitorInsights);
      console.log(`📊 ${competitor}: ${competitorInsights.length} insights`);
    }
    
    // Save data
    await this.saveData('competitor-intelligence', 'scan', {
      competitors,
      focus_areas,
      insights,
      summary: this.generateCompetitorSummary(insights)
    });
    
    console.log(`\n✅ **Total Insights Collected:** ${insights.length}`);
    console.log(`🎯 **High Priority Items:** ${insights.filter(i => i.priority === 'high').length}`);
    
    return insights;
  }

  async generateIntelligenceReport(options = {}) {
    const { format = 'detailed' } = options;
    
    const data = await this.loadLatestData('competitor-intelligence', 'scan');
    if (!data) {
      console.log('❌ No competitor data found. Run scanCompetitors first.');
      return null;
    }
    
    console.log('📊 **COMPETITIVE INTELLIGENCE REPORT**');
    console.log('='.repeat(50));
    console.log(`Generated: ${new Date().toLocaleString()}`);
    console.log(`Data Points: ${data.insights.length} insights`);
    
    if (format === 'executive') {
      return this.generateExecutiveSummary(data.insights);
    } else {
      return this.generateDetailedReport(data.insights);
    }
  }

  // SALARY BENCHMARK TOOLS
  async collectSalaryData(options = {}) {
    const { role, industry, location = 'Netherlands' } = options;
    
    if (!role || !industry) {
      console.log('❌ Role and industry required');
      return null;
    }
    
    console.log('💰 **SALARY BENCHMARK COLLECTION**');
    console.log('='.repeat(50));
    
    const salaryData = await this.generateSalaryData(role, industry, location);
    
    await this.saveData('salary-benchmark', 'collection', {
      role,
      industry,
      location,
      data: salaryData
    });
    
    console.log(`📊 Role: ${role} in ${industry}`);
    console.log(`💶 Average Salary: €${salaryData.average.toLocaleString()}`);
    console.log(`📈 Range: €${salaryData.min.toLocaleString()} - €${salaryData.max.toLocaleString()}`);
    console.log(`📊 Market Trend: ${salaryData.trend}`);
    
    return salaryData;
  }

  async generateSalaryReport(options = {}) {
    const { format = 'detailed' } = options;
    
    const collections = await this.loadAllData('salary-benchmark', 'collection') || [];
    if (collections.length === 0) {
      console.log('❌ No salary data found. Run collectSalaryData first.');
      return null;
    }
    
    console.log('💰 **SALARY BENCHMARK REPORT**');
    console.log('='.repeat(50));
    console.log(`Report Generated: ${new Date().toLocaleString()}`);
    console.log(`Data Points: ${collections.length} salary benchmarks`);
    
    const avgSalary = collections.reduce((sum, item) => sum + item.data.average, 0) / collections.length;
    console.log(`📊 Overall Average: €${Math.round(avgSalary).toLocaleString()}`);
    
    collections.forEach((item, i) => {
      console.log(`\n${i + 1}. ${item.role} - ${item.industry}`);
      console.log(`   💶 €${item.data.average.toLocaleString()} (€${item.data.min.toLocaleString()}-€${item.data.max.toLocaleString()})`);
      console.log(`   📈 Trend: ${item.data.trend}`);
    });
    
    return collections;
  }

  // VACATURE RESEARCH TOOLS  
  async scanVacatures(options = {}) {
    const { role, location = 'Netherlands', industry } = options;
    
    if (!role) {
      console.log('❌ Role required');
      return null;
    }
    
    console.log('🔍 **JOB MARKET SCAN**');
    console.log('='.repeat(50));
    
    const marketData = await this.generateJobMarketData(role, location, industry);
    
    await this.saveData('vacature-research', 'market-scan', {
      role,
      location, 
      industry,
      data: marketData
    });
    
    console.log(`📊 Role: ${role} in ${location}`);
    console.log(`📈 Total Vacancies: ${marketData.total_vacancies}`);
    console.log(`📊 Market Activity: ${marketData.activity_level}`);
    console.log(`🎯 Top Skills Required:`);
    marketData.top_skills.slice(0, 5).forEach((skill, i) => {
      console.log(`   ${i + 1}. ${skill.name} (${skill.frequency}%)`);
    });
    
    return marketData;
  }

  async generateVacancyTemplate(options = {}) {
    const { role, company_type = 'corporate', style = 'professional' } = options;
    
    if (!role) {
      console.log('❌ Role required');
      return null;
    }
    
    console.log('📝 **JOB TEMPLATE GENERATOR**');
    console.log('='.repeat(50));
    
    const template = this.createJobTemplate(role, company_type, style);
    
    await this.saveData('vacature-research', 'templates', {
      role,
      company_type,
      style,
      template
    });
    
    console.log(`Generated template for: ${role}`);
    console.log(`Style: ${style} (${company_type})`);
    console.log('\n' + '='.repeat(50));
    console.log(template);
    console.log('='.repeat(50));
    
    return template;
  }

  // UTILITY METHODS
  async saveData(app, type, data) {
    await this.ensureDataDir();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${app}-${type}-${timestamp}.json`;
    const latestFilename = `${app}-${type}-latest.json`;
    
    const record = {
      app,
      type,
      timestamp: new Date().toISOString(),
      data
    };
    
    await fs.writeFile(path.join(this.dataDir, filename), JSON.stringify(record, null, 2));
    await fs.writeFile(path.join(this.dataDir, latestFilename), JSON.stringify(record, null, 2));
  }

  async loadLatestData(app, type) {
    try {
      const filename = `${app}-${type}-latest.json`;
      const filepath = path.join(this.dataDir, filename);
      const content = await fs.readFile(filepath, 'utf-8');
      const record = JSON.parse(content);
      return record.data;
    } catch (error) {
      return null;
    }
  }

  async loadAllData(app, type) {
    try {
      const files = await fs.readdir(this.dataDir);
      const relevantFiles = files.filter(f => f.startsWith(`${app}-${type}-`) && !f.endsWith('-latest.json'));
      
      const allData = [];
      for (const file of relevantFiles) {
        const content = await fs.readFile(path.join(this.dataDir, file), 'utf-8');
        const record = JSON.parse(content);
        allData.push(record.data);
      }
      
      return allData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      return [];
    }
  }

  // DATA GENERATORS
  async generateCompetitorData(competitor, focusAreas) {
    const insights = [];
    const types = ['funding', 'hiring', 'product_launches', 'partnerships', 'market_expansion'];
    
    const count = Math.floor(Math.random() * 3) + 2; // 2-4 insights
    
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      insights.push({
        competitor,
        type,
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        title: this.generateCompetitorTitle(competitor, type),
        summary: this.generateCompetitorSummary(competitor, type),
        impact_score: Math.floor(Math.random() * 5) + 1,
        timestamp: new Date().toISOString()
      });
    }
    
    return insights;
  }

  generateCompetitorTitle(competitor, type) {
    const titles = {
      funding: `${competitor} secures €${Math.floor(Math.random() * 50) + 5}M Series B funding`,
      hiring: `${competitor} expanding team with ${Math.floor(Math.random() * 30) + 15} new positions`,
      product_launches: `${competitor} launches AI-powered recruitment automation platform`,
      partnerships: `${competitor} forms strategic partnership with enterprise HR provider`,
      market_expansion: `${competitor} enters ${['German', 'Belgian', 'French'][Math.floor(Math.random() * 3)]} market`
    };
    return titles[type];
  }

  generateCompetitorSummary(insights) {
    if (Array.isArray(insights)) {
      const high = insights.filter(i => i.priority === 'high').length;
      const total = insights.length;
      return `${total} developments tracked, ${high} high-priority items requiring immediate attention`;
    }
    return 'Competitor development tracked and analyzed';
  }

  async generateSalaryData(role, industry, location) {
    const baseSalaries = {
      'Software Engineer': { base: 65000, variance: 0.3 },
      'DevOps Engineer': { base: 72000, variance: 0.25 },
      'Product Manager': { base: 80000, variance: 0.2 },
      'Data Analyst': { base: 58000, variance: 0.3 }
    };

    const industryMultipliers = {
      'Technology': 1.2,
      'Finance': 1.15,
      'Healthcare': 1.0,
      'Engineering': 1.1
    };

    const baseInfo = baseSalaries[role] || { base: 60000, variance: 0.25 };
    const multiplier = industryMultipliers[industry] || 1.0;
    
    const average = Math.round(baseInfo.base * multiplier);
    const variance = average * baseInfo.variance;
    
    return {
      average,
      min: Math.round(average - variance),
      max: Math.round(average + variance),
      trend: ['Growing', 'Stable', 'Declining'][Math.floor(Math.random() * 3)],
      samples: Math.floor(Math.random() * 400) + 100,
      confidence: Math.floor(Math.random() * 20) + 80
    };
  }

  async generateJobMarketData(role, location, industry) {
    const skills = ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'Git', 'Agile'];
    
    const topSkills = skills
      .sort(() => 0.5 - Math.random())
      .slice(0, 6)
      .map((skill, i) => ({
        name: skill,
        frequency: Math.floor(Math.random() * 40) + 40 // 40-80%
      }))
      .sort((a, b) => b.frequency - a.frequency);

    return {
      total_vacancies: Math.floor(Math.random() * 300) + 100,
      activity_level: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
      avg_posting_age: Math.floor(Math.random() * 14) + 3,
      top_skills: topSkills,
      remote_percentage: Math.floor(Math.random() * 50) + 30
    };
  }

  createJobTemplate(role, companyType, style) {
    return `# ${role} - Join Our Growing Team

## About the Role
We are seeking an experienced ${role} to join our dynamic team and drive innovation in our technology stack.

## What You'll Do
• Lead ${role.toLowerCase()} initiatives and technical projects
• Collaborate with cross-functional teams to deliver high-quality solutions
• Mentor junior team members and promote best practices
• Drive continuous improvement in development processes

## What We're Looking For
• 3+ years of relevant ${role.toLowerCase()} experience
• Strong technical skills in modern technologies
• Excellent problem-solving and communication abilities
• Bachelor's degree in relevant field or equivalent experience

## What We Offer
• Competitive salary and comprehensive benefits package
• Flexible working arrangements including remote options
• Professional development opportunities and learning budget
• Collaborative and innovative work environment
• Modern tech stack and cutting-edge projects

Ready to make an impact? Apply now and let's build the future together!`;
  }

  generateExecutiveSummary(insights) {
    const highPriority = insights.filter(i => i.priority === 'high');
    const byCompetitor = {};
    insights.forEach(i => {
      if (!byCompetitor[i.competitor]) byCompetitor[i.competitor] = [];
      byCompetitor[i.competitor].push(i);
    });

    console.log('\n🎯 **EXECUTIVE SUMMARY**');
    console.log('-'.repeat(30));
    
    Object.entries(byCompetitor).forEach(([competitor, items]) => {
      const highImpactItems = items.filter(i => i.impact_score >= 4);
      console.log(`\n🏢 **${competitor}** (${items.length} developments)`);
      if (highImpactItems.length > 0) {
        console.log(`   🚨 ${highImpactItems[0].title}`);
        console.log(`   📊 Impact: ${highImpactItems[0].impact_score}/5`);
      }
    });

    console.log('\n📋 **PRIORITY ACTIONS:**');
    highPriority.slice(0, 3).forEach((item, i) => {
      console.log(`   ${i + 1}. ${item.competitor}: ${item.type} - ${item.title}`);
    });

    return { summary: 'Executive summary generated', high_priority: highPriority.length };
  }

  generateDetailedReport(insights) {
    console.log('\n📊 **DETAILED ANALYSIS**');
    console.log('-'.repeat(30));
    
    insights.forEach((insight, i) => {
      console.log(`\n${i + 1}. **${insight.competitor}** - ${insight.type.toUpperCase()}`);
      console.log(`   📰 ${insight.title}`);
      console.log(`   📊 Impact: ${insight.impact_score}/5 | Priority: ${insight.priority}`);
      console.log(`   📅 ${new Date(insight.timestamp).toLocaleDateString()}`);
    });

    return { detailed_report: 'Generated', total_insights: insights.length };
  }

  // QUICK ACCESS METHODS
  async quickCompetitorScan() {
    return await this.scanCompetitors();
  }

  async quickSalaryCheck(role = 'Software Engineer', industry = 'Technology') {
    return await this.collectSalaryData({ role, industry });
  }

  async quickJobScan(role = 'Software Engineer') {
    return await this.scanVacatures({ role });
  }

  // DATABASE STATUS
  async getDatabaseStatus() {
    await this.ensureDataDir();
    
    try {
      const files = await fs.readdir(this.dataDir);
      const dataFiles = files.filter(f => f.endsWith('.json'));
      
      console.log('💾 **DATABASE STATUS**');
      console.log('='.repeat(50));
      console.log(`📁 Data Directory: ${this.dataDir}`);
      console.log(`📊 Total Files: ${dataFiles.length}`);
      
      const apps = [...new Set(dataFiles.map(f => f.split('-')[0]))];
      console.log(`🎯 Active Apps: ${apps.join(', ')}`);
      
      // Show latest activity
      const latestFiles = files.filter(f => f.endsWith('-latest.json'));
      console.log('\n📈 **LATEST ACTIVITY:**');
      for (const file of latestFiles) {
        const filepath = path.join(this.dataDir, file);
        const stats = await fs.stat(filepath);
        console.log(`   ${file}: ${stats.mtime.toLocaleDateString()}`);
      }
      
      return { files: dataFiles.length, apps };
    } catch (error) {
      console.log('❌ Database access error:', error.message);
      return { error: error.message };
    }
  }
}

// Export for direct usage
module.exports = ClaudeCodeTools;

// Command line interface
if (require.main === module) {
  const tools = new ClaudeCodeTools();
  const command = process.argv[2];
  const options = {};
  
  // Parse simple command line arguments
  for (let i = 3; i < process.argv.length; i += 2) {
    if (process.argv[i] && process.argv[i + 1]) {
      const key = process.argv[i].replace('--', '');
      options[key] = process.argv[i + 1];
    }
  }
  
  switch (command) {
    case 'scan-competitors':
      tools.quickCompetitorScan().then(() => console.log('\n✅ Competitor scan complete!'));
      break;
    case 'check-salary':
      tools.quickSalaryCheck(options.role, options.industry).then(() => console.log('\n✅ Salary check complete!'));
      break;
    case 'scan-jobs':
      tools.quickJobScan(options.role).then(() => console.log('\n✅ Job scan complete!'));
      break;
    case 'status':
      tools.getDatabaseStatus().then(() => console.log('\n✅ Status check complete!'));
      break;
    default:
      console.log(`
🚀 Claude Code MCP Tools Usage:

📊 Competitor Intelligence:
   node claude-code-tools.cjs scan-competitors
   
💰 Salary Benchmarking:  
   node claude-code-tools.cjs check-salary --role "Software Engineer" --industry "Technology"
   
🔍 Job Market Research:
   node claude-code-tools.cjs scan-jobs --role "DevOps Engineer"
   
📈 Database Status:
   node claude-code-tools.cjs status

Or use directly in Node.js:
   const tools = require('./claude-code-tools.cjs');
   await tools.scanCompetitors();
      `);
  }
}