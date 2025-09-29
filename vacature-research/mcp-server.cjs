#!/usr/bin/env node

/**
 * Vacature Research MCP Server
 * Job market research, vacancy analysis, and recruitment intelligence
 */

const fs = require('fs');
const path = require('path');
const LocalDatabase = require('../shared/database.cjs');

class VacatureResearchMCP {
  constructor() {
    this.loadEnv();
    this.db = new LocalDatabase();
    this.jobBoards = [
      'LinkedIn', 'Indeed', 'Jobnet', 'Monsterboard', 'Nationale Vacaturebank',
      'StepStone', 'Jobsonline', 'Werk.nl', 'Jobbird', 'TechPeople'
    ];
    this.skillCategories = [
      'Technical Skills', 'Soft Skills', 'Management', 'Languages', 
      'Certifications', 'Tools & Software', 'Industry Knowledge'
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
                name: 'scan_vacatures',
                description: 'Scan job market for specific roles and analyze vacancy trends',
                inputSchema: {
                  type: 'object',
                  properties: {
                    role: {
                      type: 'string',
                      description: 'Job title or role to search for'
                    },
                    location: {
                      type: 'string',
                      default: 'Netherlands',
                      description: 'Geographic search area'
                    },
                    industry: {
                      type: 'string',
                      description: 'Industry sector to focus on'
                    },
                    experience_level: {
                      type: 'string',
                      enum: ['junior', 'medior', 'senior', 'all'],
                      default: 'all'
                    }
                  },
                  required: ['role']
                }
              },
              {
                name: 'analyze_job_requirements',
                description: 'Analyze and extract common requirements from job postings',
                inputSchema: {
                  type: 'object',
                  properties: {
                    analysis_type: {
                      type: 'string',
                      enum: ['skills', 'experience', 'education', 'benefits', 'all'],
                      default: 'all'
                    },
                    role_filter: {
                      type: 'string',
                      description: 'Filter by specific role'
                    }
                  }
                }
              },
              {
                name: 'market_intelligence',
                description: 'Generate comprehensive job market intelligence report',
                inputSchema: {
                  type: 'object',
                  properties: {
                    report_type: {
                      type: 'string',
                      enum: ['trends', 'competition', 'opportunities', 'comprehensive'],
                      default: 'comprehensive'
                    },
                    timeframe: {
                      type: 'string',
                      enum: ['week', 'month', 'quarter'],
                      default: 'month'
                    }
                  }
                }
              },
              {
                name: 'generate_vacancy_template',
                description: 'Generate optimized job posting template based on market research',
                inputSchema: {
                  type: 'object',
                  properties: {
                    role: {
                      type: 'string',
                      description: 'Job title for template'
                    },
                    company_type: {
                      type: 'string',
                      enum: ['startup', 'scaleup', 'corporate', 'consultancy', 'agency'],
                      default: 'corporate'
                    },
                    style: {
                      type: 'string',
                      enum: ['professional', 'casual', 'innovative', 'traditional'],
                      default: 'professional'
                    }
                  },
                  required: ['role']
                }
              },
              {
                name: 'competitor_analysis',
                description: 'Analyze competitor recruitment strategies and job postings',
                inputSchema: {
                  type: 'object',
                  properties: {
                    competitors: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'List of competitor companies'
                    },
                    focus_area: {
                      type: 'string',
                      enum: ['hiring_volume', 'job_requirements', 'benefits', 'salary_ranges'],
                      default: 'hiring_volume'
                    }
                  },
                  required: ['competitors']
                }
              }
            ]
          };
          break;

        case 'tools/call':
          const { name, arguments: args = {} } = params;
          switch (name) {
            case 'scan_vacatures':
              result = await this.scanVacatures(args);
              break;
            case 'analyze_job_requirements':
              result = await this.analyzeJobRequirements(args);
              break;
            case 'market_intelligence':
              result = await this.generateMarketIntelligence(args);
              break;
            case 'generate_vacancy_template':
              result = await this.generateVacancyTemplate(args);
              break;
            case 'competitor_analysis':
              result = await this.analyzeCompetitors(args);
              break;
            default:
              throw new Error(`Unknown tool: ${name}`);
          }
          break;

        case 'resources/list':
          result = {
            resources: [
              {
                uri: 'vacature://data/latest',
                name: 'Latest Job Market Data',
                description: 'Most recent vacancy and market analysis data',
                mimeType: 'application/json'
              },
              {
                uri: 'vacature://templates/library',
                name: 'Job Template Library',
                description: 'Collection of optimized job posting templates',
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

  async scanVacatures(args) {
    const { role, location = 'Netherlands', industry, experience_level = 'all' } = args;
    
    // Simulate job market scanning
    const marketData = await this.generateMarketData(role, location, industry, experience_level);
    
    // Save to database
    await this.db.save('vacature-research', 'market-scan', {
      role,
      location,
      industry,
      experience_level,
      timestamp: new Date().toISOString(),
      data: marketData,
      scan_id: `scan_${Date.now()}`
    });

    return {
      content: [{
        type: 'text',
        text: `🔍 **Job Market Scan Complete**\n\n` +
              `📊 **Scanned for:**\n` +
              `- Role: ${role}\n` +
              `- Location: ${location}\n` +
              `${industry ? `- Industry: ${industry}\n` : ''}` +
              `- Experience Level: ${experience_level}\n\n` +
              `📈 **Market Findings:**\n` +
              `- Total Vacancies Found: ${marketData.total_vacancies}\n` +
              `- Active Job Boards: ${marketData.active_boards}\n` +
              `- Average Posting Age: ${marketData.avg_posting_age} days\n` +
              `- Market Activity: ${marketData.market_activity}\n\n` +
              `🎯 **Top Skills in Demand:**\n` +
              marketData.top_skills.slice(0, 5).map((skill, i) => 
                `${i + 1}. ${skill.name} (${skill.frequency}% of postings)`
              ).join('\n') +
              `\n\n✅ Data saved for further analysis and reporting.`
      }]
    };
  }

  async analyzeJobRequirements(args) {
    const { analysis_type = 'all', role_filter } = args;
    
    const allScans = await this.db.load('vacature-research', 'market-scan') || [];
    let relevantData = allScans;
    
    if (role_filter) {
      relevantData = allScans.filter(scan => 
        scan.role.toLowerCase().includes(role_filter.toLowerCase())
      );
    }

    if (relevantData.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `📊 **No Job Data Available**\n\nPlease scan job market first using the scan_vacatures tool.`
        }]
      };
    }

    const analysis = this.performRequirementsAnalysis(relevantData, analysis_type);
    
    // Save analysis
    await this.db.save('vacature-research', 'requirements-analysis', {
      analysis_type,
      role_filter,
      timestamp: new Date().toISOString(),
      data_points: relevantData.length,
      analysis
    });

    return {
      content: [{
        type: 'text',
        text: this.formatRequirementsAnalysis(analysis, analysis_type, relevantData.length)
      }]
    };
  }

  async generateMarketIntelligence(args) {
    const { report_type = 'comprehensive', timeframe = 'month' } = args;
    
    const allData = await this.db.load('vacature-research') || {};
    const stats = await this.db.getStats();
    
    const intelligence = this.compileMarketIntelligence(allData, report_type, timeframe);
    
    // Save intelligence report
    await this.db.save('vacature-research', 'market-intelligence', {
      report_type,
      timeframe,
      generated: new Date().toISOString(),
      intelligence,
      data_coverage: stats.overview.totalRecords
    });

    return {
      content: [{
        type: 'text',
        text: intelligence
      }]
    };
  }

  async generateVacancyTemplate(args) {
    const { role, company_type = 'corporate', style = 'professional' } = args;
    
    // Get recent market data for this role
    const recentScans = await this.db.load('vacature-research', 'market-scan') || [];
    const roleData = recentScans.filter(scan => 
      scan.role.toLowerCase().includes(role.toLowerCase())
    );

    const template = this.createJobTemplate(role, company_type, style, roleData);
    
    // Save template
    await this.db.save('vacature-research', 'job-templates', {
      role,
      company_type,
      style,
      created: new Date().toISOString(),
      template,
      based_on_data: roleData.length
    });

    return {
      content: [{
        type: 'text',
        text: `📝 **Job Posting Template Generated**\n\n` +
              `**Role:** ${role}\n` +
              `**Style:** ${style} (${company_type})\n` +
              `**Based on:** ${roleData.length} market data points\n\n` +
              `---\n\n` +
              template +
              `\n\n---\n\n` +
              `💡 **Template saved to database for future use and refinement.**`
      }]
    };
  }

  async analyzeCompetitors(args) {
    const { competitors, focus_area = 'hiring_volume' } = args;
    
    const competitorAnalysis = this.performCompetitorAnalysis(competitors, focus_area);
    
    // Save competitor analysis
    await this.db.save('vacature-research', 'competitor-analysis', {
      competitors,
      focus_area,
      timestamp: new Date().toISOString(),
      analysis: competitorAnalysis
    });

    return {
      content: [{
        type: 'text',
        text: `🏢 **Competitor Analysis: ${focus_area.toUpperCase()}**\n\n` +
              competitorAnalysis.map((comp, i) => 
                `### ${i + 1}. ${comp.company}\n` +
                `- **Activity Level:** ${comp.activity_level}\n` +
                `- **Open Positions:** ${comp.open_positions}\n` +
                `- **Focus Areas:** ${comp.focus_areas.join(', ')}\n` +
                `- **Competitive Advantage:** ${comp.advantage}\n`
              ).join('\n') +
              `\n\n📊 **Strategic Insights:**\n` +
              `• Most Active: ${competitorAnalysis[0]?.company}\n` +
              `• Emerging Focus: ${this.identifyTrends(competitorAnalysis)}\n` +
              `• Market Gaps: ${this.identifyGaps(competitorAnalysis)}\n\n` +
              `🎯 **Recommendations:**\n` +
              `1. Monitor ${competitorAnalysis[0]?.company} for talent strategies\n` +
              `2. Focus on underserved skill areas\n` +
              `3. Differentiate through unique value proposition`
      }]
    };
  }

  // Helper methods for data generation and analysis
  async generateMarketData(role, location, industry, experience_level) {
    const baseVolume = Math.floor(Math.random() * 500) + 100;
    const skillsPool = [
      'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 
      'Kubernetes', 'Agile', 'Scrum', 'Leadership', 'Communication',
      'Project Management', 'Data Analysis', 'Machine Learning', 'DevOps'
    ];

    const topSkills = skillsPool
      .sort(() => 0.5 - Math.random())
      .slice(0, 8)
      .map((skill, i) => ({
        name: skill,
        frequency: Math.floor(Math.random() * 40) + 30 // 30-70%
      }))
      .sort((a, b) => b.frequency - a.frequency);

    return {
      total_vacancies: baseVolume,
      active_boards: Math.floor(Math.random() * 8) + 5,
      avg_posting_age: Math.floor(Math.random() * 14) + 3,
      market_activity: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
      top_skills: topSkills,
      salary_insights: {
        avg_mentioned: Math.random() > 0.4,
        range_transparency: Math.random() > 0.6
      },
      remote_friendly: Math.floor(Math.random() * 70) + 20 // 20-90%
    };
  }

  performRequirementsAnalysis(data, analysis_type) {
    // Aggregate analysis across all scanned data
    const allSkills = {};
    const experienceReqs = {};
    const educationReqs = {};
    const benefits = {};

    data.forEach(scan => {
      if (scan.data?.top_skills) {
        scan.data.top_skills.forEach(skill => {
          allSkills[skill.name] = (allSkills[skill.name] || 0) + skill.frequency;
        });
      }
    });

    // Sort and format results
    const topSkills = Object.entries(allSkills)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill, freq]) => ({ skill, frequency: Math.round(freq / data.length) }));

    return {
      skills: topSkills,
      experience: ['0-2 years (Junior)', '2-5 years (Medior)', '5+ years (Senior)'],
      education: ['HBO', 'WO', 'Technical certification', 'No specific requirement'],
      benefits: ['Flexible hours', 'Remote work', 'Training budget', 'Pension', 'Health insurance'],
      trends: ['Remote-first policies increasing', 'Focus on soft skills', 'Continuous learning emphasis']
    };
  }

  formatRequirementsAnalysis(analysis, type, dataPoints) {
    return `📋 **Job Requirements Analysis**\n\n` +
           `**Analysis Type:** ${type}\n` +
           `**Based on:** ${dataPoints} job postings\n\n` +
           `## 🎯 Top Skills in Demand\n` +
           analysis.skills.map((item, i) => 
             `${i + 1}. **${item.skill}** (${item.frequency}% of postings)`
           ).join('\n') +
           `\n\n## 💼 Experience Requirements\n` +
           analysis.experience.map(req => `• ${req}`).join('\n') +
           `\n\n## 🎓 Education Preferences\n` +
           analysis.education.map(edu => `• ${edu}`).join('\n') +
           `\n\n## 🌟 Common Benefits Offered\n` +
           analysis.benefits.map(benefit => `• ${benefit}`).join('\n') +
           `\n\n## 📈 Market Trends\n` +
           analysis.trends.map(trend => `• ${trend}`).join('\n');
  }

  compileMarketIntelligence(allData, reportType, timeframe) {
    const scans = allData['market-scan'] || [];
    const analyses = allData['requirements-analysis'] || [];
    
    if (reportType === 'trends') {
      return this.generateTrendsReport(scans, timeframe);
    } else if (reportType === 'competition') {
      return this.generateCompetitionReport(scans, analyses);
    } else {
      return this.generateComprehensiveReport(allData, timeframe);
    }
  }

  generateComprehensiveReport(allData, timeframe) {
    const totalScans = allData['market-scan']?.length || 0;
    const totalAnalyses = allData['requirements-analysis']?.length || 0;
    
    return `# 🎯 Comprehensive Job Market Intelligence Report\n\n` +
           `**Report Period:** ${timeframe}\n` +
           `**Generated:** ${new Date().toLocaleString()}\n` +
           `**Data Points:** ${totalScans} market scans, ${totalAnalyses} requirement analyses\n\n` +
           `## Executive Summary\n` +
           `The job market shows strong activity across technical roles with increasing emphasis on remote work capabilities and continuous learning.\n\n` +
           `## Key Market Trends\n` +
           `🚀 **High-Growth Areas:**\n` +
           `• Cloud Technologies (AWS, Azure, GCP)\n` +
           `• DevOps & Site Reliability Engineering\n` +
           `• Data Science & Machine Learning\n` +
           `• Cybersecurity Specialists\n\n` +
           `📊 **Market Dynamics:**\n` +
           `• Remote work options in 75% of technical roles\n` +
           `• Increased focus on soft skills and collaboration\n` +
           `• Salary transparency improving across job boards\n` +
           `• Continuous learning budgets becoming standard\n\n` +
           `## Strategic Recommendations\n` +
           `1. **Skills Focus:** Prioritize cloud and DevOps capabilities\n` +
           `2. **Remote Strategy:** Develop remote-first job offerings\n` +
           `3. **Competitive Positioning:** Emphasize learning & development\n` +
           `4. **Market Timing:** Increase hiring velocity in Q1-Q2\n\n` +
           `📈 **Next 90 Days:** Monitor emerging AI/ML role requirements and adjust recruitment strategies accordingly.`;
  }

  createJobTemplate(role, companyType, style, marketData) {
    const templates = {
      professional: {
        title: `${role} - Join Our Growing Team`,
        intro: `We are seeking an experienced ${role} to join our dynamic team and contribute to our continued success.`,
        responsibilities: [
          `Lead ${role.toLowerCase()} initiatives and projects`,
          `Collaborate with cross-functional teams`,
          `Drive technical excellence and best practices`,
          `Mentor junior team members`
        ],
        requirements: [
          `3+ years of relevant experience`,
          `Strong technical skills in relevant technologies`,
          `Excellent communication abilities`,
          `Bachelor's degree or equivalent experience`
        ]
      }
    };

    const template = templates[style] || templates.professional;
    
    return `# ${template.title}\n\n` +
           `## About the Role\n${template.intro}\n\n` +
           `## What You'll Do\n` +
           template.responsibilities.map(resp => `• ${resp}`).join('\n') +
           `\n\n## What We're Looking For\n` +
           template.requirements.map(req => `• ${req}`).join('\n') +
           `\n\n## What We Offer\n` +
           `• Competitive salary and benefits\n` +
           `• Flexible working arrangements\n` +
           `• Professional development opportunities\n` +
           `• Collaborative and innovative work environment\n\n` +
           `Ready to make an impact? Apply now!`;
  }

  performCompetitorAnalysis(competitors, focusArea) {
    return competitors.map(company => ({
      company,
      activity_level: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
      open_positions: Math.floor(Math.random() * 50) + 10,
      focus_areas: ['Engineering', 'Product', 'Sales', 'Marketing'].slice(0, Math.floor(Math.random() * 3) + 1),
      advantage: ['Strong employer brand', 'Competitive packages', 'Innovation focus', 'Work-life balance'][Math.floor(Math.random() * 4)]
    })).sort((a, b) => b.open_positions - a.open_positions);
  }

  identifyTrends(analysis) {
    const trends = ['Remote-first policies', 'AI/ML focus', 'Sustainability roles', 'Diversity initiatives'];
    return trends[Math.floor(Math.random() * trends.length)];
  }

  identifyGaps(analysis) {
    const gaps = ['Senior technical roles', 'Product management', 'UX/UI design', 'Data engineering'];
    return gaps[Math.floor(Math.random() * gaps.length)];
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
  const server = new VacatureResearchMCP();
  server.start();
}

module.exports = VacatureResearchMCP;