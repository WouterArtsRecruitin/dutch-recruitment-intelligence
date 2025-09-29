# Google Sheets Setup - Dutch Recruitment Intelligence

## Stap 1: Nieuwe Google Sheet Aanmaken

1. **Ga naar Google Sheets:** https://sheets.google.com
2. **Klik:** "Blank spreadsheet" of "Lege spreadsheet"
3. **Naam de sheet:** "Dutch Recruitment Intelligence - Nieuwsartikelen"

## Stap 2: Kolommen Instellen

**Voeg deze kolomnamen toe in rij 1 (A1 t/m N1):**

| Kolom | Naam | Beschrijving |
|-------|------|-------------|
| A | **Datum** | Verzameldatum artikelen (YYYY-MM-DD) |
| B | **Tijd** | Verzameltijd (HH:MM:SS) |
| C | **Artikel_Titel** | Nederlandse recruitment nieuws titel |
| D | **Artikel_Beschrijving** | Samenvatting van het nieuws |
| E | **Nieuwsbron** | Dutch recruitment website (Werf&, Intelligence Group, etc.) |
| F | **Nieuws_Categorie** | Type recruitment nieuws (AI, arbeidsmarkt, salaris, etc.) |
| G | **Artikel_URL** | Link naar volledig nieuws artikel |
| H | **Publicatie_Datum** | Originale publicatie datum artikel |
| I | **Relevantie_Score** | Dutch recruitment relevantie (0-100) |
| J | **Market_Insights** | Nederlandse arbeidsmarkt trends |
| K | **Artikelen_Verzameld** | Totaal aantal Nederlandse artikelen |
| L | **Nederlandse_Bronnen** | Aantal Dutch recruitment websites |
| M | **Nieuws_Categorieën** | Aantal verschillende onderwerpen |
| N | **Collectie_Status** | Status Nederlandse nieuws verzameling |

## Stap 3: Opmaak Toepassen

### Koprij Opmaak (Rij 1):
- **Achtergrond:** Donkerblauw (#1f4788)
- **Tekst:** Wit
- **Vetgedrukt:** Ja
- **Tekstuitlijning:** Gecentreerd

### Kolom Breedte:
- **Kolom A (Datum):** 120px
- **Kolom B (Tijd):** 100px  
- **Kolom C (Artikel_Titel):** 350px (Nederlandse titels kunnen lang zijn)
- **Kolom D (Artikel_Beschrijving):** 450px
- **Kolom E (Nieuwsbron):** 180px (Intelligence Group, Werf&, etc.)
- **Kolom F (Nieuws_Categorie):** 200px
- **Kolom G (Artikel_URL):** 300px
- **Kolom H-N:** 140px elk

### Data Validatie:
- **Relevantie_Score kolom (I):** Getallen tussen 0-100 (Dutch recruitment relevantie)
- **Datum kolommen (A,H):** Nederlandse datum formaat (DD-MM-YYYY)
- **Artikel_URL kolom (G):** Nederlandse recruitment website URLs
- **Nieuwsbron kolom (E):** Dropdown: Werf&, Intelligence Group, RecruitmentTech.nl, Personnel & Winst, HRkrant, Recruitment Matters, Recruiters Connected, Recruiters United

## Stap 4: Test Data Invoeren

**Gebruik de voorbeelddata uit `google-sheets-template.csv`** om te testen of alles correct werkt.

## Stap 5: Sheet ID Ophalen

1. **Open je sheet**
2. **Kopieer URL:** bijv. `https://docs.google.com/spreadsheets/d/1ABC123XYZ789/edit`
3. **Sheet ID:** Het deel tussen `/d/` en `/edit` (bijv. `1ABC123XYZ789`)
4. **Bewaar dit ID** - je hebt het nodig voor Zapier

## Stap 6: Delen en Permissies

### Voor Zapier toegang:
1. **Klik "Delen"** (rechtsboven)
2. **Algemene toegang:** "Iedereen met de link"
3. **Permissie:** "Editor" (zodat Zapier kan schrijven)
4. **Kopieer de share URL**

### Voor eigen gebruik:
- Zorg dat je Google account toegang heeft
- Bewaar de sheet in een logische Google Drive map

## Stap 7: Zapier Configuratie

**In je Zapier flow gebruik deze instellingen:**

```
Spreadsheet ID: [JE_SHEET_ID]
Worksheet: Sheet1
Drive: My Drive

Column Mapping voor Dutch Recruitment Intelligence:
- Column A: {{1.timestamp}} (datum: 29-09-2025)
- Column B: {{1.timestamp}} (tijd: 05:42:19)  
- Column C: {{1.topArticles.0.title}} (Nederlandse recruitment titel)
- Column D: {{1.topArticles.0.description}} (artikel samenvatting)
- Column E: {{1.topArticles.0.source}} (Werf&, Intelligence Group, etc.)
- Column F: {{1.topArticles.0.category}} (ai_recruitment_trends, arbeidsmarkt, etc.)
- Column G: {{1.topArticles.0.url}} (link naar Nederlands artikel)
- Column H: {{1.topArticles.0.publishDate}} (publicatie datum)
- Column I: {{1.topArticles.0.score}} (relevantie score 0-100)
- Column J: {{1.insights}} (Nederlandse arbeidsmarkt trends)
- Column K: {{1.articlesCollected}} (aantal Nederlandse artikelen)
- Column L: {{1.totalSources}} (aantal Dutch recruitment websites)
- Column M: {{1.totalCategories}} (aantal nieuws onderwerpen)
- Column N: {{1.triggerData.hasNewContent}} (nieuwe content beschikbaar)
```

## Stap 8: Monitoring & Rapportage

### Dutch Recruitment Intelligence Grafieken:
- **Relevantie Score Trends:** Ontwikkeling Nederlandse recruitment relevantie over tijd
- **Nieuwsbron Distributie:** Werf& vs Intelligence Group vs andere Dutch websites
- **Nieuws Categorie Verdeling:** AI trends vs arbeidsmarkt vs salaris nieuws
- **Dashboard tab:** Nederlandse recruitment market overzicht

### Nederlandse Recruitment Filters:
- **Hoge Relevantie:** Score >85 voor belangrijke Dutch recruitment trends
- **Datum filter:** Laatste 7/30 dagen Nederlandse artikelen
- **Nieuwsbron filter:** Per Dutch recruitment website (Werf&, Intelligence Group, etc.)
- **Categorie filter:** AI recruitment, arbeidsmarkt trends, salaris ontwikkelingen

### Conditionele Opmaak voor Dutch Recruitment:
- **Score >90:** Donkergroen (zeer relevante Nederlandse recruitment trends)
- **Score 75-89:** Groen (relevante Dutch market insights) 
- **Score 60-74:** Oranje (interessante recruitment ontwikkelingen)
- **Score <60:** Lichtgrijs (minder relevante artikelen)

## Troubleshooting

**Zapier kan niet schrijven:** Check share permissies (Editor rechten)
**Kolommen kloppen niet:** Controleer column mapping in Zapier
**Geen data:** Test webhook endpoints eerst handmatig

Je Google Sheet is nu klaar voor automatische Dutch Recruitment Intelligence data! 🚀