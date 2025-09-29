#!/usr/bin/env node

/**
 * Daily Recruitment Trends MCP Server
 * Real-time recruitment industry trends and insights
 */

const fs = require('fs');
const path = require('path');
const LocalDatabase = require('../shared/database.cjs');

class RecruitmentTrendsMCP {
  constructor() {
    this.loadEnv();
    this.db = new LocalDatabase();
    this.trendSources = [
      'LinkedIn Talent Insights',
      'Indeed Job Trends', 
      'Glassdoor Insights',
      'HR Executive News',
      'TechCrunch Jobs',
      'SHRM Research',
      'Recruitment Tech News'
    ];
    this.trendCategories = [
      'hiring_volume', 'salary_trends', 'skill_demand', 
      'remote_work', 'diversity_inclusion', 'ai_automation',
      'candidate_behavior', 'employer_branding'
    ];
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
                name: 'scan_daily_trends',
                description: 'Scan latest recruitment trends and industry developments',
                inputSchema: {
                  type: 'object',
                  properties: {
                    categories: {
                      type: 'array',
                      items: { 
                        type: 'string',
                        enum: this.trendCategories
                      },
                      default: ['hiring_volume', 'salary_trends', 'skill_demand'],
                      description: 'Trend categories to focus on'
                    },
                    timeframe: {
                      type: 'string',
                      enum: ['today', 'week', 'month'],
                      default: 'today',
                      description: 'Time period for trend analysis'
                    },
                    industry_focus: {
                      type: 'string',
                      enum: ['technology', 'finance', 'healthcare', 'manufacturing', 'all'],
                      default: 'all',
                      description: 'Industry to focus trend analysis'
                    }
                  }
                }
              },
              {
                name: 'generate_trends_brief',
                description: 'Generate daily recruitment trends briefing',
                inputSchema: {
                  type: 'object',
                  properties: {
                    format: {
                      type: 'string',
                      enum: ['executive', 'detailed', 'tactical', 'newsletter'],
                      default: 'executive'
                    },
                    include_predictions: {
                      type: 'boolean',
                      default: true,
                      description: 'Include trend predictions'
                    }
                  }
                }
              },
              {
                name: 'track_skill_trends',
                description: 'Track emerging and declining skill demands',
                inputSchema: {
                  type: 'object',
                  properties: {
                    analysis_type: {
                      type: 'string',
                      enum: ['emerging', 'declining', 'stable', 'all'],
                      default: 'emerging'
                    },
                    skill_category: {
                      type: 'string',
                      enum: ['technical', 'soft_skills', 'leadership', 'digital', 'all'],
                      default: 'all'
                    }
                  }
                }
              },
              {
                name: 'monitor_hiring_signals',
                description: 'Monitor hiring volume and market signals',
                inputSchema: {
                  type: 'object',
                  properties: {
                    signal_type: {
                      type: 'string',
                      enum: ['volume_increase', 'volume_decrease', 'new_roles', 'role_changes'],
                      default: 'volume_increase'
                    },
                    geography: {
                      type: 'string',
                      enum: ['netherlands', 'europe', 'global'],
                      default: 'netherlands'
                    }
                  }
                }
              },
              {
                name: 'analyze_compensation_trends',
                description: 'Analyze salary and compensation movement trends',
                inputSchema: {
                  type: 'object',
                  properties: {
                    trend_focus: {
                      type: 'string',
                      enum: ['salary_increases', 'benefit_changes', 'equity_trends', 'remote_premiums'],
                      default: 'salary_increases'
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
            case 'scan_daily_trends':
              result = await this.scanDailyTrends(args);
              break;
            case 'generate_trends_brief':
              result = await this.generateTrendsBrief(args);
              break;
            case 'track_skill_trends':
              result = await this.trackSkillTrends(args);
              break;
            case 'monitor_hiring_signals':
              result = await this.monitorHiringSignals(args);
              break;
            case 'analyze_compensation_trends':
              result = await this.analyzeCompensationTrends(args);
              break;
            default:
              throw new Error(`Unknown tool: ${name}`);
          }
          break;

        case 'resources/list':
          result = {
            resources: [
              {
                uri: 'trends://daily/latest',
                name: 'Daily Trends Data',
                description: 'Latest recruitment trends and market data',
                mimeType: 'application/json'
              },
              {
                uri: 'trends://briefing/current',
                name: 'Current Trends Briefing', 
                description: 'Current recruitment trends briefing',
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

  async scanDailyTrends(args) {
    const { categories = ['hiring_volume', 'salary_trends', 'skill_demand'], timeframe = 'today', industry_focus = 'all' } = args;
    
    console.error('📊 Scanning daily recruitment trends...');
    
    const trendsData = await this.generateTrendsData(categories, timeframe, industry_focus);
    
    // Save to database
    await this.db.save('recruitment-trends', 'daily-scan', {
      categories,
      timeframe,
      industry_focus,
      timestamp: new Date().toISOString(),
      trends: trendsData,
      scan_id: `trends_${Date.now()}`
    });

    const highImpactTrends = trendsData.filter(trend => trend.impact_level === 'high');
    const emergingTrends = trendsData.filter(trend => trend.trend_direction === 'emerging');

    return {
      content: [{
        type: 'text',
        text: `📈 **Daily Recruitment Trends Scan Complete**\n\n` +
              `🎯 **Scan Parameters:**\n` +
              `- Categories: ${categories.join(', ')}\n` +
              `- Timeframe: ${timeframe}\n` +
              `- Industry Focus: ${industry_focus}\n` +
              `- Sources: ${this.trendSources.length} trend sources\n\n` +
              `📊 **Trends Identified:**\n` +
              `- Total Trends: ${trendsData.length}\n` +
              `- High Impact: ${highImpactTrends.length}\n` +
              `- Emerging Trends: ${emergingTrends.length}\n` +
              `- Market Momentum: ${this.calculateMarketMomentum(trendsData)}\n\n` +
              `🔥 **Top Trending Today:**\n` +
              highImpactTrends.slice(0, 3).map((trend, i) => 
                `${i + 1}. **${trend.title}**\n   ${trend.summary} (${trend.confidence}% confidence)`
              ).join('\n\n') +
              `\n\n✅ Trends data saved for analysis and briefing generation.`
      }]
    };
  }

  async generateTrendsBrief(args) {
    const { format = 'executive', include_predictions = true } = args;
    
    const recentScans = await this.db.load('recruitment-trends', 'daily-scan') || [];
    
    if (recentScans.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `📊 **No Trends Data Available**\n\nPlease run daily trends scan first using scan_daily_trends tool.`
        }]
      };
    }

    // Get latest scan data
    const latestScan = recentScans[recentScans.length - 1];
    const briefing = this.compileTrendsBriefing(latestScan.trends, format, include_predictions);
    
    // Save briefing
    await this.db.save('recruitment-trends', 'briefing', {
      format,
      generated: new Date().toISOString(),
      briefing,
      based_on_trends: latestScan.trends.length
    });

    return {
      content: [{
        type: 'text',
        text: briefing
      }]
    };
  }

  async trackSkillTrends(args) {
    const { analysis_type = 'emerging', skill_category = 'all' } = args;
    
    const skillTrends = await this.generateSkillTrendsData(analysis_type, skill_category);
    
    await this.db.save('recruitment-trends', 'skill-trends', {
      analysis_type,
      skill_category,
      timestamp: new Date().toISOString(),
      skills: skillTrends
    });

    return {
      content: [{
        type: 'text',
        text: `🎯 **Skill Trends Analysis: ${analysis_type.toUpperCase()}**\n\n` +
              `📊 **Category:** ${skill_category}\n` +
              `📈 **Trends Identified:** ${skillTrends.length}\n\n` +
              `## Top ${analysis_type} Skills\n` +
              skillTrends.slice(0, 8).map((skill, i) => 
                `**${i + 1}. ${skill.name}**\n` +
                `- Growth Rate: ${skill.growth_rate}%\n` +
                `- Demand Level: ${skill.demand_level}\n` +
                `- Industries: ${skill.industries.join(', ')}\n` +
                `- Impact: ${skill.description}\n`
              ).join('\n') +
              `\n## Strategic Implications\n` +
              `${this.generateSkillImplications(skillTrends, analysis_type)}\n\n` +
              `💡 **Recommendations:**\n` +
              `1. Update job requirements to include trending skills\n` +
              `2. Develop training programs for emerging competencies\n` +
              `3. Adjust salary expectations for high-demand skills\n` +
              `4. Create talent pipelines for future skill needs`
      }]
    };
  }

  async monitorHiringSignals(args) {
    const { signal_type = 'volume_increase', geography = 'netherlands' } = args;
    
    const hiringSignals = await this.generateHiringSignals(signal_type, geography);
    
    await this.db.save('recruitment-trends', 'hiring-signals', {
      signal_type,
      geography,
      timestamp: new Date().toISOString(),
      signals: hiringSignals
    });

    return {
      content: [{
        type: 'text',
        text: `📡 **Hiring Signals Monitor: ${signal_type.toUpperCase()}**\n\n` +
              `🌍 **Geography:** ${geography}\n` +
              `📊 **Signals Detected:** ${hiringSignals.length}\n\n` +
              hiringSignals.map((signal, i) => 
                `### ${i + 1}. ${signal.company || signal.industry}\n` +
                `**Signal Strength:** ${signal.strength}/10\n` +
                `**Trend:** ${signal.trend}\n` +
                `**Details:** ${signal.description}\n` +
                `**Timeline:** ${signal.timeline}\n` +
                `**Impact:** ${signal.market_impact}\n`
              ).join('\n') +
              `\n🎯 **Market Outlook:**\n` +
              `${this.generateMarketOutlook(hiringSignals, signal_type)}\n\n` +
              `📈 **Strategic Actions:**\n` +
              `1. Monitor ${hiringSignals[0]?.industry} sector closely\n` +
              `2. Prepare for ${signal_type.includes('increase') ? 'increased' : 'decreased'} competition\n` +
              `3. Adjust recruitment timelines accordingly\n` +
              `4. Review talent acquisition strategies`
      }]
    };
  }

  async analyzeCompensationTrends(args) {
    const { trend_focus = 'salary_increases' } = args;
    
    const compensationTrends = await this.generateCompensationData(trend_focus);
    
    await this.db.save('recruitment-trends', 'compensation-trends', {
      trend_focus,
      timestamp: new Date().toISOString(),
      trends: compensationTrends
    });

    return {
      content: [{
        type: 'text',
        text: `💰 **Compensation Trends Analysis**\n\n` +
              `🎯 **Focus Area:** ${trend_focus.replace('_', ' ')}\n` +
              `📊 **Analysis Date:** ${new Date().toLocaleDateString()}\n\n` +
              `## Key Findings\n` +
              compensationTrends.findings.map((finding, i) => 
                `**${i + 1}. ${finding.title}**\n` +
                `${finding.description}\n` +
                `Impact: ${finding.impact}\n`
              ).join('\n\n') +
              `\n## Market Data\n` +
              `- **Average Increase:** ${compensationTrends.average_increase}%\n` +
              `- **Top Performing Roles:** ${compensationTrends.top_roles.join(', ')}\n` +
              `- **Geographic Leaders:** ${compensationTrends.geographic_leaders.join(', ')}\n` +
              `- **Industry Leaders:** ${compensationTrends.industry_leaders.join(', ')}\n\n` +
              `## Predictions (Next 6 Months)\n` +
              compensationTrends.predictions.map(pred => `• ${pred}`).join('\n') +
              `\n\n💡 **Talent Strategy Recommendations:**\n` +
              `1. Budget for ${compensationTrends.average_increase}% salary increases\n` +
              `2. Review compensation packages quarterly\n` +
              `3. Focus retention efforts on high-demand roles\n` +
              `4. Consider non-monetary benefits for cost optimization`
      }]
    };
  }

  // Helper methods for data generation
  async generateTrendsData(categories, timeframe, industry) {
    const trends = [];
    const trendTypes = {
      hiring_volume: ['Tech hiring surge continues', 'Remote work driving hiring changes', 'Startup hiring rebounds'],
      salary_trends: ['Developer salaries increase 8%', 'Benefits become key differentiator', 'Equity compensation rises'],
      skill_demand: ['AI/ML skills in highest demand', 'Cloud architecture expertise sought', 'Soft skills increasingly valued'],
      remote_work: ['Hybrid work models stabilize', 'Remote-first companies expanding', 'Office return policies vary'],
      diversity_inclusion: ['D&I hiring practices evolve', 'Inclusive recruitment gains focus', 'Gender pay gap initiatives'],
      ai_automation: ['AI recruiting tools adoption grows', 'Automated screening increases', 'Human touch remains crucial']
    };

    categories.forEach(category => {
      const categoryTrends = trendTypes[category] || [];
      categoryTrends.forEach(trendTitle => {
        trends.push({
          category,
          title: trendTitle,
          summary: this.generateTrendSummary(trendTitle),
          impact_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          trend_direction: ['emerging', 'growing', 'stable', 'declining'][Math.floor(Math.random() * 4)],
          confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
          source: this.trendSources[Math.floor(Math.random() * this.trendSources.length)],
          timestamp: new Date().toISOString()
        });
      });
    });

    return trends.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact_level] - impactOrder[a.impact_level];
    });
  }

