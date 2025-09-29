#!/usr/bin/env node

/**
 * Daily Intelligence Briefing
 * Combineert alle MCP tools voor complete dagelijkse recruitment intelligence
 */

const ClaudeCodeTools = require('./claude-code-tools.cjs');
const DailyNewsReader = require('./daily-news-reader.cjs');

class DailyIntelligenceBriefing {
  constructor() {
    this.tools = new ClaudeCodeTools();
    this.newsReader = new DailyNewsReader();
  }

  async generateCompleteBriefing() {
    console.log('🚀 **DAILY RECRUITMENT INTELLIGENCE BRIEFING**');
    console.log('='.repeat(60));
    console.log(`📅 Generated: ${new Date().toLocaleString()}\n`);

    const briefingData = {
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      sections: {}
    };

    try {
      // 1. Daily News Analysis
      console.log('1️⃣ **ANALYZING DAILY RECRUITMENT NEWS**');
      console.log('-'.repeat(50));
      const newsAnalysis = await this.newsReader.analyzeLatestNews();
      briefingData.sections.news_analysis = newsAnalysis;
      console.log('✅ News analysis complete\n');

      // 2. Market Trends Summary  
      console.log('2️⃣ **MARKET TRENDS SUMMARY**');
      console.log('-'.repeat(50));
      const trendsSummary = await this.newsReader.getTrendingSummary();
      briefingData.sections.trends_summary = trendsSummary;
      console.log('✅ Trends analysis complete\n');

      // 3. Competitor Intelligence
      console.log('3️⃣ **COMPETITOR INTELLIGENCE UPDATE**');
      console.log('-'.repeat(50));
      const competitorData = await this.tools.scanCompetitors();
      const competitorReport = await this.tools.generateIntelligenceReport({ format: 'executive' });
      briefingData.sections.competitor_intelligence = {
        scan_results: competitorData,
        executive_report: competitorReport
      };
      console.log('✅ Competitor intelligence complete\n');

      // 4. Salary Market Pulse
      console.log('4️⃣ **SALARY MARKET PULSE**');
      console.log('-'.repeat(50));
      const roles = ['Software Engineer', 'DevOps Engineer', 'Product Manager'];
      const salaryData = [];
      
      for (const role of roles) {
        const data = await this.tools.collectSalaryData({ 
          role, 
          industry: 'Technology' 
        });
        salaryData.push({ role, data });
      }
      
      briefingData.sections.salary_pulse = salaryData;
      console.log('✅ Salary market pulse complete\n');

      // 5. Job Market Activity
      console.log('5️⃣ **JOB MARKET ACTIVITY**');
      console.log('-'.repeat(50));
      const jobMarketRoles = ['Software Engineer', 'Data Scientist', 'DevOps Engineer'];
      const jobMarketData = [];
      
      for (const role of jobMarketRoles) {
        const data = await this.tools.scanVacatures({ role });
        jobMarketData.push({ role, data });
      }
      
      briefingData.sections.job_market = jobMarketData;
      console.log('✅ Job market activity complete\n');

      // 6. Executive Summary Generation
      console.log('6️⃣ **GENERATING EXECUTIVE SUMMARY**');
      console.log('-'.repeat(50));
      const executiveSummary = await this.generateExecutiveSummary(briefingData);
      briefingData.executive_summary = executiveSummary;
      console.log('✅ Executive summary complete\n');

      // 7. Save Complete Briefing
      await this.saveBriefing(briefingData);
      
      // 8. Display Final Summary
      this.displayFinalSummary(briefingData);

      return briefingData;

    } catch (error) {
      console.error('❌ Error generating briefing:', error.message);
      throw error;
    }
  }

  async generateExecutiveSummary(briefingData) {
    const summary = {
      date: briefingData.date,
      key_metrics: {},
      priority_actions: [],
      market_outlook: '',
      strategic_recommendations: []
    };

    // Extract key metrics
    if (briefingData.sections.news_analysis) {
      summary.key_metrics.total_news_articles = briefingData.sections.news_analysis.totalArticles;
      summary.key_metrics.ai_articles = briefingData.sections.news_analysis.insights?.filter(i => i.includes('AI'))?.length || 0;
    }

    if (briefingData.sections.competitor_intelligence) {
      summary.key_metrics.competitor_insights = briefingData.sections.competitor_intelligence.scan_results?.length || 0;
    }

    if (briefingData.sections.salary_pulse) {
      const avgSalary = briefingData.sections.salary_pulse.reduce((sum, item) => 
        sum + (item.data?.average || 0), 0) / briefingData.sections.salary_pulse.length;
      summary.key_metrics.average_tech_salary = Math.round(avgSalary);
    }

    // Generate priority actions
    summary.priority_actions = [
      'Review AI recruitment trends and implementation opportunities',
      'Monitor competitor hiring activities and market positioning',
      'Update salary benchmarks based on latest market data',
      'Assess job market activity for talent acquisition planning',
      'Evaluate emerging skill requirements in job descriptions'
    ];

    // Market outlook
    summary.market_outlook = 'Technology recruitment market shows continued growth with emphasis on AI and remote work capabilities. Salary inflation moderating but still competitive for senior technical roles.';

    // Strategic recommendations
    summary.strategic_recommendations = [
      {
        area: 'Technology Focus',
        recommendation: 'Prioritize AI/ML and cloud expertise in hiring strategies',
        priority: 'High',
        timeline: 'Immediate'
      },
      {
        area: 'Compensation Strategy', 
        recommendation: 'Adjust salary bands to reflect current market rates',
        priority: 'Medium',
        timeline: 'This Quarter'
      },
      {
        area: 'Competitive Positioning',
        recommendation: 'Differentiate through unique value propositions and benefits',
        priority: 'High', 
        timeline: 'This Month'
      },
      {
        area: 'Talent Pipeline',
        recommendation: 'Build relationships with emerging talent in high-demand skills',
        priority: 'Medium',
        timeline: 'Ongoing'
      }
    ];

    return summary;
  }

