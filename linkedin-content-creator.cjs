#!/usr/bin/env node

/**
 * LinkedIn Content Creator
 * Wekelijkse content generatie van top 5 recruitment artikelen
 */

const fs = require('fs').promises;
const path = require('path');

class LinkedInContentCreator {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.outputDir = path.join(__dirname, 'content');
    
    // Content templates voor verschillende formaten
    this.contentTemplates = {
      weeklyRoundup: {
        title: '📊 Nederlandse Recruitment Week in Review',
        hashtags: ['#RecruitmentNL', '#HRTrends', '#TalentAcquisition', '#ArbeidsmarktNL', '#RecruitmentTech']
      },
      insightPost: {
        title: '💡 Recruitment Insight van de Week',
        hashtags: ['#RecruitmentInsights', '#HRStrategy', '#TalentTrends', '#Nederlandse Arbeidsmarkt']
      },
      trendAnalysis: {
        title: '📈 Trend Analyse: Nederlandse Recruitment',
        hashtags: ['#TrendAnalyse', '#RecruitmentTrends', '#FutureOfWork', '#AIinRecruitment']
      },
      article: {
        title: 'De Staat van Nederlandse Recruitment',
        hashtags: ['#RecruitmentNL', '#ThoughtLeadership', '#HRLeadership']
      }
    };
  }

  async ensureOutputDir() {
    await fs.mkdir(this.outputDir, { recursive: true });
  }

  async loadWeeklyTopArticles() {
    try {
      const content = await fs.readFile(path.join(this.dataDir, 'weekly-top-articles.json'), 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error('Geen wekelijkse artikel data gevonden. Run eerst dagelijkse uploads.');
    }
  }

  async analyzeWeeklyTrends(weeklyData) {
    const allArticles = weeklyData.flatMap(day => day.articles);
    
    // Top 5 artikelen van de week
    const top5Articles = allArticles
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    // Trend analyse
    const categoryCount = {};
    const sourceCount = {};
    const keywordCount = {};
    
    allArticles.forEach(article => {
      // Categorieën tellen
      categoryCount[article.categorie] = (categoryCount[article.categorie] || 0) + 1;
      
      // Bronnen tellen
      sourceCount[article.bron] = (sourceCount[article.bron] || 0) + 1;
      
      // Keywords analyseren
      if (article.keywords) {
        article.keywords.split(', ').forEach(keyword => {
          if (keyword.trim()) {
            keywordCount[keyword.trim()] = (keywordCount[keyword.trim()] || 0) + 1;
          }
        });
      }
    });
    
    // Top trends identificeren
    const topCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    const topKeywords = Object.entries(keywordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    const topSources = Object.entries(sourceCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    return {
      totalArticles: allArticles.length,
      avgScore: Math.round(allArticles.reduce((sum, a) => sum + a.score, 0) / allArticles.length),
      top5Articles,
      topCategories,
      topKeywords,
      topSources,
      weekRange: {
        start: weeklyData[0]?.date,
        end: weeklyData[weeklyData.length - 1]?.date
      }
    };
  }

  generateWeeklyRoundupPost(analysis) {
    const template = this.contentTemplates.weeklyRoundup;
    const weekRange = `${analysis.weekRange.start} - ${analysis.weekRange.end}`;
    
    let content = `${template.title}\n`;
    content += `Week ${weekRange}\n\n`;
    
    content += `Deze week heb ik ${analysis.totalArticles} Nederlandse recruitment artikelen geanalyseerd. Hier zijn de 5 meest relevante ontwikkelingen:\n\n`;
    
    analysis.top5Articles.forEach((article, i) => {
      content += `${i + 1}. ${article.onderwerp}\n`;
      content += `   📰 ${article.bron} | Score: ${article.score}/100\n`;
      content += `   💭 ${article.beschrijving.substring(0, 120)}...\n\n`;
    });
    
    content += `🔍 **Trends van de week:**\n`;
    analysis.topCategories.forEach(([category, count]) => {
      content += `• ${category}: ${count} artikelen\n`;
    });
    
    content += `\n🎯 **Key insights:**\n`;
    analysis.topKeywords.slice(0, 3).forEach(([keyword]) => {
      content += `• ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} blijft hot topic\n`;
    });
    
    content += `\nWat vind jij van deze ontwikkelingen? 👇\n\n`;
    content += template.hashtags.join(' ');
    
    return {
      type: 'weeklyRoundup',
      title: template.title,
      content,
      metadata: {
        weekRange,
        articleCount: analysis.totalArticles,
        avgScore: analysis.avgScore
      }
    };
  }

  generateInsightPost(analysis) {
    const template = this.contentTemplates.insightPost;
    const topArticle = analysis.top5Articles[0];
    const mainTrend = analysis.topKeywords[0];
    
    let content = `${template.title}\n\n`;
    
    // Focus op de grootste trend
    if (mainTrend) {
      content += `Deze week zag ik ${mainTrend[1]} artikelen over "${mainTrend[0]}" voorbijkomen. `;
      content += `Dit bevestigt wat we al langer zien in de Nederlandse recruitment markt.\n\n`;
    }
    
    // Highlight top artikel
    content += `💡 **Het artikel dat mijn aandacht trok:**\n`;
    content += `"${topArticle.onderwerp}"\n`;
    content += `📰 Via ${topArticle.bron}\n\n`;
    
    content += `${topArticle.beschrijving.substring(0, 200)}...\n\n`;
    
    // Persoonlijke analyse
    content += `**Mijn analyse:**\n`;
    if (mainTrend[0].includes('ai')) {
      content += `AI blijft de recruitment wereld transformeren. Nederlandse bedrijven die nu niet investeren in AI-gedreven recruitment, lopen het risico achter te blijven.\n\n`;
    } else if (mainTrend[0].includes('arbeidsmarkt')) {
      content += `De krapte op de Nederlandse arbeidsmarkt vraagt om nieuwe strategieën. Traditionele recruitment methoden zijn niet meer voldoende.\n\n`;
    } else {
      content += `Deze trend laat zien hoe snel onze industrie verandert. Het is belangrijk om bij te blijven met deze ontwikkelingen.\n\n`;
    }
    
    content += `Hoe zie jij deze ontwikkeling? Ervaar je dit ook in je organisatie?\n\n`;
    content += template.hashtags.join(' ');
    
    return {
      type: 'insightPost',
      title: template.title,
      content,
      metadata: {
        mainTrend: mainTrend[0],
        focusArticle: topArticle.onderwerp
      }
    };
  }

  generateTrendAnalysisPost(analysis) {
    const template = this.contentTemplates.trendAnalysis;
    
    let content = `${template.title}\n\n`;
    
    content += `Na analyse van ${analysis.totalArticles} artikelen deze week zie ik 3 duidelijke trends:\n\n`;
    
    // Top 3 trends uitwerken
    analysis.topCategories.forEach(([category, count], i) => {
      content += `${i + 1}. **${category}** (${count} artikelen)\n`;
      
      // Context per categorie
      if (category.includes('AI')) {
        content += `   → Automatisering en AI-tools worden mainstream in recruitment\n`;
      } else if (category.includes('Arbeidsmarkt')) {
        content += `   → Aanhoudende krapte vraagt om creatieve oplossingen\n`;
      } else if (category.includes('Technology')) {
        content += `   → Nieuwe tech-tools veranderen hoe we recruiteren\n`;
      } else if (category.includes('Salaris')) {
        content += `   → Compensatie wordt steeds belangrijker in talent war\n`;
      } else {
        content += `   → Belangrijke ontwikkelingen in deze sector\n`;
      }
      content += `\n`;
    });
    
    content += `📊 **Data insights:**\n`;
    content += `• Gemiddelde relevantie score: ${analysis.avgScore}/100\n`;
    content += `• Meest actieve bron: ${analysis.topSources[0][0]}\n`;
    content += `• Hottest keyword: "${analysis.topKeywords[0][0]}"\n\n`;
    
    content += `🔮 **Wat betekent dit?**\n`;
    content += `Deze trends laten zien dat de Nederlandse recruitment markt in een transitiefase zit. `;
    content += `Organisaties die snel adapteren, krijgen een concurrentievoordeel.\n\n`;
    
    content += `Welke trend heeft de meeste impact op jouw organisatie? 💭\n\n`;
    content += template.hashtags.join(' ');
    
    return {
      type: 'trendAnalysis',
      title: template.title,
      content,
      metadata: {
        topTrends: analysis.topCategories.map(([cat]) => cat),
        avgScore: analysis.avgScore
      }
    };
  }

  generateLongFormArticle(analysis) {
    const template = this.contentTemplates.article;
    const currentWeek = new Date().toLocaleDateString('nl-NL', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    
    let content = `# ${template.title}\n`;
    content += `*Week van ${analysis.weekRange.start} tot ${analysis.weekRange.end}*\n\n`;
    
    content += `## Inleiding\n\n`;
    content += `Als iemand die dagelijks de Nederlandse recruitment markt volgt, analyseer ik wekelijks de belangrijkste ontwikkelingen. `;
    content += `Deze week heb ik ${analysis.totalArticles} artikelen van verschillende bronnen geanalyseerd en gescoord op relevantie.\n\n`;
    
    content += `## De Top 5 Ontwikkelingen\n\n`;
    
    analysis.top5Articles.forEach((article, i) => {
      content += `### ${i + 1}. ${article.onderwerp}\n`;
      content += `**Bron:** ${article.bron} | **Relevantie:** ${article.score}/100\n\n`;
      content += `${article.beschrijving}\n\n`;
      
      // Persoonlijke analyse per artikel
      if (article.keywords.includes('ai')) {
        content += `**Mijn analyse:** AI-adoptie in recruitment versnelt. Dit artikel toont aan dat Nederlandse bedrijven vooroplopen in Europa.\n\n`;
      } else if (article.keywords.includes('arbeidsmarkt')) {
        content += `**Mijn analyse:** De arbeidsmarktkrapte blijft uitdagingen geven, maar creëert ook kansen voor innovatieve recruitment strategieën.\n\n`;
      } else {
        content += `**Mijn analyse:** Een belangrijke ontwikkeling die impact heeft op hoe we recruitment vormgeven in Nederland.\n\n`;
      }
    });
    
    content += `## Trend Analyse\n\n`;
    content += `Deze week domineerden ${analysis.topCategories.length} hoofdcategorieën:\n\n`;
    
    analysis.topCategories.forEach(([category, count]) => {
      content += `- **${category}**: ${count} artikelen\n`;
    });
    
    content += `\n## De Belangrijkste Keywords\n\n`;
    content += `De meest voorkomende onderwerpen deze week:\n\n`;
    analysis.topKeywords.forEach(([keyword, count]) => {
      content += `- ${keyword}: ${count}x genoemd\n`;
    });
    
    content += `\n## Conclusie\n\n`;
    content += `Met een gemiddelde relevantie score van ${analysis.avgScore}/100 was dit een week vol belangrijke ontwikkelingen. `;
    
    if (analysis.topKeywords[0][0].includes('ai')) {
      content += `De focus op AI en technologie laat zien dat de Nederlandse recruitment markt volwassen wordt in het adopteren van nieuwe tools.\n\n`;
    } else {
      content += `De diversiteit aan onderwerpen toont de complexiteit van de huidige recruitment markt.\n\n`;
    }
    
    content += `Voor recruitment professionals is het essentieel om bij te blijven met deze ontwikkelingen. `;
    content += `De organisaties die proactief inspelen op deze trends, zullen de talent war winnen.\n\n`;
    
    content += `## Over deze analyse\n\n`;
    content += `Deze wekelijkse analyse is gebaseerd op geautomatiseerde monitoring van de belangrijkste Nederlandse recruitment websites. `;
    content += `Elk artikel wordt gescoord op relevantie, actualiteit en impact.\n\n`;
    
    content += `---\n\n`;
    content += `*Wat vind jij van deze ontwikkelingen? Laat het me weten in de reacties!*\n\n`;
    content += template.hashtags.join(' ');
    
    return {
      type: 'article',
      title: template.title,
      content,
      metadata: {
        wordCount: content.split(' ').length,
        weekRange: analysis.weekRange,
        analysisDepth: 'comprehensive'
      }
    };
  }

  async generateAllContentFormats(analysis) {
    const contentFormats = {
      weeklyRoundup: this.generateWeeklyRoundupPost(analysis),
      insightPost: this.generateInsightPost(analysis),
      trendAnalysis: this.generateTrendAnalysisPost(analysis),
      longFormArticle: this.generateLongFormArticle(analysis)
    };
    
    return contentFormats;
  }

  async saveContentToFiles(contentFormats, analysis) {
    await this.ensureOutputDir();
    
    const timestamp = new Date().toISOString().split('T')[0];
    const weekIdentifier = `week-${timestamp}`;
    
    const savedFiles = {};
    
    for (const [type, content] of Object.entries(contentFormats)) {
      const filename = `${weekIdentifier}-${type}.md`;
      const filepath = path.join(this.outputDir, filename);
      
      await fs.writeFile(filepath, content.content);
      savedFiles[type] = filepath;
      
      console.log(`📄 ${type}: ${filename}`);
    }
    
    // Sla ook metadata op
    const metadataFile = path.join(this.outputDir, `${weekIdentifier}-metadata.json`);
    await fs.writeFile(metadataFile, JSON.stringify({
      generatedAt: new Date().toISOString(),
      weekRange: analysis.weekRange,
      analysis: analysis,
      contentTypes: Object.keys(contentFormats)
    }, null, 2));
    
    return { savedFiles, metadataFile };
  }

  async runWeeklyContentCreation() {
    console.log('📝 **WEKELIJKSE LINKEDIN CONTENT CREATIE**');
    console.log('='.repeat(60));
    console.log(`🕐 ${new Date().toLocaleString('nl-NL')}\n`);
    
    try {
      // 1. Laad wekelijkse top artikel data
      const weeklyData = await this.loadWeeklyTopArticles();
      console.log(`📊 ${weeklyData.length} dagen data geladen voor analyse\n`);
      
      // 2. Analyseer trends
      console.log('🔍 **TREND ANALYSE**');
      console.log('-'.repeat(30));
      const analysis = await this.analyzeWeeklyTrends(weeklyData);
      
      console.log(`📈 ${analysis.totalArticles} artikelen geanalyseerd`);
      console.log(`🏆 Top artikel: ${analysis.top5Articles[0].onderwerp} (${analysis.top5Articles[0].score} pts)`);
      console.log(`📊 Gemiddelde score: ${analysis.avgScore}/100`);
      console.log(`🔥 Hottest trend: ${analysis.topKeywords[0][0]}\n`);
      
      // 3. Genereer alle content formaten
      console.log('✍️ **CONTENT GENERATIE**');
      console.log('-'.repeat(30));
      const contentFormats = await this.generateAllContentFormats(analysis);
      
      // 4. Sla content op
      console.log('💾 **BESTANDEN OPSLAAN**');
      console.log('-'.repeat(30));
      const { savedFiles, metadataFile } = await this.saveContentToFiles(contentFormats, analysis);
      
      // 5. Genereer content overview
      console.log('\n🎯 **CONTENT OVERZICHT:**');
      Object.entries(contentFormats).forEach(([type, content]) => {
        console.log(`\n📄 **${type.toUpperCase()}:**`);
        console.log(`   Titel: ${content.title}`);
        console.log(`   Lengte: ${content.content.split(' ').length} woorden`);
        console.log(`   Type: ${content.type}`);
      });
      
      console.log(`\n💾 **BESTANDEN:**`);
      Object.entries(savedFiles).forEach(([type, filepath]) => {
        console.log(`   ${type}: ${path.basename(filepath)}`);
      });
      
      console.log('\n🎯 **WEKELIJKSE CONTENT CREATIE COMPLEET!**');
      console.log(`✅ 4 content formaten gegenereerd`);
      console.log(`📊 Gebaseerd op ${analysis.totalArticles} geanalyseerde artikelen`);
      console.log(`🏆 Focus op top ${analysis.top5Articles.length} artikelen van de week`);
      
      return {
        success: true,
        contentGenerated: Object.keys(contentFormats).length,
        savedFiles,
        analysis
      };
      
    } catch (error) {
      console.error('❌ Fout tijdens content creatie:', error.message);
      throw error;
    }
  }

  async showContentPreview() {
    console.log('👁️ **CONTENT PREVIEW**');
    console.log('='.repeat(50));
    
    try {
      const weeklyData = await this.loadWeeklyTopArticles();
      const analysis = await this.analyzeWeeklyTrends(weeklyData);
      
      console.log(`📊 **Week Statistieken:**`);
      console.log(`   Artikelen: ${analysis.totalArticles}`);
      console.log(`   Gemiddelde score: ${analysis.avgScore}/100`);
      console.log(`   Periode: ${analysis.weekRange.start} - ${analysis.weekRange.end}\n`);
      
      console.log(`🏆 **Top 5 Artikelen:**`);
      analysis.top5Articles.forEach((article, i) => {
        console.log(`   ${i + 1}. ${article.onderwerp} (${article.score} pts)`);
        console.log(`      📰 ${article.bron} | ${article.categorie}`);
      });
      
      console.log(`\n🔥 **Trending Keywords:**`);
      analysis.topKeywords.slice(0, 5).forEach(([keyword, count]) => {
        console.log(`   • ${keyword}: ${count}x`);
      });
      
      console.log(`\n📱 **Beschikbare Content Types:**`);
      console.log(`   1. Weekly Roundup Post (Social media friendly)`);
      console.log(`   2. Insight Post (Single trend focus)`);
      console.log(`   3. Trend Analysis Post (Data-driven)`);
      console.log(`   4. Long-form Article (Comprehensive)`);
      
    } catch (error) {
      console.log('❌ Geen data beschikbaar voor preview. Run eerst dagelijkse uploads.');
    }
  }
}

// Command line interface
if (require.main === module) {
  const creator = new LinkedInContentCreator();
  const command = process.argv[2];
  
  switch (command) {
    case 'create':
    case 'generate':
      creator.runWeeklyContentCreation()
        .then(() => console.log('\n🎯 Content creatie compleet!'))
        .catch(console.error);
      break;
    case 'preview':
      creator.showContentPreview()
        .then(() => console.log('\n✅ Preview compleet!'))
        .catch(console.error);
      break;
    default:
      console.log(`
📝 **LinkedIn Content Creator voor Nederlandse Recruitment**

Usage:
  node linkedin-content-creator.cjs create     # Genereer wekelijkse LinkedIn content
  node linkedin-content-creator.cjs preview    # Preview van content data

Vereisten:
  📊 Minimaal 3 dagen dagelijkse uploads
  🎯 Top 5 artikelen per dag voor beste resultaten

Content Types:
  1. **Weekly Roundup**: Overzicht van top 5 artikelen (LinkedIn post)
  2. **Insight Post**: Focus op 1 trend met persoonlijke analyse
  3. **Trend Analysis**: Data-driven analyse van patronen
  4. **Long-form Article**: Uitgebreid artikel voor LinkedIn/blog

Features:
  📊 Automatische trend detectie
  🏆 Top 5 artikel selectie op basis van scoring
  ✍️ 4 verschillende content formaten
  📱 Klaar voor LinkedIn publicatie
  💾 Markdown export voor verder bewerken
  🎯 Nederlandse recruitment focus

Workflow:
  1. Dagelijks: node google-sheets-uploader.cjs upload
  2. Wekelijks: node linkedin-content-creator.cjs create
  3. Review en publiceer gegenereerde content
      `);
  }
}

module.exports = LinkedInContentCreator;