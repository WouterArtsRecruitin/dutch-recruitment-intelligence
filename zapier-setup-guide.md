# 🔄 Zapier Setup Gids - Nederlandse Recruitment Intelligence Automation

## Overzicht

Deze gids helpt je om je Nederlandse Recruitment Intelligence systeem volledig te automatiseren via Zapier. Je krijgt dagelijkse Google Sheets updates en wekelijkse LinkedIn content, allemaal automatisch!

## 📋 Vereisten

- [ ] Zapier account (gratis of premium voor meer zaps)
- [ ] Google Sheets toegang
- [ ] LinkedIn account voor content posting
- [ ] Webhook server draaiende op bereikbare URL (ngrok/Heroku/VPS)

## 🚀 Stap 1: Webhook Server Starten

### Lokaal Testen (met ngrok)
```bash
# Terminal 1: Start webhook server
node zapier-webhook-server.cjs 3000

# Terminal 2: Maak publieke URL met ngrok
npx ngrok http 3000
```

### Productie Deploy (Heroku/Railway/Render)
```bash
# Heroku voorbeeld
heroku create jouw-app-naam
git push heroku main
```

Je krijgt een URL zoals: `https://jouw-app-naam.herokuapp.com`

## 🔧 Stap 2: Zapier Zaps Configureren

### ZAP 1: Dagelijkse Nieuws Verzameling → Google Sheets

**Trigger:**
- **App:** Schedule by Zapier
- **Event:** Every Day
- **Time:** 09:00 (Nederlandse tijd)

**Action 1:** Webhook by Zapier
- **Event:** POST
- **URL:** `https://jouw-webhook-url.com/daily-news-collection`
- **Method:** POST
- **Headers:** `Content-Type: application/json`

**Action 2:** Google Sheets
- **Event:** Create Multiple Spreadsheet Rows
- **Spreadsheet:** Maak nieuwe sheet "Nederlandse Recruitment Artikelen"
- **Worksheet:** Sheet1
- **Data mapping:**
  ```
  Datum: {{topArticles__date}}
  Titel: {{topArticles__title}}
  Bron: {{topArticles__source}}
  Categorie: {{topArticles__category}}
  Score: {{topArticles__score}}
  URL: {{topArticles__url}}
  Beschrijving: {{topArticles__description}}
  ```

**Action 3 (Optioneel):** Slack/Teams Notificatie
- **Event:** Send Channel Message
- **Message:** 
  ```
  📊 Nederlandse Recruitment Intelligence Update
  
  Vandaag {{articlesCollected}} nieuwe artikelen verzameld!
  
  🏆 Top artikel: {{topArticles__0__title}} ({{topArticles__0__score}}/100)
  📰 Van: {{topArticles__0__source}}
  
  📈 Categorieën actief: {{categories}}
  🔗 Google Sheets bijgewerkt
  ```

### ZAP 2: Google Sheets Upload met Scoring

**Trigger:**
- **App:** Schedule by Zapier  
- **Event:** Every Day
- **Time:** 09:30 (Na nieuws verzameling)

**Action 1:** Webhook by Zapier
- **Event:** POST
- **URL:** `https://jouw-webhook-url.com/upload-to-sheets`

**Action 2:** Email by Zapier (Dagelijkse Samenvatting)
- **To:** jouw-email@domein.nl
- **Subject:** `📊 Dagelijkse Recruitment Intelligence - {{timestamp}}`
- **Body:**
  ```
  Hallo!
  
  Hier is je dagelijkse Nederlandse recruitment intelligence update:
  
  📊 STATISTIEKEN:
  • Artikelen verwerkt: {{articlesProcessed}}
  • Gemiddelde score: {{stats__averageScore}}/100
  • Hoogste score: {{stats__topScore}}/100
  
  🏆 TOP 3 ARTIKELEN:
  1. {{topArticles__0__title}} ({{topArticles__0__score}} pts)
     Bron: {{topArticles__0__source}}
  
  2. {{topArticles__1__title}} ({{topArticles__1__score}} pts)
     Bron: {{topArticles__1__source}}
  
  3. {{topArticles__2__title}} ({{topArticles__2__score}} pts)  
     Bron: {{topArticles__2__source}}
  
  📈 Top categorie vandaag: {{stats__topCategory}}
  📰 Meest actieve bron: {{stats__topSource}}
  
  De volledige data staat in Google Sheets!
  
  Groeten,
  Je Recruitment Intelligence Bot 🤖
  ```

### ZAP 3: Wekelijkse LinkedIn Content Creatie

**Trigger:**
- **App:** Schedule by Zapier
- **Event:** Every Week  
- **Day:** Sunday
- **Time:** 10:00

**Action 1:** Webhook by Zapier
- **Event:** POST
- **URL:** `https://jouw-webhook-url.com/weekly-content-creation`

**Action 2:** LinkedIn (Premium feature)
- **Event:** Create Post
- **Post:** `{{linkedinContent__weeklyRoundup__content}}`

