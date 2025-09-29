#!/usr/bin/env node

/**
 * Daily Recruitment News Reader
 * MCP integration voor bestaande HTML recruitment news rapporten
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

class DailyNewsReader {
  constructor() {
    this.reportsPath = '/Users/wouterarts/Library/CloudStorage/OneDrive-Recruitin/Recruitment-News-Reports';
    this.dataDir = path.join(__dirname, 'data');
  }

  async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      // Directory exists
    }
  }

  async getLatestReport() {
    try {
      const files = await fs.readdir(this.reportsPath);
      const htmlFiles = files
        .filter(f => f.endsWith('.html') && f.includes('recruitment-news'))
        .sort()
        .reverse(); // Most recent first
      
      if (htmlFiles.length === 0) {
        throw new Error('No recruitment news HTML reports found');
      }
      
      return path.join(this.reportsPath, htmlFiles[0]);
    } catch (error) {
      throw new Error(`Cannot access reports directory: ${error.message}`);
    }
  }

  async parseHTMLReport(filePath) {
    try {
      const htmlContent = await fs.readFile(filePath, 'utf-8');
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;
      
      // Extract basic info
      const title = document.querySelector('h1')?.textContent || 'Unknown';
      const dateString = document.querySelector('.header p')?.textContent || '';
      
      // Extract statistics
      const statCards = document.querySelectorAll('.stat-card');
      const stats = {};
      statCards.forEach(card => {
        const number = card.querySelector('.stat-number')?.textContent;
        const label = card.querySelector('.stat-label')?.textContent;
        if (number && label) {
          stats[label.toLowerCase().replace(/\s+/g, '_')] = parseInt(number);
        }
      });
      
      // Extract categories and articles
      const categories = [];
      const categoryElements = document.querySelectorAll('.category');
      
      categoryElements.forEach(categoryEl => {
        const categoryTitle = categoryEl.querySelector('h2')?.textContent;
        if (!categoryTitle) return;
        
        const articles = [];
        const articleElements = categoryEl.querySelectorAll('.article');
        
        articleElements.forEach(articleEl => {
          const titleEl = articleEl.querySelector('.article-title');
          const descriptionEl = articleEl.querySelector('.article-description');
          const sourceEl = articleEl.querySelector('.article-source');
          
          if (titleEl) {
            articles.push({
              title: titleEl.textContent.trim(),
              url: titleEl.href || '',
              description: descriptionEl?.textContent.trim() || '',
              source: sourceEl?.textContent.trim() || ''
            });
          }
        });
        
        categories.push({
          title: categoryTitle,
          articles: articles,
          count: articles.length
        });
      });
      
      return {
        title,
        date: dateString,
        stats,
        categories,
        totalArticles: categories.reduce((sum, cat) => sum + cat.count, 0),
        filePath: path.basename(filePath)
      };
    } catch (error) {
      throw new Error(`Failed to parse HTML report: ${error.message}`);
    }
  }

  async analyzeLatestNews() {
    console.log('📰 **DAILY RECRUITMENT NEWS ANALYSIS**');
    console.log('='.repeat(50));
    
    const latestReportPath = await this.getLatestReport();
    const report = await this.parseHTMLReport(latestReportPath);
    
    console.log(`📅 **Report Date:** ${report.date}`);
    console.log(`📊 **Total Articles:** ${report.totalArticles}`);
    console.log(`🗂️ **Categories:** ${report.categories.length}`);
    
    // Display statistics
    if (Object.keys(report.stats).length > 0) {
      console.log('\n📈 **Statistics:**');
      Object.entries(report.stats).forEach(([key, value]) => {
        console.log(`   ${key.replace(/_/g, ' ')}: ${value}`);
      });
    }
    
    // Analyze categories
    console.log('\n🏷️ **Category Breakdown:**');
    report.categories.forEach((category, i) => {
      console.log(`   ${i + 1}. ${category.title} (${category.count} articles)`);
    });
    
    // Show top articles per category
    console.log('\n🎯 **Key Articles by Category:**');
    report.categories.forEach(category => {
      if (category.articles.length > 0) {
        console.log(`\n**${category.title.toUpperCase()}:**`);
        category.articles.slice(0, 2).forEach((article, i) => {
          console.log(`   ${i + 1}. ${article.title}`);
          if (article.description.length > 100) {
            console.log(`      ${article.description.substring(0, 100)}...`);
          } else if (article.description) {
            console.log(`      ${article.description}`);
          }
        });
      }
    });
    
    // Generate insights
    console.log('\n💡 **Key Insights:**');
    const insights = this.generateInsights(report);
    insights.forEach((insight, i) => {
      console.log(`   ${i + 1}. ${insight}`);
    });
    
    // Save analysis
    await this.ensureDataDir();
    const analysisData = {
      ...report,
      insights,
      analysis_timestamp: new Date().toISOString()
    };
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `news-analysis-${timestamp}.json`;
    await fs.writeFile(
      path.join(this.dataDir, filename),
      JSON.stringify(analysisData, null, 2)
    );
    await fs.writeFile(
      path.join(this.dataDir, 'latest-news-analysis.json'),
      JSON.stringify(analysisData, null, 2)
    );
    
    console.log(`\n💾 **Analysis saved:** ${filename}`);
    
    return analysisData;
  }

  generateInsights(report) {
    const insights = [];
    
    // AI trend analysis
    const aiArticles = report.categories
      .flatMap(cat => cat.articles)
      .filter(article => 
        article.title.toLowerCase().includes('ai') || 
        article.description.toLowerCase().includes('ai')
      );
    
    if (aiArticles.length > 0) {
      insights.push(`AI blijft hot topic in recruitment met ${aiArticles.length} relevante artikelen`);
    }
    
    // Netherlands specific content
    const nlArticles = report.categories
      .flatMap(cat => cat.articles)
      .filter(article => 
        article.title.toLowerCase().includes('nederland') || 
        article.description.toLowerCase().includes('nederland')
      );
    
    if (nlArticles.length > 0) {
      insights.push(`${nlArticles.length} artikelen specifiek over Nederlandse arbeidsmarkt`);
    }
    
    // Technology focus
    const techTerms = ['technology', 'digital', 'automation', 'remote work', 'hybrid'];
    const techArticles = report.categories
      .flatMap(cat => cat.articles)
      .filter(article => 
        techTerms.some(term => 
          article.title.toLowerCase().includes(term) || 
          article.description.toLowerCase().includes(term)
        )
      );
    
    if (techArticles.length > 0) {
      insights.push(`Technologie trends prominent aanwezig in ${techArticles.length} artikelen`);
    }
    
    // Category distribution insight
    const topCategory = report.categories.reduce((max, cat) => 
      cat.count > max.count ? cat : max, report.categories[0]);
    
    if (topCategory) {
      insights.push(`'${topCategory.title}' is de meest actieve categorie met ${topCategory.count} artikelen`);
    }
    
    // Content quality insight
    const articlesWithDescription = report.categories
      .flatMap(cat => cat.articles)
      .filter(article => article.description && article.description.length > 50);
    
    const qualityRatio = Math.round((articlesWithDescription.length / report.totalArticles) * 100);
    insights.push(`${qualityRatio}% van de artikelen bevat uitgebreide beschrijvingen`);
    
    return insights;
  }

  async getTrendingSummary() {
    console.log('📊 **TRENDING TOPICS SUMMARY**');
    console.log('='.repeat(50));
    
    try {
      const latestAnalysis = JSON.parse(
        await fs.readFile(path.join(this.dataDir, 'latest-news-analysis.json'), 'utf-8')
      );
      
      // Extract trending keywords
      const allText = latestAnalysis.categories
        .flatMap(cat => cat.articles)
        .map(article => `${article.title} ${article.description}`)
        .join(' ')
        .toLowerCase();
      
      const keywords = ['ai', 'remote', 'hybrid', 'technology', 'recruitment', 'hiring', 'talent', 'automation', 'digital', 'skills'];
      const keywordCounts = {};
      
      keywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = allText.match(regex);
        keywordCounts[keyword] = matches ? matches.length : 0;
      });
      
      const trendingKeywords = Object.entries(keywordCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8);
      
      console.log('🔥 **Trending Keywords:**');
      trendingKeywords.forEach(([keyword, count], i) => {
        console.log(`   ${i + 1}. ${keyword.toUpperCase()}: ${count} mentions`);
      });
      
      // Category trends
      console.log('\n📈 **Category Activity:**');
      latestAnalysis.categories
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .forEach((cat, i) => {
          console.log(`   ${i + 1}. ${cat.title}: ${cat.count} articles`);
        });
      
      console.log('\n🎯 **Strategic Implications:**');
      trendingKeywords.slice(0, 3).forEach(([keyword, count]) => {
        console.log(`   • ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} focus suggests market emphasis on innovation and adaptation`);
      });
      
      return { trendingKeywords, categories: latestAnalysis.categories };
    } catch (error) {
      console.log('❌ No previous analysis found. Run analyzeLatestNews first.');
      return null;
    }
  }

  async generateExecutiveBrief() {
    console.log('📋 **EXECUTIVE BRIEF - DAILY RECRUITMENT INTELLIGENCE**');
    console.log('='.repeat(60));
    
    try {
      const latestAnalysis = JSON.parse(
        await fs.readFile(path.join(this.dataDir, 'latest-news-analysis.json'), 'utf-8')
      );
      
      console.log(`**Date:** ${latestAnalysis.date}`);
      console.log(`**Intelligence Sources:** ${latestAnalysis.totalArticles} articles analyzed`);
      console.log(`**Market Coverage:** ${latestAnalysis.categories.length} topic areas`);
      
      console.log('\n🎯 **EXECUTIVE SUMMARY:**');
      console.log('-'.repeat(30));
      
      // Key insights
      latestAnalysis.insights.forEach((insight, i) => {
        console.log(`${i + 1}. ${insight}`);
      });
      
      console.log('\n📊 **PRIORITY TOPICS:**');
      console.log('-'.repeat(30));
      
      // Top 3 categories with sample articles
      const topCategories = latestAnalysis.categories
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
      
      topCategories.forEach((category, i) => {
        console.log(`\n**${i + 1}. ${category.title.toUpperCase()}** (${category.count} articles)`);
        if (category.articles.length > 0) {
          const topArticle = category.articles[0];
          console.log(`   📰 "${topArticle.title}"`);
          if (topArticle.description && topArticle.description.length > 0) {
            const shortDesc = topArticle.description.length > 120 
              ? topArticle.description.substring(0, 120) + '...'
              : topArticle.description;
            console.log(`   📝 ${shortDesc}`);
          }
        }
      });
      
      console.log('\n💼 **STRATEGIC RECOMMENDATIONS:**');
      console.log('-'.repeat(30));
      console.log('1. Monitor AI adoption trends for competitive advantage');
      console.log('2. Adapt recruitment strategies to remote/hybrid preferences'); 
      console.log('3. Invest in technology platforms for improved candidate experience');
      console.log('4. Stay informed about regulatory changes in Dutch labor market');
      console.log('5. Focus on emerging skill requirements in job descriptions');
      
      console.log('\n📅 **NEXT REVIEW:** Tomorrow morning');
      console.log('🔄 **UPDATE FREQUENCY:** Daily intelligence briefings available');
      
      // Save executive brief
      const briefData = {
        date: latestAnalysis.date,
        executive_summary: latestAnalysis.insights,
        priority_topics: topCategories,
        recommendations: [
          'Monitor AI adoption trends for competitive advantage',
          'Adapt recruitment strategies to remote/hybrid preferences',
          'Invest in technology platforms for improved candidate experience',
          'Stay informed about regulatory changes in Dutch labor market',
          'Focus on emerging skill requirements in job descriptions'
        ],
        generated_at: new Date().toISOString()
      };
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      await fs.writeFile(
        path.join(this.dataDir, `executive-brief-${timestamp}.json`),
        JSON.stringify(briefData, null, 2)
      );
      
      return briefData;
    } catch (error) {
      console.log('❌ No analysis data found. Run analyzeLatestNews first.');
      return null;
    }
  }

  async listAvailableReports() {
    try {
      const files = await fs.readdir(this.reportsPath);
      const htmlFiles = files
        .filter(f => f.endsWith('.html'))
        .sort()
        .reverse()
        .slice(0, 10); // Last 10 reports
      
      console.log('📁 **AVAILABLE RECRUITMENT NEWS REPORTS**');
      console.log('='.repeat(50));
      console.log(`📂 Directory: ${this.reportsPath}`);
      console.log(`📊 Showing latest ${htmlFiles.length} reports:\n`);
      
      htmlFiles.forEach((file, i) => {
        const dateMatch = file.match(/recruitment-news-(\d{4}-\d{2}-\d{2})/);
        const date = dateMatch ? dateMatch[1] : 'Unknown date';
        console.log(`   ${i + 1}. ${file} (${date})`);
      });
      
      return htmlFiles;
    } catch (error) {
      console.log('❌ Cannot access reports directory:', error.message);
      return [];
    }
  }
}

// Command line interface
if (require.main === module) {
  const reader = new DailyNewsReader();
  const command = process.argv[2];
  
  switch (command) {
    case 'analyze':
      reader.analyzeLatestNews().then(() => console.log('\n✅ Analysis complete!'));
      break;
    case 'trends':
      reader.getTrendingSummary().then(() => console.log('\n✅ Trends summary complete!'));
      break;
    case 'brief':
      reader.generateExecutiveBrief().then(() => console.log('\n✅ Executive brief complete!'));
      break;
    case 'list':
      reader.listAvailableReports().then(() => console.log('\n✅ Report list complete!'));
      break;
    case 'full':
      console.log('🚀 **COMPLETE DAILY NEWS INTELLIGENCE SUITE**\n');
      reader.analyzeLatestNews()
        .then(() => reader.getTrendingSummary())
        .then(() => reader.generateExecutiveBrief())
        .then(() => console.log('\n🎯 ✅ Complete intelligence briefing finished!'));
      break;
    default:
      console.log(`
🚀 **Daily Recruitment News Reader**

Usage:
  node daily-news-reader.cjs analyze    # Analyze latest HTML report
  node daily-news-reader.cjs trends     # Show trending topics summary  
  node daily-news-reader.cjs brief      # Generate executive briefing
  node daily-news-reader.cjs list       # List available reports
  node daily-news-reader.cjs full       # Complete intelligence suite

Examples:
  node daily-news-reader.cjs full       # Complete daily briefing
  node daily-news-reader.cjs analyze    # Just analyze latest report

💡 **Integrates with existing HTML recruitment news reports**
📂 **Reports location:** ${reader.reportsPath}
      `);
  }
}

module.exports = DailyNewsReader;