# Zapier Google Sheets Configuratie

## Je Sheet Details
**Sheet URL:** https://docs.google.com/spreadsheets/d/15SU_5yZe39-iVbu0ZQaDXuj_GGJv9PgCa-v2Ma8CLas/edit?usp=sharing
**Sheet ID:** `15SU_5yZe39-iVbu0ZQaDXuj_GGJv9PgCa-v2Ma8CLas`
**Worksheet:** Sheet1

## Stap 1: Import de Complete CSV
1. Download: `/Users/wouterarts/Downloads/local-mcp-apps/complete-google-sheet-import.csv`
2. Ga naar je sheet
3. File → Import
4. Upload de CSV
5. Import location: "Replace spreadsheet"
6. Separator: "Comma"
7. Import data

## Stap 2: Zapier Column Mapping
Gebruik in je Zapier Google Sheets action:

```
Spreadsheet: https://docs.google.com/spreadsheets/d/15SU_5yZe39-iVbu0ZQaDXuj_GGJv9PgCa-v2Ma8CLas/edit?usp=sharing

Worksheet: Sheet1

Column Mapping:
A (Datum): {{1.timestamp}} 
B (Tijd): {{1.timestamp}}
C (Artikel_Titel): {{1.topArticles.0.title}}
D (Artikel_Beschrijving): {{1.topArticles.0.description}}
E (Nieuwsbron): {{1.topArticles.0.source}}
F (Nieuws_Categorie): {{1.topArticles.0.category}}
G (Artikel_URL): {{1.topArticles.0.url}}
H (Publicatie_Datum): {{1.topArticles.0.publishDate}}
I (Relevantie_Score): {{1.topArticles.0.score}}
J (Market_Insights): {{1.insights}}
K (Artikelen_Verzameld): {{1.articlesCollected}}
L (Nederlandse_Bronnen): {{1.totalSources}}
M (Nieuws_Categorieën): {{1.totalCategories}}
N (Collectie_Status): {{1.triggerData.hasNewContent}}
```

## Stap 3: Test je Zapier Flow
Webhook URL: `https://dutch-recruitment-intelligence.onrender.com/daily-news-collection`
Sheet ID: `15SU_5yZe39-iVbu0ZQaDXuj_GGJv9PgCa-v2Ma8CLas`

Je Google Sheet is nu klaar voor Dutch Recruitment Intelligence data! 🚀