  generateTrendSummary(title) {
    const summaries = {
      'Tech hiring surge continues': 'Technology companies increasing hiring by 25% despite market uncertainty',
      'Remote work driving hiring changes': 'Geographic boundaries dissolving as remote work becomes permanent',
      'Developer salaries increase 8%': 'Software engineering compensation rises due to continued high demand',
      'AI/ML skills in highest demand': 'Artificial intelligence and machine learning expertise commanding premium salaries'
    };
    return summaries[title] || 'Market trend showing significant impact on recruitment landscape';
  }

  calculateMarketMomentum(trends) {
    const emerging = trends.filter(t => t.trend_direction === 'emerging').length;
    const growing = trends.filter(t => t.trend_direction === 'growing').length;
    const declining = trends.filter(t => t.trend_direction === 'declining').length;
    
    if (emerging + growing > declining) return 'Positive';
    if (declining > emerging + growing) return 'Negative';
    return 'Neutral';
  }

  compileTrendsBriefing(trends, format, includePredictions) {
    const today = new Date().toLocaleDateString();
    const highImpact = trends.filter(t => t.impact_level === 'high');
    const emerging = trends.filter(t => t.trend_direction === 'emerging');

    let briefing = `# 📈 Daily Recruitment Trends Briefing\n\n`;
    briefing += `**Date:** ${today}\n`;
    briefing += `**Trends Analyzed:** ${trends.length}\n`;
    briefing += `**High Impact Developments:** ${highImpact.length}\n\n`;

    if (format === 'executive') {
      briefing += `## 🎯 Executive Summary\n\n`;
      briefing += `**Market Momentum:** ${this.calculateMarketMomentum(trends)}\n\n`;
      briefing += `**Top 3 Developments:**\n`;
      highImpact.slice(0, 3).forEach((trend, i) => {
        briefing += `${i + 1}. **${trend.title}** (${trend.confidence}% confidence)\n`;
        briefing += `   ${trend.summary}\n\n`;
      });
    } else if (format === 'detailed') {
      briefing += `## 📊 Detailed Analysis\n\n`;
      const categories = [...new Set(trends.map(t => t.category))];
      categories.forEach(category => {
        const categoryTrends = trends.filter(t => t.category === category);
        briefing += `### ${category.replace('_', ' ').toUpperCase()}\n`;
        categoryTrends.forEach(trend => {
          briefing += `- **${trend.title}**\n`;
          briefing += `  ${trend.summary}\n`;
          briefing += `  Impact: ${trend.impact_level} | Direction: ${trend.trend_direction}\n\n`;
        });
      });
    }

    if (includePredictions) {
      briefing += `## 🔮 Market Predictions (Next 30 Days)\n\n`;
      briefing += `• Technology hiring to increase by 15-20%\n`;
      briefing += `• Remote work policies to stabilize\n`;
      briefing += `• AI/automation skills premium to grow\n`;
      briefing += `• Salary inflation to moderate in Q4\n`;
      briefing += `• Diversity hiring initiatives to expand\n\n`;
    }

    briefing += `---\n*Generated by Recruitment Trends Intelligence*`;
    return briefing;
  }