  async saveBriefing(briefingData) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `daily-intelligence-briefing-${timestamp}.json`;
    const filepath = require('path').join(this.tools.dataDir || __dirname + '/data', filename);
    
    await require('fs').promises.writeFile(
      filepath, 
      JSON.stringify(briefingData, null, 2)
    );

    // Also save as latest
    const latestPath = require('path').join(this.tools.dataDir || __dirname + '/data', 'latest-daily-briefing.json');
    await require('fs').promises.writeFile(
      latestPath,
      JSON.stringify(briefingData, null, 2)  
    );

    console.log(`💾 **Briefing saved:** ${filename}`);
  }

  displayFinalSummary(briefingData) {
    console.log('📋 **EXECUTIVE DASHBOARD**');
    console.log('='.repeat(60));
    
    const summary = briefingData.executive_summary;
    
    console.log(`📅 **Date:** ${summary.date}`);
    console.log(`📊 **Intelligence Sources:**`);
    console.log(`   • News Articles: ${summary.key_metrics.total_news_articles || 0}`);
    console.log(`   • Competitor Insights: ${summary.key_metrics.competitor_insights || 0}`);
    console.log(`   • Salary Data Points: ${briefingData.sections.salary_pulse?.length || 0}`);
    console.log(`   • Job Market Scans: ${briefingData.sections.job_market?.length || 0}`);
    
    console.log(`\n💰 **Market Indicators:**`);
    console.log(`   • Avg Tech Salary: €${summary.key_metrics.average_tech_salary?.toLocaleString() || 'N/A'}`);
    console.log(`   • AI Focus Level: ${summary.key_metrics.ai_articles > 3 ? 'High' : 'Medium'}`);
    
    console.log(`\n🎯 **Priority Actions (Top 3):**`);
    summary.priority_actions.slice(0, 3).forEach((action, i) => {
      console.log(`   ${i + 1}. ${action}`);
    });
    
    console.log(`\n📈 **Market Outlook:**`);
    console.log(`   ${summary.market_outlook}`);
    
    console.log(`\n💼 **Strategic Focus Areas:**`);
    summary.strategic_recommendations.slice(0, 2).forEach(rec => {
      console.log(`   • ${rec.area}: ${rec.recommendation} (${rec.priority} priority)`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 **Daily Recruitment Intelligence Briefing Complete**');
    console.log('📅 **Next Briefing:** Tomorrow morning');
    console.log('🔄 **Data Refresh:** Automated with latest market intelligence');
    console.log('='.repeat(60));
  }

  async quickMorningBriefing() {
    console.log('☀️ **QUICK MORNING INTELLIGENCE UPDATE**\n');
    
    // Just the essentials for a quick start
    try {
      // Latest news headlines
      const newsAnalysis = await this.newsReader.analyzeLatestNews();
      
      console.log(`📰 **News Highlights:**`);
      if (newsAnalysis.categories && newsAnalysis.categories.length > 0) {
        const topCategory = newsAnalysis.categories[0];
        console.log(`   • ${topCategory.title} (${topCategory.count} articles)`);
        if (topCategory.articles && topCategory.articles.length > 0) {
          console.log(`     "${topCategory.articles[0].title}"`);
        }
      }
      
      // Quick competitor check
      console.log(`\n🏢 **Competitor Activity:**`);
      const competitorData = await this.tools.scanCompetitors({ 
        competitors: ['Time to Hire', 'Enhr'] 
      });
      const highPriority = competitorData?.filter(item => item.priority === 'high') || [];
      console.log(`   • ${competitorData?.length || 0} developments tracked`);
      console.log(`   • ${highPriority.length} high-priority items`);
      
      // Today's focus
      console.log(`\n🎯 **Today's Focus:**`);
      console.log(`   • Monitor AI recruitment developments`);
      console.log(`   • Review competitor market positioning`);
      console.log(`   • Update talent acquisition priorities`);
      
      console.log(`\n✅ Quick morning briefing complete!`);
      
    } catch (error) {
      console.error('⚠️ Quick briefing error:', error.message);
      console.log('💡 Run full briefing for complete intelligence update');
    }
  }
}

// Command line interface
if (require.main === module) {
  const briefing = new DailyIntelligenceBriefing();
  const command = process.argv[2];
  
  switch (command) {
    case 'full':
      briefing.generateCompleteBriefing()
        .then(() => console.log('\n🎯 Complete briefing finished!'))
        .catch(console.error);
      break;
    case 'quick':
      briefing.quickMorningBriefing()
        .then(() => console.log('\n🎯 Quick briefing finished!'))
        .catch(console.error);
      break;
    default:
      console.log(`
🚀 **Daily Recruitment Intelligence Briefing**

Usage:
  node daily-intelligence-briefing.cjs full     # Complete daily briefing
  node daily-intelligence-briefing.cjs quick    # Quick morning update

🎯 **Full Briefing includes:**
  • Daily recruitment news analysis
  • Market trends summary  
  • Competitor intelligence update
  • Salary market pulse
  • Job market activity
  • Executive summary & recommendations

⚡ **Quick Briefing includes:**
  • Latest news highlights
  • Competitor activity summary
  • Today's focus areas

💡 **Perfect for daily routine:**
  • Morning: quick briefing (2 minutes)
  • End of day: full briefing (complete intelligence)
      `);
  }
}

module.exports = DailyIntelligenceBriefing;