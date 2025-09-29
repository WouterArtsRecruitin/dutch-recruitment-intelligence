# Zapier Copilot Prompt - Dutch Recruitment Intelligence

Copy-paste deze prompt in Zapier Copilot om je Zap te fixen:

---

**ZAPIER COPILOT PROMPT:**

```
Fix my Dutch Recruitment Intelligence Zap that uploads daily articles to Google Sheets.

CURRENT PROBLEM:
- My webhook returns new data but Google Sheets still shows old test data
- Webhook URL: https://dutch-recruitment-intelligence.onrender.com/upload-to-sheets
- Google Sheet ID: 15SU_5yZe39-iVbu0ZQaDXuj_GGJv9PgCa-v2Ma8CLas

ZAP CONFIGURATION:
1. Trigger: Schedule - Every day at 09:30 Amsterdam time
2. Action 1: Webhook POST to https://dutch-recruitment-intelligence.onrender.com/upload-to-sheets
3. Action 2: Google Sheets - Create new row with these field mappings:
   - Column A (Datum): {{webhook.date}}
   - Column B (Tijd): {{webhook.time}}
   - Column C (Artikel_Titel): {{webhook.title}}
   - Column D (Artikel_Beschrijving): {{webhook.description}}
   - Column E (Nieuwsbron): {{webhook.source}}
   - Column F (Nieuws_Categorie): {{webhook.category}}
   - Column G (Artikel_URL): {{webhook.url}}
   - Column H (Publicatie_Datum): {{webhook.publishDate}}
   - Column I (Relevantie_Score): {{webhook.score}}
   - Column J (Market_Insights): {{webhook.insights}}
   - Column K (Artikelen_Verzameld): {{webhook.articlesProcessed}}
   - Column L (Nederlandse_Bronnen): {{webhook.totalSources}}
   - Column M (Nieuws_Categorieën): {{webhook.totalCategories}}
   - Column N (Collectie_Status): {{webhook.hasNewContent}}

4. Action 3: Send email to warts@recruitin.nl with subject {{webhook.emailSubject}} and body {{webhook.emailMessage}}

WEBHOOK RESPONSE FORMAT:
The webhook returns flat JSON fields like:
- title: "IT talent tekort bereikt recordhoogte in Nederland 2025"
- description: "Het tekort aan gekwalificeerde IT-professionals..."
- source: "Werf&"
- category: "it_talent_shortage"
- score: 88
- date: "29-9-2025"
- time: "09:30:15"

REQUIREMENTS:
- Test webhook step first to get fresh data
- Map webhook fields correctly to Google Sheets columns
- Ensure Zap is ON/Published
- Test complete workflow end-to-end
- Email should contain Dutch recruitment statistics

Please help me configure this Zap correctly so it gets fresh Dutch recruitment articles daily instead of test data.
```

---

**EXTRA INSTRUCTIES:**
1. **Kopieer deze hele prompt** naar Zapier Copilot
2. **Laat Copilot de Zap analyseren** en configureren  
3. **Test elke step** die Copilot aanpast
4. **Publish de Zap** als alles werkt

Copilot zal automatisch de webhook testen, fields mappen en je Zap repareren! 🤖