#!/usr/bin/env node

/**
 * Complete Automation Flow
 * Dagelijkse Google Sheets upload + Wekelijkse LinkedIn content creatie
 */

const DutchRecruitmentNewsScraper = require('./dutch-recruitment-news-scraper.cjs');
const GoogleSheetsUploader = require('./google-sheets-uploader.cjs');
const LinkedInContentCreator = require('./linkedin-content-creator.cjs');
const HTMLReportGenerator = require('./generate-html-report.cjs');

class CompleteAutomationFlow {
  constructor() {
    this.scraper = new DutchRecruitmentNewsScraper();
    this.uploader = new GoogleSheetsUploader();
    this.contentCreator = new LinkedInContentCreator();
    this.htmlGenerator = new HTMLReportGenerator();
  }

  async runDailyFlow() {
    console.log('🚀 **DAGELIJKSE AUTOMATISERING FLOW**');
    console.log('='.repeat(60));
    console.log(`📅 ${new Date().toLocaleDateString('nl-NL')}`);
    console.log(`🕐 Gestart om: ${new Date().toLocaleTimeString('nl-NL')}\n`);

    const results = {
      newsCollection: null,
      sheetsUpload: null,
      htmlReport: null,
      errors: []
    };

    try {
      // STAP 1: Nederlandse recruitment nieuws verzamelen
      console.log('1️⃣ **NEDERLANDSE NIEUWS VERZAMELING**');
      console.log('-'.repeat(50));
      
      try {
        results.newsCollection = await this.scraper.scrapeAllDutchSources();
        console.log(`✅ ${results.newsCollection.totalArticles} artikelen verzameld van ${results.newsCollection.sources.length} bronnen`);
      } catch (error) {
        console.error(`❌ Nieuws verzameling gefaald: ${error.message}`);
        results.errors.push({ step: 'newsCollection', error: error.message });
      }

      // STAP 2: Google Sheets upload met scoring
      console.log('\n2️⃣ **GOOGLE SHEETS UPLOAD**');
      console.log('-'.repeat(50));
      
      try {
        results.sheetsUpload = await this.uploader.runDailyUpload();
        console.log(`✅ ${results.sheetsUpload.articlesProcessed} artikelen geüpload naar Google Sheets`);
      } catch (error) {
        console.error(`❌ Sheets upload gefaald: ${error.message}`);
        results.errors.push({ step: 'sheetsUpload', error: error.message });
      }

      // STAP 3: HTML Intelligence rapport
      console.log('\n3️⃣ **HTML INTELLIGENCE RAPPORT**');
      console.log('-'.repeat(50));
      
      try {
        results.htmlReport = await this.htmlGenerator.generateDailyIntelligenceReport();
        console.log(`✅ HTML rapport gegenereerd: ${results.htmlReport}`);
      } catch (error) {
        console.error(`❌ HTML rapport gefaald: ${error.message}`);
        results.errors.push({ step: 'htmlReport', error: error.message });
      }

      // STAP 4: Dagelijks overzicht
      console.log('\n4️⃣ **DAGELIJKS OVERZICHT**');
      console.log('-'.repeat(50));
      
      this.generateDailySummary(results);

      console.log('\n🎯 **DAGELIJKSE FLOW COMPLEET!**');
      
      if (results.errors.length === 0) {
        console.log('✅ Alle stappen succesvol voltooid');
      } else {
        console.log(`⚠️ Voltooid met ${results.errors.length} waarschuwingen`);
      }

      return results;

    } catch (error) {
      console.error('❌ Kritieke fout in dagelijkse flow:', error.message);
      throw error;
    }
  }

  async runWeeklyFlow() {
    console.log('📅 **WEKELIJKSE AUTOMATISERING FLOW**');
    console.log('='.repeat(60));
    console.log(`📅 ${new Date().toLocaleDateString('nl-NL')}`);
    console.log(`🕐 Gestart om: ${new Date().toLocaleTimeString('nl-NL')}\n`);

    const results = {
      dailyFlow: null,
      contentCreation: null,
      errors: []
    };

    try {
      // STAP 1: Voer eerst dagelijkse flow uit
      console.log('1️⃣ **DAGELIJKSE FLOW UITVOEREN**');
      console.log('-'.repeat(50));
      
      try {
        results.dailyFlow = await this.runDailyFlow();
        console.log('✅ Dagelijkse flow voltooid als onderdeel van wekelijkse flow');
      } catch (error) {
        console.error(`⚠️ Dagelijkse flow issues: ${error.message}`);
        results.errors.push({ step: 'dailyFlow', error: error.message });
      }

      // STAP 2: LinkedIn content creatie
      console.log('\n2️⃣ **LINKEDIN CONTENT CREATIE**');
      console.log('-'.repeat(50));
      
      try {
        results.contentCreation = await this.contentCreator.runWeeklyContentCreation();
        console.log(`✅ ${results.contentCreation.contentGenerated} content formaten gegenereerd`);
      } catch (error) {
        console.error(`❌ Content creatie gefaald: ${error.message}`);
        results.errors.push({ step: 'contentCreation', error: error.message });
      }

      // STAP 3: Wekelijks overzicht
      console.log('\n3️⃣ **WEKELIJKS OVERZICHT**');
      console.log('-'.repeat(50));
      
      this.generateWeeklySummary(results);

      console.log('\n🎯 **WEKELIJKSE FLOW COMPLEET!**');
      
      if (results.errors.length === 0) {
        console.log('✅ Alle stappen succesvol voltooid');
      } else {
        console.log(`⚠️ Voltooid met ${results.errors.length} waarschuwingen`);
      }

      return results;

    } catch (error) {
      console.error('❌ Kritieke fout in wekelijkse flow:', error.message);
      throw error;
    }
  }