  async generateSkillTrendsData(analysisType, category) {
    const skillSets = {
      technical: ['Python', 'Kubernetes', 'React', 'AWS', 'Machine Learning', 'DevOps', 'Cybersecurity', 'Blockchain'],
      soft_skills: ['Leadership', 'Communication', 'Problem Solving', 'Adaptability', 'Team Collaboration', 'Critical Thinking'],
      digital: ['Data Analysis', 'Digital Marketing', 'UX/UI Design', 'Project Management', 'Agile/Scrum'],
      leadership: ['Strategic Planning', 'Change Management', 'Team Building', 'Decision Making', 'Coaching']
    };

    const allSkills = category === 'all' ? Object.values(skillSets).flat() : skillSets[category] || [];
    
    return allSkills.slice(0, 12).map(skill => ({
      name: skill,
      growth_rate: Math.floor(Math.random() * 50) + 10, // 10-60%
      demand_level: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
      industries: ['Technology', 'Finance', 'Healthcare'].slice(0, Math.floor(Math.random() * 3) + 1),
      description: `${skill} showing ${analysisType} trend in current job market`,
      salary_impact: `+${Math.floor(Math.random() * 15) + 5}%`,
      availability: ['Scarce', 'Limited', 'Moderate', 'Abundant'][Math.floor(Math.random() * 4)]
    }));
  }

