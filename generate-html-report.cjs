#!/usr/bin/env node

/**
 * HTML Report Generator
 * Genereert mooie HTML rapporten van daily intelligence data
 */

const fs = require('fs').promises;
const path = require('path');

class HTMLReportGenerator {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.outputDir = path.join(__dirname, 'reports');
  }

  async ensureOutputDir() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      // Directory exists
    }
  }

  async generateDailyIntelligenceReport() {
    await this.ensureOutputDir();
    
    try {
      // Load latest intelligence data
      const latestBriefing = await this.loadLatestBriefing();
      const latestNews = await this.loadLatestNews();
      
      const html = this.createIntelligenceHTML(latestBriefing, latestNews);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `daily-intelligence-${timestamp}.html`;
      const filepath = path.join(this.outputDir, filename);
      
      await fs.writeFile(filepath, html);
      await fs.writeFile(path.join(this.outputDir, 'latest-intelligence.html'), html);
      
      console.log(`✅ HTML rapport gegenereerd: ${filename}`);
      console.log(`📁 Locatie: ${filepath}`);
      
      return filepath;
    } catch (error) {
      console.error('❌ Fout bij genereren HTML rapport:', error.message);
      throw error;
    }
  }

  async loadLatestBriefing() {
    try {
      const content = await fs.readFile(path.join(this.dataDir, 'latest-daily-briefing.json'), 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  async loadLatestNews() {
    try {
      // Probeer eerst Nederlandse nieuws data
      const dutchContent = await fs.readFile(path.join(this.dataDir, 'latest-dutch-news.json'), 'utf-8');
      const dutchNews = JSON.parse(dutchContent);
      console.log('✅ Nederlandse nieuws data geladen');
      return dutchNews;
    } catch (error) {
      // Fallback naar algemene nieuws data
      try {
        const content = await fs.readFile(path.join(this.dataDir, 'latest-news-analysis.json'), 'utf-8');
        console.log('⚠️  Fallback naar algemene nieuws data');
        return JSON.parse(content);
      } catch (error2) {
        console.log('❌ Geen nieuws data gevonden');
        return null;
      }
    }
  }

  createIntelligenceHTML(briefingData, newsData) {
    const currentDate = new Date().toLocaleDateString('nl-NL', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    return `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Recruitment Intelligence - ${currentDate}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 15px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .stat-label {
            color: #666;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 0.9rem;
        }
        
        .section {
            background: white;
            margin-bottom: 25px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .section-header {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 20px 30px;
            font-size: 1.3rem;
            font-weight: 600;
        }
        
        .section-content {
            padding: 30px;
        }
        
        .news-category {
            margin-bottom: 25px;
            padding-bottom: 25px;
            border-bottom: 1px solid #eee;
        }
        
        .news-category:last-child {
            border-bottom: none;
        }
        
        .category-title {
            color: #667eea;
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .article {
            background: #f8f9fa;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        
        .article-title {
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
            line-height: 1.4;
        }
        
        .article-description {
            color: #666;
            font-size: 0.95rem;
            margin-bottom: 5px;
        }
        
        .article-source {
            font-size: 0.8rem;
            color: #999;
            font-style: italic;
        }
        
        .insights-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .insight-card {
            background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
            padding: 20px;
            border-radius: 10px;
            border-left: 5px solid #ff6b6b;
        }
        
        .insight-card h4 {
            color: #d63031;
            margin-bottom: 10px;
            font-size: 1.1rem;
        }
        
        .insight-card p {
            color: #2d3436;
            font-size: 0.95rem;
        }
        
        .recommendations {
            background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%);
            padding: 25px;
            border-radius: 10px;
            margin-top: 25px;
        }
        
        .recommendations h3 {
            color: #6c5ce7;
            margin-bottom: 15px;
            font-size: 1.3rem;
        }
        
        .rec-item {
            background: white;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 8px;
            border-left: 4px solid #6c5ce7;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .rec-title {
            font-weight: 600;
            color: #2d3436;
            margin-bottom: 5px;
        }
        
        .rec-desc {
            color: #636e72;
            font-size: 0.9rem;
        }
        
        .priority-high {
            border-left-color: #e74c3c;
        }
        
        .priority-medium {
            border-left-color: #f39c12;
        }
        
        .footer {
            text-align: center;
            padding: 30px;
            color: #666;
            background: white;
            border-radius: 12px;
            margin-top: 30px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .timestamp {
            font-size: 0.9rem;
            color: #999;
            margin-top: 10px;
        }

        .competitive-intel {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .market-data {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
        }

        .trend-analysis {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🇳🇱 Nederlandse Recruitment Intelligence</h1>
            <p>${currentDate}</p>
        </div>

        ${this.generateStatsSection(briefingData, newsData)}
        
        ${this.generateNewsSection(newsData)}
        
        ${this.generateCompetitorSection(briefingData)}
        
        ${this.generateMarketDataSection(briefingData)}
        
        ${this.generateRecommendationsSection(briefingData)}
        
        <div class="footer">
            <p><strong>🎯 Recruitment Intelligence Platform</strong></p>
            <p>Automated daily briefing combining news analysis, competitor intelligence, salary benchmarks, and market trends</p>
            <div class="timestamp">
                Generated: ${new Date().toLocaleString('nl-NL')}
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  generateStatsSection(briefingData, newsData) {
    const stats = {
      articles: newsData?.totalArticles || 0,
      categories: newsData?.categories?.length || 0,
      competitors: briefingData?.sections?.competitor_intelligence?.scan_results?.length || 0,
      salary_points: briefingData?.sections?.salary_pulse?.length || 0
    };

    return `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${stats.articles}</div>
                <div class="stat-label">News Articles</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.categories}</div>
                <div class="stat-label">Topic Categories</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.competitors}</div>
                <div class="stat-label">Competitor Insights</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.salary_points}</div>
                <div class="stat-label">Salary Data Points</div>
            </div>
        </div>`;
  }

  generateNewsSection(newsData) {
    if (!newsData || !newsData.categories) {
      return `<div class="section">
                <div class="section-header">🇳🇱 Nederlandse Recruitment Nieuws</div>
                <div class="section-content">
                    <p>Geen Nederlandse nieuws data beschikbaar.</p>
                </div>
              </div>`;
    }

    const categoriesHTML = newsData.categories.map(category => `
        <div class="news-category">
            <div class="category-title">${category.title} (${category.count} articles)</div>
            ${category.articles.slice(0, 3).map(article => `
                <div class="article">
                    <div class="article-title">${article.title}</div>
                    <div class="article-description">${article.description}</div>
                    <div class="article-source">Bron: ${new URL(article.url).hostname}</div>
                </div>
            `).join('')}
        </div>
    `).join('');

    const insightsHTML = newsData.insights ? `
        <div class="insights-grid">
            ${newsData.insights.map(insight => `
                <div class="insight-card">
                    <h4>💡 Key Insight</h4>
                    <p>${insight}</p>
                </div>
            `).join('')}
        </div>` : '';

    return `
        <div class="section">
            <div class="section-header">🇳🇱 Nederlandse Recruitment Nieuws</div>
            <div class="section-content">
                ${categoriesHTML}
                ${insightsHTML}
            </div>
        </div>`;
  }

  generateCompetitorSection(briefingData) {
    if (!briefingData?.sections?.competitor_intelligence) {
      return `<div class="section">
                <div class="section-header competitive-intel">🏢 Competitor Intelligence</div>
                <div class="section-content">
                    <p>Geen competitor data beschikbaar.</p>
                </div>
              </div>`;
    }

    return `
        <div class="section">
            <div class="section-header competitive-intel">🏢 Competitor Intelligence</div>
            <div class="section-content">
                <p><strong>Status:</strong> ${briefingData.sections.competitor_intelligence.scan_results?.length || 0} ontwikkelingen gemonitord</p>
                <p><strong>Focus:</strong> Funding, hiring activiteiten, product launches, partnerships</p>
                <div class="insight-card">
                    <h4>🎯 Competitive Outlook</h4>
                    <p>Markt toont actieve beweging in recruitment sector met focus op AI-technologie en remote work capabilities.</p>
                </div>
            </div>
        </div>`;
  }

  generateMarketDataSection(briefingData) {
    if (!briefingData?.sections?.salary_pulse) {
      return `<div class="section">
                <div class="section-header market-data">💰 Market Data</div>
                <div class="section-content">
                    <p>Geen market data beschikbaar.</p>
                </div>
              </div>`;
    }

    const salaryHTML = briefingData.sections.salary_pulse.map(item => `
        <div class="article">
            <div class="article-title">${item.role}</div>
            <div class="article-description">
                Gemiddeld salaris: €${item.data?.average?.toLocaleString() || 'N/A'}<br>
                Range: €${item.data?.min?.toLocaleString() || 'N/A'} - €${item.data?.max?.toLocaleString() || 'N/A'}<br>
                Trend: ${item.data?.trend || 'Unknown'}
            </div>
        </div>
    `).join('');

    return `
        <div class="section">
            <div class="section-header market-data">💰 Salary Market Data</div>
            <div class="section-content">
                ${salaryHTML}
            </div>
        </div>`;
  }

  generateRecommendationsSection(briefingData) {
    const defaultRecommendations = [
      {
        area: 'AI Focus',
        recommendation: 'Prioriteer AI/ML expertise in recruitment strategieën',
        priority: 'High',
        timeline: 'Direct'
      },
      {
        area: 'Market Monitoring',
        recommendation: 'Blijf concurrent ontwikkelingen volgen voor strategische voordelen',
        priority: 'Medium',
        timeline: 'Doorlopend'
      },
      {
        area: 'Salary Strategy',
        recommendation: 'Update compensatie pakketten volgens laatste marktdata',
        priority: 'High',
        timeline: 'Dit kwartaal'
      }
    ];

    const recommendations = briefingData?.executive_summary?.strategic_recommendations || defaultRecommendations;

    const recsHTML = recommendations.map(rec => `
        <div class="rec-item priority-${rec.priority?.toLowerCase() || 'medium'}">
            <div class="rec-title">${rec.area}</div>
            <div class="rec-desc">${rec.recommendation}</div>
            <small><strong>Prioriteit:</strong> ${rec.priority} | <strong>Timeline:</strong> ${rec.timeline}</small>
        </div>
    `).join('');

    return `
        <div class="recommendations">
            <h3>💼 Strategic Recommendations</h3>
            ${recsHTML}
        </div>`;
  }
}

// Command line interface
if (require.main === module) {
  const generator = new HTMLReportGenerator();
  const command = process.argv[2];
  
  switch (command) {
    case 'generate':
    case 'create':
      generator.generateDailyIntelligenceReport()
        .then(filepath => {
          console.log(`\n🎯 HTML rapport succesvol gegenereerd!`);
          console.log(`📁 Open het bestand: ${filepath}`);
          console.log(`🌐 Of gebruik: open "${filepath}"`);
        })
        .catch(console.error);
      break;
    default:
      console.log(`
🚀 **HTML Report Generator**

Usage:
  node generate-html-report.cjs generate    # Genereer HTML rapport

Output:
  📁 /Users/wouterarts/Downloads/local-mcp-apps/reports/
  📄 daily-intelligence-YYYY-MM-DD.html
  📄 latest-intelligence.html (altijd nieuwste)

Features:
  📊 Visuele statistieken dashboard
  📰 Structured news analysis
  🏢 Competitor intelligence overzicht  
  💰 Salary market data
  💼 Strategic recommendations
  
💡 **Perfect voor presentaties en team sharing!**
      `);
  }
}

module.exports = HTMLReportGenerator;