  generateDailySummary(results) {
    const summary = {
      timestamp: new Date().toLocaleString('nl-NL'),
      articlesCollected: results.newsCollection?.totalArticles || 0,
      articlesUploaded: results.sheetsUpload?.articlesProcessed || 0,
      htmlReportGenerated: !!results.htmlReport,
      topArticle: results.sheetsUpload?.topArticles?.[0] || null,
      errors: results.errors.length
    };

    console.log(`📊 **DAGELIJKSE SAMENVATTING:**`);
    console.log(`   🕐 Tijdstip: ${summary.timestamp}`);
    console.log(`   📰 Artikelen verzameld: ${summary.articlesCollected}`);
    console.log(`   📤 Naar Sheets geüpload: ${summary.articlesUploaded}`);
    console.log(`   📄 HTML rapport: ${summary.htmlReportGenerated ? '✅ Gegenereerd' : '❌ Gefaald'}`);
    
    if (summary.topArticle) {
      console.log(`   🏆 Top artikel: ${summary.topArticle.onderwerp} (${summary.topArticle.score} pts)`);
    }
    
    console.log(`   ⚠️ Fouten: ${summary.errors}`);

    if (results.errors.length > 0) {
      console.log(`\n❌ **FOUTEN DETAILS:**`);
      results.errors.forEach(({ step, error }, i) => {
        console.log(`   ${i + 1}. ${step}: ${error}`);
      });
    }

    console.log(`\n💡 **VOLGENDE STAPPEN:**`);
    console.log(`   • Check Google Sheets voor nieuwe data`);
    console.log(`   • Review HTML rapport: ${results.htmlReport || 'N/A'}`);
    
    if (new Date().getDay() === 0) { // Zondag
      console.log(`   📅 Morgen is het tijd voor wekelijkse LinkedIn content!`);
    }
  }

  generateWeeklySummary(results) {
    console.log(`📊 **WEKELIJKSE SAMENVATTING:**`);
    console.log(`   🕐 Tijdstip: ${new Date().toLocaleString('nl-NL')}`);
    
    if (results.dailyFlow) {
      console.log(`   📰 Laatste dag artikelen: ${results.dailyFlow.newsCollection?.totalArticles || 0}`);
    }
    
    if (results.contentCreation) {
      console.log(`   📝 Content types: ${results.contentCreation.contentGenerated}`);
      console.log(`   📊 Gebaseerd op: ${results.contentCreation.analysis?.totalArticles || 0} artikelen`);
      console.log(`   🏆 Gemiddelde score: ${results.contentCreation.analysis?.avgScore || 0}/100`);
    }
    
    console.log(`   ⚠️ Totaal fouten: ${results.errors.length}`);

    if (results.contentCreation?.savedFiles) {
      console.log(`\n📄 **GEGENEREERDE CONTENT:**`);
      Object.entries(results.contentCreation.savedFiles).forEach(([type, filepath]) => {
        console.log(`   • ${type}: ${require('path').basename(filepath)}`);
      });
    }

    console.log(`\n🎯 **ACTIEPUNTEN:**`);
    console.log(`   1. Review gegenereerde LinkedIn content`);
    console.log(`   2. Kies beste content format voor publicatie`);
    console.log(`   3. Plan publicatie schema voor komende week`);
    console.log(`   4. Check Google Sheets data voor trends`);
  }

  async showSystemStatus() {
    console.log('🔍 **SYSTEEM STATUS OVERZICHT**');
    console.log('='.repeat(60));
    
    try {
      // Check laatste dagelijkse run
      console.log('📅 **DAGELIJKSE RUNS:**');
      await this.uploader.showUploadStatus();
      
      console.log('\n📝 **CONTENT CREATIE:**');
      await this.contentCreator.showContentPreview();
      
      console.log('\n📊 **BESCHIKBARE COMMANDO\'S:**');
      console.log('   Dagelijks:');
      console.log('   • node complete-automation-flow.cjs daily');
      console.log('   • node run-tools.cjs dutch');
      console.log('   • node google-sheets-uploader.cjs upload');
      console.log('   • node run-tools.cjs html');
      
      console.log('\n   Wekelijks:');
      console.log('   • node complete-automation-flow.cjs weekly');
      console.log('   • node linkedin-content-creator.cjs create');
      
    } catch (error) {
      console.error('❌ Fout bij status check:', error.message);
    }
  }

