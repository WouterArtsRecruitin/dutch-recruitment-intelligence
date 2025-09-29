# 🚀 Claude Code MCP Tools - Usage Guide

## ⚡ Quick Start Commands

### 🔍 Competitor Intelligence
```bash
# Quick competitor scan + report
node run-tools.cjs competitors

# Full competitor analysis
node claude-code-tools.cjs scan-competitors
```

### 💰 Salary Benchmarking  
```bash
# Quick salary check
node run-tools.cjs salary "Software Engineer" "Technology"

# Custom salary analysis
node claude-code-tools.cjs check-salary --role "Product Manager" --industry "Finance"
```

### 🎯 Job Market Research
```bash
# Quick job market scan
node run-tools.cjs jobs "DevOps Engineer"

# Generate vacancy template
node run-tools.cjs template "Data Scientist" "innovative"
```

### 📊 Database Status
```bash
# Check data storage status
node claude-code-tools.cjs status
```

### 🎪 Run All Tools (Complete Demo)
```bash
# Execute complete intelligence suite
node run-tools.cjs all
```

---

## 📋 Available Tools

| Tool | Command | Description |
|------|---------|-------------|
| **Competitor Scan** | `run-tools.cjs competitors` | Monitor concurrent activiteiten |
| **Salary Benchmark** | `run-tools.cjs salary [role] [industry]` | Verzamel salary data |
| **Job Market Scan** | `run-tools.cjs jobs [role]` | Analyseer job market trends |
| **Vacancy Template** | `run-tools.cjs template [role] [style]` | Genereer vacatureteksten |
| **Database Check** | `claude-code-tools.cjs status` | Check data storage |

---

## 💾 Data Storage

**Locatie:** `/Users/wouterarts/Downloads/local-mcp-apps/data/`

**Bestanden:**
- `competitor-intelligence-scan-latest.json` - Laatste concurrent data
- `salary-benchmark-collection-latest.json` - Laatste salary data  
- `vacature-research-market-scan-latest.json` - Laatste job market data

**Data wordt automatisch:**
- ✅ Lokaal opgeslagen (privacy-safe)
- ✅ Timestamped voor tracking
- ✅ Cross-tool beschikbaar
- ✅ Persistent tussen sessies

---

## 🎯 Use Cases voor Claude Code

### 1. **Daily Intelligence Briefing**
```bash
node run-tools.cjs competitors
```
*"Wat doen onze concurrenten vandaag?"*

### 2. **Salary Negotiation Prep**
```bash
node run-tools.cjs salary "Senior Developer" "Technology"
```
*"Wat moet ik bieden voor deze rol?"*

### 3. **Job Posting Optimization**
```bash
node run-tools.cjs jobs "Product Manager"
node run-tools.cjs template "Product Manager" "professional"
```
*"Hoe optimaliseer ik deze vacature?"*

### 4. **Market Research**
```bash
node run-tools.cjs all
```
*"Complete recruitment intelligence update"*

---

## 🔧 Advanced Usage

### Direct Tool Import
```javascript
const { ClaudeCodeTools } = require('./run-tools.cjs');

const tools = new ClaudeCodeTools();
const results = await tools.scanCompetitors({
  competitors: ['Time to Hire', 'Enhr'],
  focus_areas: ['hiring', 'funding']
});
```

### Custom Analysis
```javascript
const tools = new ClaudeCodeTools();

// Multi-role salary analysis
for (const role of ['Software Engineer', 'DevOps Engineer', 'Product Manager']) {
  await tools.collectSalaryData({ role, industry: 'Technology' });
}

// Generate comprehensive report
await tools.generateSalaryReport({ format: 'detailed' });
```

---

## ✅ What Works in Claude Code

🟢 **Direct Commands** - Alle bash commands werken direct  
🟢 **Data Storage** - Lokale JSON database volledig functioneel  
🟢 **Cross-Tool Integration** - Data sharing tussen tools  
🟢 **Persistent Sessions** - Data blijft tussen Claude Code sessies  
🟢 **Real-time Reports** - Immediate intelligence output  

---

## 🚀 Production Ready Features

- **🔒 Privacy-First:** Alle data lokaal opgeslagen
- **⚡ Fast Performance:** Direct Node.js execution  
- **📊 Professional Output:** Management-ready reports
- **🔄 Persistent Data:** Cross-session intelligence tracking
- **🎯 Strategic Insights:** Actionable recruitment intelligence

---

## 💡 Pro Tips

1. **Daily Routine:** Start elke dag met `node run-tools.cjs competitors`
2. **Salary Prep:** Voor elke recruitment meeting: `node run-tools.cjs salary [role] [industry]`
3. **Job Optimization:** Check job market eerst: `node run-tools.cjs jobs [role]`
4. **Template Generation:** Automatiseer vacatureteksten: `node run-tools.cjs template`
5. **Data Tracking:** Regelmatig `claude-code-tools.cjs status` voor database health

**Je recruitment intelligence advantage werkt nu direct in Claude Code!** 🎯