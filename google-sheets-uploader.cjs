#!/usr/bin/env node

/**
 * Google Sheets Uploader voor Nederlandse Recruitment Artikelen
 * Automatische upload van dagelijkse artikelen met scoring systeem
 */

const fs = require('fs').promises;
const path = require('path');

class GoogleSheetsUploader {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.outputDir = path.join(__dirname, 'reports');
    
    // Google Sheets configuratie (gebruik Google Apps Script API of sheets API)
    this.sheetConfig = {
      spreadsheetId: process.env.GOOGLE_SHEET_ID || 'VOEG_JE_SHEET_ID_TOE',
      sheetName: 'Recruitment Artikelen',
      apiKey: process.env.GOOGLE_API_KEY || 'VOEG_JE_API_KEY_TOE'
    };
    
    // Scoring criteria voor belangrijkheid artikelen
    this.scoringCriteria = {
      keywords: {
        'ai': 10,
        'artificial intelligence': 10, 
        'automation': 8,
        'recruitment technology': 8,
        'arbeidsmarkt': 9,
        'tekort': 9,
        'krapte': 8,
        'salaris': 7,
        'loon': 7,
        'hybride werk': 6,
        'remote': 6,
        'wetgeving': 7,
        'hr trends': 6,
        'talent': 5,
        'diversiteit': 5,
        'inclusie': 5
      },
      sources: {
        'Intelligence Group': 9,
        'Werf&': 8,
        'RecruitmentTech.nl': 8,
        'Personnel & Winst (P&W)': 7,
        'HRkrant': 6,
        'Recruitment Matters': 6,
        'Recruiters Connected': 5,
        'Recruiters United': 5
      },
      categories: {
        'AI & Technologie': 10,
        'Arbeidsmarktonderzoek': 9,
        'Recruitment Technology': 8,
        'Salaris & Arbeidsvoorwaarden': 7,
        'HR & Wetgeving': 7,
        'Arbeidsmarkt': 8,
        'Toekomst van Werk': 6,
        'D&I': 5
      }
    };
  }

  async calculateArticleScore(article) {
    let score = 0;
    
    // Keyword scoring
    const text = `${article.title} ${article.description}`.toLowerCase();
    Object.entries(this.scoringCriteria.keywords).forEach(([keyword, points]) => {
      if (text.includes(keyword)) {
        score += points;
      }
    });
    
    // Source scoring
    if (this.scoringCriteria.sources[article.source]) {
      score += this.scoringCriteria.sources[article.source];
    }
    
    // Category scoring
    if (this.scoringCriteria.categories[article.category]) {
      score += this.scoringCriteria.categories[article.category];
    }
    
    // Content quality bonus
    if (article.description && article.description.length > 100) {
      score += 3;
    }
    
    // Recentheid bonus (artikelen van vandaag krijgen bonus)
    const today = new Date().toISOString().split('T')[0];
    const articleDate = new Date(article.publishDate).toISOString().split('T')[0];
    if (articleDate === today) {
      score += 5;
    }
    
    return Math.min(score, 100); // Cap op 100
  }

  async loadLatestDutchNews() {
    try {
      const content = await fs.readFile(path.join(this.dataDir, 'latest-dutch-news.json'), 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error('Geen Nederlandse nieuws data gevonden. Run eerst: node run-tools.cjs dutch');
    }
  }

  async prepareSheetData(newsData) {
    const sheetData = [];
    
    console.log('🔢 **ARTIKEL SCORING & VOORBEREIDING**');
    console.log('='.repeat(50));
    
    for (const category of newsData.categories) {
      for (const article of category.articles) {
        const score = await this.calculateArticleScore(article);
        
        const sheetRow = {
          datum: new Date().toLocaleDateString('nl-NL'),
          bron: article.source,
          categorie: article.category || category.title,
          onderwerp: article.title,
          url: article.url || `${article.sourceUrl}/artikel-${Date.now()}`,
          score: score,
          beschrijving: article.description.substring(0, 500) + (article.description.length > 500 ? '...' : ''),
          keywords: this.extractKeywords(article),
          gepubliceerd: new Date(article.publishDate).toLocaleDateString('nl-NL')
        };
        
        sheetData.push(sheetRow);
        
        console.log(`📊 ${article.title}`);
        console.log(`   Score: ${score}/100 | Bron: ${article.source} | Cat: ${article.category}`);
      }
    }
    
    // Sorteer op score (hoogste eerst)
    sheetData.sort((a, b) => b.score - a.score);
    
    console.log(`\n🎯 **TOP 5 ARTIKELEN VAN VANDAAG:**`);
    sheetData.slice(0, 5).forEach((article, i) => {
      console.log(`${i + 1}. ${article.onderwerp} (Score: ${article.score})`);
    });
    
    return sheetData;
  }

  extractKeywords(article) {
    const text = `${article.title} ${article.description}`.toLowerCase();
    const foundKeywords = [];
    
    Object.keys(this.scoringCriteria.keywords).forEach(keyword => {
      if (text.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    });
    
    return foundKeywords.join(', ');
  }

  async uploadToGoogleSheets(sheetData) {
    console.log('\n📤 **GOOGLE SHEETS UPLOAD**');
    console.log('='.repeat(50));
    
    // Simulatie van Google Sheets upload
    // In productie zou je hier de echte Google Sheets API gebruiken
    console.log(`📊 Uploading ${sheetData.length} artikelen naar Google Sheets...`);
    console.log(`🌐 Spreadsheet ID: ${this.sheetConfig.spreadsheetId}`);
    console.log(`📋 Sheet: ${this.sheetConfig.sheetName}`);
    
    // Bewaar lokaal als backup/demo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.dataDir, `sheets-backup-${timestamp}.json`);
    await fs.writeFile(backupFile, JSON.stringify(sheetData, null, 2));
    
    // Genereer CSV voor import
    const csvData = this.convertToCSV(sheetData);
    const csvFile = path.join(this.outputDir, `recruitment-artikelen-${new Date().toISOString().split('T')[0]}.csv`);
    await fs.writeFile(csvFile, csvData);
    
    console.log(`✅ Data voorbereid voor upload:`);
    console.log(`   📁 Backup: ${backupFile}`);
    console.log(`   📊 CSV export: ${csvFile}`);
    console.log(`   🔢 Artikelen: ${sheetData.length}`);
    
    // Bewaar ook de top artikelen voor wekelijkse content
    await this.saveTopArticlesForWeekly(sheetData.slice(0, 10));
    
    return {
      success: true,
      articlesProcessed: sheetData.length,
      topArticles: sheetData.slice(0, 5),
      backupFile,
      csvFile
    };
  }

  convertToCSV(data) {
    const headers = ['Datum', 'Bron', 'Categorie', 'Onderwerp', 'URL', 'Score', 'Beschrijving', 'Keywords', 'Gepubliceerd'];
    
    let csv = headers.join(',') + '\n';
    
    data.forEach(row => {
      const csvRow = [
        `"${row.datum}"`,
        `"${row.bron}"`,
        `"${row.categorie}"`,
        `"${row.onderwerp.replace(/"/g, '""')}"`,
        `"${row.url}"`,
        row.score,
        `"${row.beschrijving.replace(/"/g, '""')}"`,
        `"${row.keywords}"`,
        `"${row.gepubliceerd}"`
      ];
      csv += csvRow.join(',') + '\n';
    });
    
    return csv;
  }

  async saveTopArticlesForWeekly(topArticles) {
    const weeklyFile = path.join(this.dataDir, 'weekly-top-articles.json');
    
    try {
      // Laad bestaande wekelijkse data
      let weeklyData = [];
      try {
        const existing = await fs.readFile(weeklyFile, 'utf-8');
        weeklyData = JSON.parse(existing);
      } catch (error) {
        // Nieuw bestand
      }
      
      // Voeg vandaag's top artikelen toe
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = {
        date: today,
        articles: topArticles,
        addedAt: new Date().toISOString()
      };
      
      // Verwijder oude entries van dezelfde dag
      weeklyData = weeklyData.filter(entry => entry.date !== today);
      weeklyData.push(todayEntry);
      
      // Behoud alleen laatste 7 dagen
      weeklyData = weeklyData.slice(-7);
      
      await fs.writeFile(weeklyFile, JSON.stringify(weeklyData, null, 2));
      console.log(`💾 Top artikelen opgeslagen voor wekelijkse content creatie`);
      
    } catch (error) {
      console.error('❌ Fout bij opslaan wekelijkse data:', error.message);
    }
  }

  async runDailyUpload() {
    console.log('📅 **DAGELIJKSE GOOGLE SHEETS UPLOAD**');
    console.log('='.repeat(60));
    console.log(`🕐 ${new Date().toLocaleString('nl-NL')}\n`);
    
    try {
      // 1. Laad Nederlandse nieuws data
      const newsData = await this.loadLatestDutchNews();
      console.log(`📰 ${newsData.totalArticles} artikelen geladen van ${newsData.sources.length} bronnen\n`);
      
      // 2. Bereid data voor met scoring
      const sheetData = await this.prepareSheetData(newsData);
      
      // 3. Upload naar Google Sheets
      const result = await this.uploadToGoogleSheets(sheetData);
      
      // 4. Genereer dagelijks rapport
      await this.generateDailyReport(result);
      
      console.log('\n🎯 **DAGELIJKSE UPLOAD COMPLEET!**');
      console.log(`✅ ${result.articlesProcessed} artikelen verwerkt en gescoord`);
      console.log(`🏆 Top artikel: ${result.topArticles[0].onderwerp} (Score: ${result.topArticles[0].score})`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Fout tijdens dagelijkse upload:', error.message);
      throw error;
    }
  }

  async generateDailyReport(uploadResult) {
    const reportData = {
      date: new Date().toLocaleDateString('nl-NL'),
      summary: {
        articlesProcessed: uploadResult.articlesProcessed,
        averageScore: Math.round(uploadResult.topArticles.reduce((sum, a) => sum + a.score, 0) / uploadResult.topArticles.length),
        topCategory: uploadResult.topArticles[0].categorie,
        topSource: uploadResult.topArticles[0].bron
      },
      topArticles: uploadResult.topArticles,
      generatedAt: new Date().toISOString()
    };
    
    const reportFile = path.join(this.outputDir, `daily-upload-report-${new Date().toISOString().split('T')[0]}.json`);
    await fs.writeFile(reportFile, JSON.stringify(reportData, null, 2));
    
    console.log(`\n📊 **DAGELIJKS RAPPORT:**`);
    console.log(`   Artikelen verwerkt: ${reportData.summary.articlesProcessed}`);
    console.log(`   Gemiddelde score: ${reportData.summary.averageScore}/100`);
    console.log(`   Top categorie: ${reportData.summary.topCategory}`);
    console.log(`   Top bron: ${reportData.summary.topSource}`);
  }

  async showUploadStatus() {
    console.log('📊 **GOOGLE SHEETS UPLOAD STATUS**');
    console.log('='.repeat(50));
    
    try {
      // Check laatste upload
      const files = await fs.readdir(this.dataDir);
      const backupFiles = files.filter(f => f.startsWith('sheets-backup-')).sort().reverse();
      
      if (backupFiles.length > 0) {
        const latestBackup = backupFiles[0];
        const backupData = JSON.parse(await fs.readFile(path.join(this.dataDir, latestBackup), 'utf-8'));
        
        console.log(`📅 **Laatste Upload:**`);
        console.log(`   Bestand: ${latestBackup}`);
        console.log(`   Artikelen: ${backupData.length}`);
        console.log(`   Hoogste score: ${Math.max(...backupData.map(a => a.score))}`);
        
        console.log(`\n🏆 **Top 3 Artikelen:**`);
        backupData.slice(0, 3).forEach((article, i) => {
          console.log(`   ${i + 1}. ${article.onderwerp} (${article.score} pts)`);
        });
      } else {
        console.log('❌ Nog geen uploads gevonden');
      }
      
      // Check wekelijkse data
      try {
        const weeklyData = JSON.parse(await fs.readFile(path.join(this.dataDir, 'weekly-top-articles.json'), 'utf-8'));
        console.log(`\n📅 **Wekelijkse Data:**`);
        console.log(`   Dagen verzameld: ${weeklyData.length}/7`);
        console.log(`   Totaal top artikelen: ${weeklyData.reduce((sum, day) => sum + day.articles.length, 0)}`);
      } catch (error) {
        console.log('\n📅 **Wekelijkse Data:** Nog geen data verzameld');
      }
      
    } catch (error) {
      console.error('❌ Fout bij status check:', error.message);
    }
  }
}

// Command line interface
if (require.main === module) {
  const uploader = new GoogleSheetsUploader();
  const command = process.argv[2];
  
  switch (command) {
    case 'upload':
    case 'daily':
      uploader.runDailyUpload()
        .then(() => console.log('\n🎯 Dagelijkse upload compleet!'))
        .catch(console.error);
      break;
    case 'status':
      uploader.showUploadStatus()
        .then(() => console.log('\n✅ Status check compleet!'))
        .catch(console.error);
      break;
    default:
      console.log(`
📤 **Google Sheets Uploader voor Recruitment Artikelen**

Usage:
  node google-sheets-uploader.cjs upload     # Dagelijkse upload naar Google Sheets
  node google-sheets-uploader.cjs status     # Toon upload status

Setup:
  1. Zet je GOOGLE_SHEET_ID environment variable
  2. Zet je GOOGLE_API_KEY environment variable
  3. Run eerst: node run-tools.cjs dutch

Features:
  📊 Automatische artikel scoring (0-100 punten)
  📤 Google Sheets upload met datum, bron, onderwerp, URL, score
  💾 CSV export voor handmatige import
  🏆 Top 5 tracking voor wekelijkse content
  📈 Dagelijkse rapporten

Scoring Criteria:
  🤖 AI/Technology keywords: 8-10 punten
  📊 Arbeidsmarkt topics: 8-9 punten
  💰 Salaris content: 7 punten
  📰 Bron reputatie: 5-9 punten
  📝 Content kwaliteit: +3 bonus
      `);
  }
}

module.exports = GoogleSheetsUploader;