**Action 3:** Gmail (Content Backup)
- **To:** jouw-email@domein.nl
- **Subject:** `📝 Wekelijkse LinkedIn Content Klaar`
- **Body:**
  ```
  📝 WEKELIJKSE LINKEDIN CONTENT
  
  Gebaseerd op {{weeklyAnalysis__totalArticles}} artikelen deze week
  Gemiddelde relevantie: {{weeklyAnalysis__avgScore}}/100
  
  ===== WEEKLY ROUNDUP POST =====
  {{linkedinContent__weeklyRoundup__content}}
  
  ===== INSIGHT POST =====  
  {{linkedinContent__insightPost__content}}
  
  ===== TREND ANALYSIS =====
  {{linkedinContent__trendAnalysis__content}}
  
  ===== LONG FORM ARTICLE =====
  {{linkedinContent__longFormArticle__content}}
  
  🎯 TRENDING ONDERWERPEN:
  {{#weeklyAnalysis__topTrends}}
  • {{keyword}}: {{mentions}} keer genoemd
  {{/weeklyAnalysis__topTrends}}
  ```

### ZAP 4: High-Score Artikel Alert

**Trigger:**
- **App:** Webhooks by Zapier
- **Event:** Catch Hook
- **URL:** `https://jouw-webhook-url.com/get-top-articles`
- **Schedule:** Every 6 hours

**Filter:**
- **Field:** topScore
- **Condition:** Greater than
- **Value:** 90

**Action:** Slack/Teams
- **Message:**
  ```
  🚨 HIGH-SCORE RECRUITMENT ARTIKEL GEVONDEN!
  
  📰 {{topArticles__0__title}}
  🏆 Score: {{topArticles__0__score}}/100
  📊 Bron: {{topArticles__0__source}}
  🏷️ Categorie: {{topArticles__0__category}}
  
  Dit artikel scoort exceptioneel hoog - bekijk direct!
  🔗 {{topArticles__0__url}}
  ```

## 🎨 Geavanceerde Zapier Flows

### Multi-Path Zap: Content Verdeling

**Trigger:** Wekelijkse Content Webhook

**Path A:** LinkedIn Business Post
- **Condition:** wordCount > 500
- **Action:** LinkedIn long-form artikel

**Path B:** LinkedIn Quick Post  
- **Condition:** wordCount <= 500
- **Action:** LinkedIn standaard post

**Path C:** Newsletter Content
- **Condition:** Always true
- **Action:** Mailchimp campaign draft

### Conditional Logic: Trending Topics

**Trigger:** Dagelijkse Upload Webhook

**Path A:** AI Trend Detected
- **Condition:** stats__topCategory contains "AI"
- **Action:** Special AI newsletter + LinkedIn post

**Path B:** Arbeidsmarkt Alert
- **Condition:** stats__topCategory contains "Arbeidsmarkt"  
- **Action:** Urgent market update + team notification

## 📊 Google Sheets Template

Maak een Google Sheet met deze kolommen:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Datum | Titel | Bron | Categorie | Score | URL | Beschrijving | Keywords |

**Formattering:**
- Score kolom: Conditional formatting (Rood <50, Oranje 50-75, Groen >75)
- Datum kolom: Date format DD-MM-YYYY
- Freeze eerste rij voor headers

**Formulas:**
```
=AVERAGE(E:E)  // Gemiddelde score
=MAX(E:E)      // Hoogste score
=COUNTIF(D:D,"AI*")  // AI artikelen tellen
```

## 🔧 Troubleshooting

### Webhook Server Problemen
```bash
# Test webhook endpoints
curl -X POST https://jouw-webhook-url.com/test
curl -X GET https://jouw-webhook-url.com/status
```

### Zapier Debugging
1. Check Zap History voor error logs  
2. Test individuele steps
3. Gebruik Zapier formatter voor data transformatie
4. Check webhook response in Task History

### Veel Voorkomende Fixes
- **Timeout errors:** Verhoog Zapier timeout naar 30 seconden
- **Rate limits:** Voeg delays toe tussen actions
- **Data formatting:** Gebruik Zapier Formatter steps
- **Authentication:** Check API keys en permissions

## 🚀 Go-Live Checklist

- [ ] Webhook server draait stabiel op productie URL
- [ ] Google Sheets template aangemaakt  
- [ ] Alle Zapier Zaps getest en geactiveerd
- [ ] Email notifications geconfigureerd
- [ ] LinkedIn posting permissions ingesteld
- [ ] Monitoring alerts actief
- [ ] Backup strategie gedefinieerd

## 📈 Monitoring & Onderhoud

### Dagelijks
- [ ] Check Zapier task history voor errors
- [ ] Verifieer Google Sheets updates
- [ ] Review artikel scores en trends

### Wekelijks  
- [ ] Controleer LinkedIn content kwaliteit
- [ ] Analyseer trending topics
- [ ] Update webhook server indien nodig

### Maandelijks
- [ ] Review Zapier usage limits
- [ ] Optimaliseer Zap performance  
- [ ] Backup belangrijke data
- [ ] Update documentatie

## 💡 Tips & Best Practices

1. **Error Handling:** Gebruik Zapier paths voor fallback acties
2. **Data Quality:** Valideer webhook responses met filters  
3. **Performance:** Batch multiple actions waar mogelijk
4. **Security:** Gebruik webhook secrets voor authentication
5. **Monitoring:** Set up email alerts voor kritieke failures

## 🆘 Support

Voor vragen over deze setup:
1. Check Zapier documentatie
2. Test webhook endpoints lokaal  
3. Review server logs voor errors
4. Contact Zapier support voor platform issues

---

*Met deze setup heb je een volledig geautomatiseerde Nederlandse recruitment intelligence pipeline! 🇳🇱🤖*