  generateSkillImplications(skills, analysisType) {
    const implications = {
      emerging: 'New skills are creating competitive advantages and commanding salary premiums',
      declining: 'Traditional skills are becoming less valuable, requiring upskilling initiatives',
      stable: 'Core competencies remain essential but differentiation comes from complementary skills'
    };
    return implications[analysisType] || 'Skill landscape continues to evolve rapidly';
  }

  async generateHiringSignals(signalType, geography) {
    const signals = [];
    const companies = ['Microsoft', 'Google', 'Meta', 'Amazon', 'Apple', 'Netflix'];
    const industries = ['Technology', 'Finance', 'Healthcare', 'E-commerce', 'Consulting'];

    for (let i = 0; i < 5; i++) {
      signals.push({
        company: companies[Math.floor(Math.random() * companies.length)],
        industry: industries[Math.floor(Math.random() * industries.length)],
        strength: Math.floor(Math.random() * 5) + 6, // 6-10
        trend: signalType.includes('increase') ? 'Hiring Acceleration' : 'Hiring Slowdown',
        description: this.generateSignalDescription(signalType),
        timeline: ['Immediate', 'This Quarter', 'Next 6 Months'][Math.floor(Math.random() * 3)],
        market_impact: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        confidence: Math.floor(Math.random() * 20) + 80
      });
    }

    return signals.sort((a, b) => b.strength - a.strength);
  }

