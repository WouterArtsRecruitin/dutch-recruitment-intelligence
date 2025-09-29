# Notion Database Integratie - Dutch Recruitment Intelligence

## ✅ WEBHOOK READY!
**Nieuwe endpoint:** `https://dutch-recruitment-intelligence.onrender.com/upload-to-notion`

## Stap 1: Notion Database Aanmaken

1. **Open Notion** → Nieuwe page
2. **Maak database** met deze **exacte properties** (zelfde als Google Sheets):

### Database Properties:
| Property | Type | Description |
|----------|------|-------------|
| **Datum** | Date | Upload datum |
| **Tijd** | Rich Text | Upload tijd |
| **Artikel_Titel** | Title | Nederlandse recruitment nieuws titel |
| **Artikel_Beschrijving** | Rich Text | Artikel samenvatting |
| **Nieuwsbron** | Select | Dutch recruitment website |
| **Nieuws_Categorie** | Select | Type recruitment nieuws |
| **Artikel_URL** | URL | Link naar volledig artikel |
| **Publicatie_Datum** | Date | Originele publicatie datum |
| **Relevantie_Score** | Number | Dutch recruitment relevantie (0-100) |
| **Market_Insights** | Rich Text | Nederlandse arbeidsmarkt trends |
| **Artikelen_Verzameld** | Number | Totaal aantal artikelen |
| **Nederlandse_Bronnen** | Number | Aantal Dutch websites |
| **Nieuws_Categorieën** | Number | Aantal verschillende onderwerpen |
| **Collectie_Status** | Select | Status verzameling |

3. **Database naam:** "Dutch Recruitment Intelligence"

## Stap 2: Notion Integratie in Zapier

### Wijzig je bestaande Daily Zap:
1. **Ga naar je Daily Sheets Zap** (09:30 Amsterdam)
2. **Add action AFTER Google Sheets:**
   - **Action 3:** Notion - Create Database Item
   - **Action 4:** Email notification

### Of maak nieuwe Notion Zap:
1. **Nieuwe Zap:** "Dutch Recruitment → Notion Database"
2. **Trigger:** Schedule - Daily 09:35 (5 min na Google Sheets)
3. **Action 1:** Webhook POST → `/upload-to-notion`
4. **Action 2:** Notion - Create Database Item (Multiple)

## Stap 3: Notion Action Configureren

### Connect Notion:
1. **Connect Notion account** in Zapier
2. **Select database:** "Dutch Recruitment Intelligence" 
3. **Permission:** Write access

### Field Mapping (gebruik webhook response):
```
Datum: {{webhook.articles.Datum}}
Tijd: {{webhook.articles.Tijd}}  
Artikel_Titel: {{webhook.articles.Artikel_Titel}}
Artikel_Beschrijving: {{webhook.articles.Artikel_Beschrijving}}
Nieuwsbron: {{webhook.articles.Nieuwsbron}}
Nieuws_Categorie: {{webhook.articles.Nieuws_Categorie}}
Artikel_URL: {{webhook.articles.Artikel_URL}}
Publicatie_Datum: {{webhook.articles.Publicatie_Datum}}
Relevantie_Score: {{webhook.articles.Relevantie_Score}}
Market_Insights: {{webhook.articles.Market_Insights}}
Artikelen_Verzameld: {{webhook.articles.Artikelen_Verzameld}}
Nederlandse_Bronnen: {{webhook.articles.Nederlandse_Bronnen}}
Nieuws_Categorieën: {{webhook.articles.Nieuws_Categorieën}}
Collectie_Status: {{webhook.articles.Collectie_Status}}
```

## Stap 4: Test de Integratie

**Test webhook direct:**
`https://dutch-recruitment-intelligence.onrender.com/upload-to-notion`

**Verwachte response:**
- ✅ 5 artikelen in `articles` array
- ✅ Exacte Google Sheets headers
- ✅ Nederlandse recruitment content

## Stap 5: Automatisering

**Na setup krijg je:**
- 📊 **09:30:** Google Sheets update (5 rijen)
- 📋 **09:35:** Notion database update (5 entries) 
- 📧 **Email:** "Notion Database Updated - 5 artikelen toegevoegd"

## Voordelen Notion + Google Sheets:

✅ **Dubbele backup** van recruitment data
✅ **Notion:** Rich content, relaties, views
✅ **Google Sheets:** Data analysis, charts
✅ **Consistente headers** tussen beide platforms
✅ **Automatische sync** elke dag

## Notion Database Views:
- **All Articles:** Alle artikelen chronologisch
- **High Scores:** Filter Relevantie_Score >85
- **By Source:** Gegroepeerd per Nieuwsbron  
- **This Week:** Filter laatste 7 dagen

Je Dutch Recruitment Intelligence data is nu beschikbaar in zowel Google Sheets als Notion! 🚀