  async setupCronJobs() {
    console.log('⏰ **CRON JOB SETUP INSTRUCTIES**');
    console.log('='.repeat(60));
    
    console.log(`Voor automatisering, voeg deze regels toe aan je crontab:`);
    console.log(`(Run: crontab -e)\n`);
    
    const scriptPath = __dirname;
    
    console.log(`# Dagelijkse Nederlandse recruitment nieuws (elke dag om 09:00)`);
    console.log(`0 9 * * * cd ${scriptPath} && node complete-automation-flow.cjs daily >> automation.log 2>&1\n`);
    
    console.log(`# Wekelijkse LinkedIn content creatie (elke zondag om 10:00)`);
    console.log(`0 10 * * 0 cd ${scriptPath} && node complete-automation-flow.cjs weekly >> automation.log 2>&1\n`);
    
    console.log(`💡 **ALTERNATIEVE SCHEMA'S:**`);
    console.log(`   Dagelijks om 08:00: 0 8 * * *`);
    console.log(`   Elke werkdag om 09:30: 30 9 * * 1-5`);
    console.log(`   Wekelijks maandag om 09:00: 0 9 * * 1`);
    
    console.log(`\n🔧 **ENVIRONMENT VARIABELEN:**`);
    console.log(`   export GOOGLE_SHEET_ID="your_sheet_id"`);
    console.log(`   export GOOGLE_API_KEY="your_api_key"`);
    
    console.log(`\n📧 **EMAIL NOTIFICATIES (optioneel):**`);
    console.log(`   Installeer: sudo apt-get install mailutils`);
    console.log(`   Voeg toe aan cron: | mail -s "Automation Report" your@email.com`);
  }
}

// Command line interface
if (require.main === module) {
  const automation = new CompleteAutomationFlow();
  const command = process.argv[2];
  
  switch (command) {
    case 'daily':
      automation.runDailyFlow()
        .then(() => console.log('\n🎯 Dagelijkse automatisering compleet!'))
        .catch(console.error);
      break;
    case 'weekly':
      automation.runWeeklyFlow()
        .then(() => console.log('\n🎯 Wekelijkse automatisering compleet!'))
        .catch(console.error);
      break;
    case 'status':
      automation.showSystemStatus()
        .then(() => console.log('\n✅ Status check compleet!'))
        .catch(console.error);
      break;
    case 'cron':
    case 'setup':
      automation.setupCronJobs();
      break;
    default:
      console.log(`
🤖 **Complete Recruitment Intelligence Automation**

Usage:
  node complete-automation-flow.cjs daily      # Dagelijkse flow (news → sheets → html)
  node complete-automation-flow.cjs weekly     # Wekelijkse flow (daily + linkedin content)
  node complete-automation-flow.cjs status     # Systeem status overzicht
  node complete-automation-flow.cjs setup      # Cron job setup instructies

📅 **DAGELIJKSE FLOW:**
  1. 🇳🇱 Nederlandse recruitment nieuws verzamelen (8 bronnen)
  2. 📊 Artikelen scoren en uploaden naar Google Sheets
  3. 📄 HTML intelligence rapport genereren
  4. 📈 Dagelijkse samenvatting

📝 **WEKELIJKSE FLOW:**
  1. ✅ Dagelijkse flow uitvoeren
  2. 📊 Wekelijkse trend analyse (top 5 artikelen)
  3. 📝 4 LinkedIn content formaten genereren:
     • Weekly Roundup Post
     • Insight Post (trend focus)
     • Trend Analysis Post (data-driven)  
     • Long-form Article (uitgebreid)
  4. 💾 Content opslaan als Markdown bestanden

🎯 **AUTOMATISERING FEATURES:**
  📊 Automatische artikel scoring (AI, arbeidsmarkt, salaris trends)
  📤 Google Sheets integratie met datum, bron, URL, score
  📱 LinkedIn-ready content in 4 formaten
  📈 Trend detectie en analyse
  🇳🇱 100% Nederlandse recruitment focus
  ⏰ Cron job ondersteuning voor volledige automatisering

💡 **VOOR VOLLEDIGE AUTOMATISERING:**
  1. Set up Google Sheets API credentials
  2. Run: node complete-automation-flow.cjs setup
  3. Configureer cron jobs volgens instructies
  4. Check dagelijks Google Sheets en wekelijks LinkedIn content

🚀 **QUICK START:**
  node complete-automation-flow.cjs daily     # Test dagelijkse flow
  node complete-automation-flow.cjs weekly    # Test wekelijkse flow
      `);
  }
}

module.exports = CompleteAutomationFlow;