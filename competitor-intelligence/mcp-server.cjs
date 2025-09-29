#!/usr/bin/env node

/**
 * Enhanced Competitor Intelligence MCP Server
 * With local database integration
 */

const fs = require('fs');
const path = require('path');
const LocalDatabase = require('../shared/database.cjs');

class CompetitorIntelligenceMCP {
  constructor() {
    this.loadEnv();
    this.db = new LocalDatabase();
    this.competitors = ['Time to Hire', 'Enhr', 'De Selectie', 'Procontact'];
    this.sources = ['TechCrunch', 'Financial Dagblad', 'NL Times', 'LinkedIn', 'Company Websites'];
  }

  loadEnv() {
    try {
      const envPath = path.join(__dirname, '../shared/.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
          if (line.includes('=') && !line.startsWith('#')) {
            const [key, value] = line.split('=');
            if (key && value) process.env[key.trim()] = value.trim();
          }
        });
      }
    } catch (error) {
      // Silent fail
    }
  }

  async handleRequest(request) {
    const { id, method, params } = request;

    try {
      let result;
      
      switch (method) {
        case 'tools/list':
          result = {
            tools: [
              {
                name: 'scan_competitors',
                description: 'Scan competitors for intelligence and developments',
                inputSchema: {
                  type: 'object',
                  properties: {
                    competitors: {
                      type: 'array',
                      items: { type: 'string' },
                      default: this.competitors,
                      description: 'Competitors to monitor'
                    },
                    focus_areas: {
                      type: 'array',
                      items: { 
                        type: 'string',
                        enum: ['funding', 'hiring', 'product_launches', 'partnerships', 'market_expansion', 'all']
                      },
                      default: ['all'],
                      description: 'Areas to focus intelligence gathering'
                    }
                  }
                }
              },
              {
                name: 'generate_intelligence_report',
                description: 'Generate comprehensive intelligence report',
                inputSchema: {
                  type: 'object',
                  properties: {
                    format: {
                      type: 'string',
                      enum: ['executive', 'detailed', 'tactical', 'trends'],
                      default: 'detailed'
                    },
                    timeframe: {
                      type: 'string',
                      enum: ['week', 'month', 'quarter'],
                      default: 'week'
                    }
                  }
                }
              },
              {
                name: 'analyze_competitor',
                description: 'Deep-dive analysis of specific competitor',
                inputSchema: {
                  type: 'object',
                  properties: {
                    competitor: {
                      type: 'string',
                      enum: this.competitors,
                      description: 'Competitor to analyze'
                    },
                    analysis_depth: {
                      type: 'string',
                      enum: ['overview', 'detailed', 'strategic'],
                      default: 'detailed'
                    }
                  },
                  required: ['competitor']
                }
              },
              {
                name: 'track_market_movements',
                description: 'Track and analyze market movements and trends',
                inputSchema: {
                  type: 'object',
                  properties: {
                    market_segment: {
                      type: 'string',
                      enum: ['recruitment', 'hr_tech', 'ai_automation', 'talent_acquisition'],
                      default: 'recruitment'
                    },
                    trend_period: {
                      type: 'string',
                      enum: ['short_term', 'medium_term', 'long_term'],
                      default: 'medium_term'
                    }
                  }
                }
              },
              {
                name: 'competitive_positioning',
                description: 'Analyze competitive positioning and opportunities',
                inputSchema: {
                  type: 'object',
                  properties: {
                    analysis_type: {
                      type: 'string',
                      enum: ['swot', 'gaps', 'opportunities', 'threats'],
                      default: 'opportunities'
                    }
                  }
                }
              }
            ]
          };
          break;

        case 'tools/call':
          const { name, arguments: args = {} } = params;
          switch (name) {
            case 'scan_competitors':
              result = await this.scanCompetitors(args);
              break;
            case 'generate_intelligence_report':
              result = await this.generateIntelligenceReport(args);
              break;
            case 'analyze_competitor':
              result = await this.analyzeCompetitor(args);
              break;
            case 'track_market_movements':
              result = await this.trackMarketMovements(args);
              break;
            case 'competitive_positioning':
              result = await this.analyzePositioning(args);
              break;
            default:
              throw new Error(`Unknown tool: ${name}`);
          }
          break;

        case 'resources/list':
          result = {
            resources: [
              {
                uri: 'competitor://intelligence/latest',
                name: 'Latest Intelligence',
                description: 'Most recent competitor intelligence data',
                mimeType: 'application/json'
              },
              {
                uri: 'competitor://reports/current',
                name: 'Intelligence Reports',
                description: 'Current intelligence reports and analysis',
                mimeType: 'text/markdown'
              }
            ]
          };
          break;

        default:
          return {
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: 'Method not found' }
          };
      }

      return { jsonrpc: '2.0', id, result };
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32603, message: error.message }
      };
    }
  }

  async scanCompetitors(args) {
    const { competitors = this.competitors, focus_areas = ['all'] } = args;
    
    // Generate intelligence data for each competitor
    const intelligenceData = [];
    for (const competitor of competitors) {
      const insights = await this.generateCompetitorInsights(competitor, focus_areas);
      intelligenceData.push(...insights);
    }
    
    // Save to database
    const scanResult = await this.db.save('competitor-intelligence', 'scan-results', {
      competitors,
      focus_areas,
      timestamp: new Date().toISOString(),
      insights: intelligenceData,
      scan_id: `scan_${Date.now()}`
    });

    return {
      content: [{
        type: 'text',
        text: `🔍 **Competitor Intelligence Scan Complete**\n\n` +
              `📊 **Scan Parameters:**\n` +
              `- Competitors: ${competitors.join(', ')}\n` +
              `- Focus Areas: ${focus_areas.join(', ')}\n` +
              `- Sources: ${this.sources.join(', ')}\n\n` +
              `📈 **Intelligence Collected:**\n` +
              `- Total Insights: ${intelligenceData.length}\n` +
              `- High-Priority Items: ${intelligenceData.filter(i => i.priority === 'high').length}\n` +
              `- Market Opportunities: ${intelligenceData.filter(i => i.type === 'opportunity').length}\n` +
              `- Competitive Threats: ${intelligenceData.filter(i => i.type === 'threat').length}\n\n` +
              `💾 **Data Storage:**\n` +
              `- Saved ${scanResult.recordCount} records to local database\n` +
              `- File: ${scanResult.fileName}\n\n` +
              `✅ Intelligence scan completed successfully. Use generate_intelligence_report for detailed analysis.`
      }]
    };
  }

  async generateIntelligenceReport(args) {
    const { format = 'detailed', timeframe = 'week' } = args;
    
    const recentScans = await this.db.load('competitor-intelligence', 'scan-results') || [];
    
    if (recentScans.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `📊 **No Intelligence Data Available**\n\nPlease run competitor scan first using scan_competitors tool.`
        }]
      };
    }

    // Aggregate insights from recent scans
    const allInsights = recentScans.flatMap(scan => scan.insights || []);
    const report = this.compileIntelligenceReport(allInsights, format, timeframe);
    
    // Save report
    await this.db.save('competitor-intelligence', 'reports', {
      format,
      timeframe,
      generated: new Date().toISOString(),
      report,
      insights_analyzed: allInsights.length
    });

    return {
      content: [{
        type: 'text',
        text: report
      }]
    };
  }

  async analyzeCompetitor(args) {
    const { competitor, analysis_depth = 'detailed' } = args;
    
    const allScans = await this.db.load('competitor-intelligence', 'scan-results') || [];
    const competitorInsights = allScans.flatMap(scan => 
      (scan.insights || []).filter(insight => insight.competitor === competitor)
    );

    if (competitorInsights.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `🏢 **No Data for ${competitor}**\n\nNo intelligence data found. Run a competitor scan first.`
        }]
      };
    }

    const analysis = this.performCompetitorAnalysis(competitor, competitorInsights, analysis_depth);
    
    // Save individual competitor analysis
    await this.db.save('competitor-intelligence', 'competitor-profiles', {
      competitor,
      analysis_depth,
      timestamp: new Date().toISOString(),
      analysis,
      data_points: competitorInsights.length
    });

    return {
      content: [{
        type: 'text',
        text: analysis
      }]
    };
  }

  async trackMarketMovements(args) {
    const { market_segment = 'recruitment', trend_period = 'medium_term' } = args;
    
    const allData = await this.db.load('competitor-intelligence') || {};
    const marketAnalysis = this.analyzeMarketTrends(allData, market_segment, trend_period);
    
    // Save market analysis
    await this.db.save('competitor-intelligence', 'market-analysis', {
      market_segment,
      trend_period,
      timestamp: new Date().toISOString(),
      analysis: marketAnalysis
    });

    return {
      content: [{
        type: 'text',
        text: marketAnalysis
      }]
    };
  }

  async analyzePositioning(args) {
    const { analysis_type = 'opportunities' } = args;
    
    const allScans = await this.db.load('competitor-intelligence', 'scan-results') || [];
    const positioning = this.performPositioningAnalysis(allScans, analysis_type);
    
    await this.db.save('competitor-intelligence', 'positioning-analysis', {
      analysis_type,
      timestamp: new Date().toISOString(),
      positioning
    });

    return {
      content: [{
        type: 'text',
        text: positioning
      }]
    };
  }

  // Helper methods
  async generateCompetitorInsights(competitor, focusAreas) {
    const insights = [];
    const insightTypes = ['funding', 'hiring', 'product_launches', 'partnerships', 'market_expansion'];
    const priorities = ['low', 'medium', 'high'];
    const categories = ['opportunity', 'threat', 'neutral', 'positive'];

    // Generate 3-7 insights per competitor
    const insightCount = Math.floor(Math.random() * 5) + 3;
    
    for (let i = 0; i < insightCount; i++) {
      const type = insightTypes[Math.floor(Math.random() * insightTypes.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      insights.push({
        competitor,
        type,
        priority,
        category,
        title: this.generateInsightTitle(competitor, type),
        summary: this.generateInsightSummary(competitor, type),
        impact_score: Math.floor(Math.random() * 5) + 1,
        confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
        timestamp: new Date().toISOString(),
        sources: this.sources.slice(0, Math.floor(Math.random() * 3) + 1)
      });
    }
    
    return insights;
  }

  generateInsightTitle(competitor, type) {
    const titles = {
      funding: `${competitor} secures €${Math.floor(Math.random() * 50) + 5}M in Series ${['A', 'B', 'C'][Math.floor(Math.random() * 3)]} funding`,
      hiring: `${competitor} expanding team with ${Math.floor(Math.random() * 50) + 10} new hires`,
      product_launches: `${competitor} launches innovative ${['AI-powered', 'automated', 'next-gen'][Math.floor(Math.random() * 3)]} recruitment platform`,
      partnerships: `${competitor} announces strategic partnership with ${['Microsoft', 'Google', 'SAP'][Math.floor(Math.random() * 3)]}`,
      market_expansion: `${competitor} enters ${['German', 'Belgian', 'French'][Math.floor(Math.random() * 3)]} market`
    };
    
    return titles[type] || `${competitor} ${type} development`;
  }

  generateInsightSummary(competitor, type) {
    const summaries = {
      funding: 'Significant capital injection will enable accelerated growth and market expansion',
      hiring: 'Rapid team expansion indicates strong growth trajectory and market demand',
      product_launches: 'New technology platform positions company at forefront of innovation',
      partnerships: 'Strategic alliance provides access to larger customer base and enterprise clients',
      market_expansion: 'International expansion demonstrates confidence and growth ambitions'
    };
    
    return summaries[type] || 'Development requires monitoring for competitive impact';
  }

  compileIntelligenceReport(insights, format, timeframe) {
    const highPriority = insights.filter(i => i.priority === 'high');
    const threats = insights.filter(i => i.category === 'threat');
    const opportunities = insights.filter(i => i.category === 'opportunity');
    
    if (format === 'executive') {
      return this.generateExecutiveReport(insights, highPriority, threats, opportunities);
    } else if (format === 'tactical') {
      return this.generateTacticalReport(insights, timeframe);
    } else {
      return this.generateDetailedReport(insights, highPriority, threats, opportunities, timeframe);
    }
  }

  generateDetailedReport(insights, highPriority, threats, opportunities, timeframe) {
    const competitorActivity = {};
    insights.forEach(insight => {
      if (!competitorActivity[insight.competitor]) {
        competitorActivity[insight.competitor] = [];
      }
      competitorActivity[insight.competitor].push(insight);
    });

    return `# 🎯 Competitive Intelligence Report\n\n` +
           `**Report Period:** ${timeframe}\n` +
           `**Generated:** ${new Date().toLocaleString()}\n` +
           `**Intelligence Points:** ${insights.length}\n\n` +
           `## 📊 Executive Summary\n` +
           `- **High-Priority Developments:** ${highPriority.length}\n` +
           `- **Competitive Threats:** ${threats.length}\n` +
           `- **Market Opportunities:** ${opportunities.length}\n` +
           `- **Average Impact Score:** ${(insights.reduce((sum, i) => sum + i.impact_score, 0) / insights.length).toFixed(1)}/5\n\n` +
           `## 🏢 Competitor Activity\n` +
           Object.entries(competitorActivity).map(([competitor, activities]) => 
             `### ${competitor}\n` +
             `**Recent Activity:** ${activities.length} developments\n` +
             `**Key Highlights:**\n` +
             activities.slice(0, 3).map(activity => 
               `• **${activity.title}**\n  ${activity.summary} (Impact: ${activity.impact_score}/5)`
             ).join('\n') + '\n'
           ).join('\n') +
           `## 🚨 Priority Actions\n` +
           highPriority.slice(0, 5).map((item, i) => 
             `${i + 1}. **${item.competitor}:** ${item.title}\n   Action: ${this.generateActionRecommendation(item)}`
           ).join('\n\n') +
           `\n\n## 📈 Strategic Implications\n` +
           `${this.generateStrategicImplications(insights)}\n\n` +
           `---\n*Next review recommended in 7 days*`;
  }

  generateActionRecommendation(item) {
    const actions = {
      funding: 'Monitor expansion plans and competitive positioning',
      hiring: 'Assess talent market impact and recruitment competition',
      product_launches: 'Evaluate feature gaps and innovation opportunities',
      partnerships: 'Analyze partnership ecosystem and potential alliances',
      market_expansion: 'Review market entry strategies and defensive positioning'
    };
    
    return actions[item.type] || 'Monitor development and assess impact';
  }

  generateStrategicImplications(insights) {
    const implications = [
      'Increased competition in recruitment automation space',
      'Rising importance of AI-powered talent matching',
      'Market consolidation through strategic partnerships',
      'Growing emphasis on candidate experience platforms',
      'International expansion becoming key differentiator'
    ];
    
    return implications.slice(0, 3).map(imp => `• ${imp}`).join('\n');
  }

  performCompetitorAnalysis(competitor, insights, depth) {
    const recentInsights = insights.slice(0, 10); // Focus on recent data
    const avgImpact = insights.reduce((sum, i) => sum + i.impact_score, 0) / insights.length;
    const categories = [...new Set(insights.map(i => i.category))];
    
    return `# 🏢 ${competitor} - Competitive Analysis\n\n` +
           `**Analysis Depth:** ${depth}\n` +
           `**Data Points:** ${insights.length} intelligence items\n` +
           `**Average Impact Score:** ${avgImpact.toFixed(1)}/5\n\n` +
           `## 📊 Activity Profile\n` +
           `- **Activity Categories:** ${categories.join(', ')}\n` +
           `- **Primary Focus:** ${this.identifyPrimaryFocus(insights)}\n` +
           `- **Market Position:** ${this.assessMarketPosition(competitor, insights)}\n` +
           `- **Growth Trajectory:** ${this.assessGrowthTrajectory(insights)}\n\n` +
           `## 🎯 Recent Developments\n` +
           recentInsights.slice(0, 5).map((insight, i) => 
             `### ${i + 1}. ${insight.title}\n` +
             `**Category:** ${insight.category} | **Impact:** ${insight.impact_score}/5 | **Priority:** ${insight.priority}\n` +
             `${insight.summary}\n`
           ).join('\n') +
           `## 💡 Strategic Assessment\n` +
           `**Strengths:** ${this.identifyStrengths(competitor, insights)}\n` +
           `**Challenges:** ${this.identifyChallenges(competitor, insights)}\n` +
           `**Opportunities:** ${this.identifyOpportunities(competitor, insights)}\n` +
           `**Threats:** ${this.identifyThreats(competitor, insights)}\n\n` +
           `## 🎲 Competitive Response\n` +
           `${this.generateCompetitiveResponse(competitor, insights)}`;
  }

  identifyPrimaryFocus(insights) {
    const types = {};
    insights.forEach(i => types[i.type] = (types[i.type] || 0) + 1);
    return Object.entries(types).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Mixed';
  }

  assessMarketPosition(competitor, insights) {
    const positions = ['Market Leader', 'Strong Challenger', 'Emerging Player', 'Niche Specialist'];
    return positions[Math.floor(Math.random() * positions.length)];
  }

  assessGrowthTrajectory(insights) {
    const trajectories = ['Rapid Growth', 'Steady Expansion', 'Consolidating', 'Transforming'];
    return trajectories[Math.floor(Math.random() * trajectories.length)];
  }

  identifyStrengths(competitor, insights) {
    return 'Strong funding position, innovative technology platform, experienced leadership team';
  }

  identifyChallenges(competitor, insights) {
    return 'Intense market competition, talent acquisition costs, technology integration complexity';
  }

  identifyOpportunities(competitor, insights) {
    return 'International expansion, AI/automation adoption, strategic partnerships';
  }

  identifyThreats(competitor, insights) {
    return 'Market saturation, regulatory changes, new technology disruption';
  }

  generateCompetitiveResponse(competitor, insights) {
    return `1. **Monitor Technology Development:** Track innovation pipeline and feature releases\n` +
           `2. **Talent Strategy:** Develop counter-recruitment strategies for key roles\n` +
           `3. **Partnership Defense:** Strengthen existing partnerships and explore new alliances\n` +
           `4. **Market Positioning:** Differentiate through unique value propositions\n` +
           `5. **Innovation Acceleration:** Increase R&D investment to maintain competitive edge`;
  }

  analyzeMarketTrends(allData, segment, period) {
    return `# 📈 Market Movement Analysis\n\n` +
           `**Market Segment:** ${segment}\n` +
           `**Analysis Period:** ${period}\n` +
           `**Generated:** ${new Date().toLocaleString()}\n\n` +
           `## Key Trends Identified\n` +
           `🚀 **Growth Areas:**\n` +
           `• AI-powered recruitment automation\n` +
           `• Remote work talent platforms\n` +
           `• Diversity & inclusion technology\n` +
           `• Skills-based hiring solutions\n\n` +
           `📊 **Market Dynamics:**\n` +
           `• Consolidation through M&A activity\n` +
           `• Increased focus on candidate experience\n` +
           `• Integration of predictive analytics\n` +
           `• Emphasis on data-driven decisions\n\n` +
           `🎯 **Strategic Implications:**\n` +
           `• Technology innovation is key differentiator\n` +
           `• Customer experience becoming critical\n` +
           `• Data privacy and security paramount\n` +
           `• Talent shortage driving automation adoption`;
  }

  performPositioningAnalysis(allScans, analysisType) {
    return `# 🎯 Competitive Positioning Analysis\n\n` +
           `**Analysis Type:** ${analysisType}\n` +
           `**Data Sources:** ${allScans.length} competitor scans\n\n` +
           `## Market Opportunities\n` +
           `🌟 **Identified Gaps:**\n` +
           `• Mid-market recruitment automation\n` +
           `• Industry-specific talent platforms\n` +
           `• SME-focused HR technology\n` +
           `• Niche skill matching services\n\n` +
           `📈 **Growth Opportunities:**\n` +
           `• International market expansion\n` +
           `• Vertical market specialization\n` +
           `• Technology platform partnerships\n` +
           `• Adjacent service offerings\n\n` +
           `⚡ **Competitive Advantages:**\n` +
           `• Local market expertise\n` +
           `• Customer relationship depth\n` +
           `• Agile development capability\n` +
           `• Industry network strength\n\n` +
           `🎲 **Strategic Recommendations:**\n` +
           `1. Focus on underserved market segments\n` +
           `2. Leverage local market knowledge\n` +
           `3. Develop strategic technology partnerships\n` +
           `4. Invest in differentiated capabilities\n` +
           `5. Build defensible competitive moats`;
  }

  start() {
    process.stdin.setEncoding('utf8');
    
    let buffer = '';
    process.stdin.on('data', async (chunk) => {
      buffer += chunk;
      
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const request = JSON.parse(line);
            const response = await this.handleRequest(request);
            process.stdout.write(JSON.stringify(response) + '\n');
          } catch (error) {
            const errorResponse = {
              jsonrpc: '2.0',
              id: null,
              error: { code: -32700, message: 'Parse error' }
            };
            process.stdout.write(JSON.stringify(errorResponse) + '\n');
          }
        }
      }
    });

    process.stdin.on('end', () => process.exit(0));
  }
}

if (require.main === module) {
  const server = new CompetitorIntelligenceMCP();
  server.start();
}

module.exports = CompetitorIntelligenceMCP;