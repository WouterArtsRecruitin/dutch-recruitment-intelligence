#!/usr/bin/env node

/**
 * Debug version of Daily News Reader
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

async function debugLatestReport() {
  const reportsPath = '/Users/wouterarts/Library/CloudStorage/OneDrive-Recruitin/Recruitment-News-Reports';
  
  // Get latest report
  const files = await fs.readdir(reportsPath);
  const htmlFiles = files.filter(f => f.endsWith('.html') && f.includes('recruitment-news'));
  const latestFile = htmlFiles.sort().reverse()[0];
  
  console.log('📁 Latest file:', latestFile);
  
  const filePath = path.join(reportsPath, latestFile);
  const htmlContent = await fs.readFile(filePath, 'utf-8');
  
  console.log('📄 HTML content length:', htmlContent.length);
  
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;
  
  // Debug parsing
  console.log('\n🔍 DEBUG PARSING:');
  console.log('Title found:', document.querySelector('h1')?.textContent);
  console.log('Header p found:', document.querySelector('.header p')?.textContent);
  console.log('Stat cards found:', document.querySelectorAll('.stat-card').length);
  console.log('Categories found:', document.querySelectorAll('.category').length);
  
  // Show first category details
  const firstCategory = document.querySelector('.category');
  if (firstCategory) {
    console.log('\n📊 First category:');
    console.log('H2 text:', firstCategory.querySelector('h2')?.textContent);
    console.log('Articles in category:', firstCategory.querySelectorAll('.article').length);
    
    const firstArticle = firstCategory.querySelector('.article');
    if (firstArticle) {
      console.log('\n📰 First article:');
      console.log('Title:', firstArticle.querySelector('.article-title')?.textContent);
      console.log('Description:', firstArticle.querySelector('.article-description')?.textContent?.substring(0, 100));
    }
  }
}

debugLatestReport().catch(console.error);