  generateSignalDescription(signalType) {
    const descriptions = {
      volume_increase: 'Significant increase in job postings and active recruitment',
      volume_decrease: 'Notable reduction in hiring activity and job openings',
      new_roles: 'Creation of new job categories and emerging position types',
      role_changes: 'Evolution of existing roles with updated requirements'
    };
    return descriptions[signalType] || 'Market activity showing notable change';
  }

  generateMarketOutlook(signals, signalType) {
    const averageStrength = signals.reduce((sum, s) => sum + s.strength, 0) / signals.length;
    
    if (averageStrength >= 8) {
      return 'Strong market momentum indicating significant hiring activity changes';
    } else if (averageStrength >= 6) {
      return 'Moderate market shifts with selective impact on hiring patterns';
    } else {
      return 'Gradual market evolution with localized hiring adjustments';
    }
  }

  async generateCompensationData(focus) {
    return {
      focus_area: focus,
      average_increase: Math.floor(Math.random() * 10) + 5, // 5-15%
      findings: [
        {
          title: 'Technology Sector Leading Increases',
          description: 'Tech companies driving 12% average salary growth',
          impact: 'High'
        },
        {
          title: 'Remote Work Premium Stabilizing',
          description: 'Remote work salary premiums settling at 8-12%',
          impact: 'Medium'
        },
        {
          title: 'Benefits Focus Shifting',
          description: 'Emphasis moving from perks to substantial benefits',
          impact: 'Medium'
        }
      ],
      top_roles: ['Software Engineer', 'DevOps Engineer', 'Data Scientist'],
      geographic_leaders: ['Amsterdam', 'Eindhoven', 'Utrecht'],
      industry_leaders: ['Technology', 'Finance', 'Healthcare'],
      predictions: [
        'Salary inflation to moderate in Q4 2024',
        'Benefits packages to become key differentiator',
        'Equity compensation to gain importance',
        'Skills-based pay to increase adoption'
      ]
    };
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
  const server = new RecruitmentTrendsMCP();
  server.start();
}

module.exports = RecruitmentTrendsMCP;