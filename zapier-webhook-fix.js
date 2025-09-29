// Fixed handleSheetsUpload function for Zapier compatibility

async handleSheetsUpload(req, res) {
  console.log('📤 Start Google Sheets upload...');
  
  try {
    // Accepteer zowel GET als POST voor Zapier compatibility
    if (req.method !== 'GET' && req.method !== 'POST') {
      this.sendErrorResponse(res, 405, 'Method not allowed. Use GET or POST.');
      return;
    }
    
    // Upload naar Google Sheets met scoring
    const uploadResult = await this.uploader.runDailyUpload();
    
    // Simplified flat response voor Zapier - geen nested objects
    const topArticle = uploadResult.topArticles[0] || {};
    const allArticles = uploadResult.topArticles || [];
    
    const zapierResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('nl-NL'),
      time: new Date().toLocaleTimeString('nl-NL'),
      
      // Top artikel (flat fields voor Zapier)
      title: topArticle.onderwerp || '',
      description: (topArticle.beschrijving || '').substring(0, 500),
      source: topArticle.bron || '',
      category: topArticle.categorie || '',
      score: topArticle.score || 0,
      url: topArticle.url || '',
      publishDate: topArticle.datum || '',
      
      // Summary statistics
      articlesProcessed: uploadResult.articlesProcessed || allArticles.length,
      averageScore: allArticles.length > 0 ? Math.round(allArticles.reduce((sum, a) => sum + (a.score || 0), 0) / allArticles.length) : 0,
      topScore: topArticle.score || 0,
      topCategory: topArticle.categorie || '',
      topSource: topArticle.bron || '',
      
      // Voor email notifications (eenvoudige strings)
      emailSubject: `📊 Dutch Recruitment Intelligence - ${new Date().toLocaleDateString('nl-NL')}`,
      emailMessage: `${uploadResult.articlesProcessed || 0} artikelen verwerkt. Top: "${topArticle.onderwerp || 'N/A'}" (${topArticle.score || 0}/100)`,
      
      // Status for triggers
      hasNewContent: true,
      contentReady: true
    };
    
    this.sendSuccessResponse(res, zapierResponse);
    console.log(`✅ ${zapierResponse.articlesProcessed} artikelen naar Zapier gestuurd (simplified format)`);
    
  } catch (error) {
    this.sendErrorResponse(res, 500, `Sheets upload gefaald: ${error.message}`);
  }
}