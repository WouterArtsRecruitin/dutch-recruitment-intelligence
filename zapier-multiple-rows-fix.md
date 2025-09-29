# Zapier Multiple Rows - Correcte Configuratie

## ❗ BELANGRIJKE CORRECTIE

**Stap 2 in je Zapier Google Sheets action:**

### ✅ JUISTE configuratie voor Multiple Rows:

**1. Action Type:**
- Select: **"Create Multiple Spreadsheet Rows"** (niet "Create Spreadsheet Row")

**2. Spreadsheet & Worksheet:**
- Spreadsheet: Je Google Sheet URL/ID
- Worksheet: **Sheet1**

**3. ⚠️ KRITIEKE STAP - Line Items:**
- **Line Item Source:** `{{2.articles}}`
- **NOT:** `{{2.articles.0}}` of individuele fields

**4. Column Mapping:**
```
Column A (Datum): {{2.articles datum}}
Column B (Tijd): {{2.articles tijd}}  
Column C (Artikel_Titel): {{2.articles artikel_titel}}
Column D (Artikel_Beschrijving): {{2.articles artikel_beschrijving}}
Column E (Nieuwsbron): {{2.articles nieuwsbron}}
Column F (Nieuws_Categorie): {{2.articles nieuws_categorie}}
Column G (Artikel_URL): {{2.articles artikel_url}}
Column H (Publicatie_Datum): {{2.articles publicatie_datum}}
Column I (Relevantie_Score): {{2.articles relevantie_score}}
Column J (Market_Insights): {{2.articles market_insights}}
Column K (Artikelen_Verzameld): {{2.articles artikelen_verzameld}}
Column L (Nederlandse_Bronnen): {{2.articles nederlandse_bronnen}}
Column M (Nieuws_Categorieën): {{2.articles nieuws_categorieën}}
Column N (Collectie_Status): {{2.articles collectie_status}}
```

## 🔥 VEELGEMAAKTE FOUT:

**❌ FOUT:**
```
Line Item: {{2.articles.0}}  // Dit geeft maar 1 rij
Column mapping: {{2.title}}   // Dit werkt niet
```

**✅ CORRECT:**
```
Line Item: {{2.articles}}     // Dit geeft ALLE 18 rijen
Column mapping: {{2.articles datum}}  // Dit mapt elk artikel
```

## 🧪 TEST STAPPEN:

1. **Test webhook step** → Moet 18 artikelen tonen in `articles` array
2. **In Line Items** → Selecteer `{{2.articles}}`
3. **Test Google Sheets step** → Moet 18 rijen aanmaken
4. **Check je sheet** → 18 nieuwe rijen met verschillende artikelen

## 🎯 VERWACHT RESULTAAT:

Na test zie je in je Google Sheet:
- Rij 1: AI in recruitment (score 95)
- Rij 2: ChatGPT transformeert (score 92)  
- Rij 3: IT talent tekort (score 90)
- ...
- Rij 18: HR tech integratie (score 58)

**18 verschillende artikelen, niet 18x hetzelfde artikel!**

## 🔧 ALS HET NIET WERKT:

1. **Check webhook response** → Moet `articles` array bevatten
2. **Line Items selection** → Moet exact `{{2.articles}}` zijn
3. **Column mapping** → Elke kolom `{{2.articles [field_name]}}`
4. **Test step by step** → Eerst webhook, dan sheets

Is dit wat je bedoelde met de query in stap 2? 🤔