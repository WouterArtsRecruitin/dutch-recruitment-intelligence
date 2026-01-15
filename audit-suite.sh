#!/bin/bash
#
# Dutch Recruitment Intelligence - Audit Suite
# LinkedIn Intelligence Hub & Newsletter Automation Flow Audit
#
# Usage: ./audit-suite.sh [command]
# Commands: full, endpoints, data, content, security, report
#

set -e

# Kleuren voor output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuratie
AUDIT_DIR="./audit-reports"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_FILE="${AUDIT_DIR}/audit-report-${TIMESTAMP}.md"
SERVER_URL="${WEBHOOK_BASE_URL:-http://localhost:3000}"

# Maak audit directory
mkdir -p "${AUDIT_DIR}"

# Header functie
print_header() {
    echo -e "\n${PURPLE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}  $1${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}\n"
}

print_section() {
    echo -e "\n${CYAN}─── $1 ───${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Audit functies
audit_file_structure() {
    print_section "File Structure Audit"

    local REQUIRED_FILES=(
        "zapier-webhook-server.cjs"
        "linkedin-content-creator.cjs"
        "dutch-recruitment-news-scraper.cjs"
        "google-sheets-uploader.cjs"
        "complete-automation-flow.cjs"
        "package.json"
    )

    local REQUIRED_DIRS=(
        "data"
        "content"
        "reports"
    )

    echo "Checking required files..."
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "$file" ]; then
            print_success "$file exists"
        else
            print_error "$file MISSING"
        fi
    done

    echo ""
    echo "Checking required directories..."
    for dir in "${REQUIRED_DIRS[@]}"; do
        if [ -d "$dir" ]; then
            print_success "$dir/ exists"
        else
            print_warning "$dir/ missing - creating..."
            mkdir -p "$dir"
        fi
    done
}

audit_endpoints() {
    print_section "Webhook Endpoints Audit"

    local ENDPOINTS=(
        "/status:GET"
        "/test:GET"
        "/reports:GET"
        "/daily-news-collection:POST"
        "/upload-to-sheets:POST"
        "/weekly-content-creation:POST"
        "/get-top-articles:GET"
    )

    echo "Testing endpoints against: $SERVER_URL"
    echo ""

    for endpoint_method in "${ENDPOINTS[@]}"; do
        IFS=':' read -r endpoint method <<< "$endpoint_method"

        if [ "$method" == "GET" ]; then
            response=$(curl -s -o /dev/null -w "%{http_code}" "${SERVER_URL}${endpoint}" 2>/dev/null || echo "000")
        else
            response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${SERVER_URL}${endpoint}" -H "Content-Type: application/json" 2>/dev/null || echo "000")
        fi

        if [ "$response" == "200" ]; then
            print_success "$method $endpoint - HTTP $response"
        elif [ "$response" == "000" ]; then
            print_warning "$method $endpoint - Server not reachable"
        else
            print_error "$method $endpoint - HTTP $response"
        fi
    done
}

audit_data_integrity() {
    print_section "Data Integrity Audit"

    # Check data files
    echo "Checking data files..."

    if [ -f "data/latest-dutch-news.json" ]; then
        local article_count=$(cat data/latest-dutch-news.json | grep -o '"title"' | wc -l)
        print_success "latest-dutch-news.json - $article_count articles"
    else
        print_warning "latest-dutch-news.json not found"
    fi

    if [ -f "data/weekly-top-articles.json" ]; then
        local days_count=$(cat data/weekly-top-articles.json | grep -o '"date"' | wc -l)
        print_success "weekly-top-articles.json - $days_count days of data"
    else
        print_warning "weekly-top-articles.json not found"
    fi

    # Check backup files
    local backup_count=$(ls -1 data/sheets-backup-*.json 2>/dev/null | wc -l)
    if [ "$backup_count" -gt 0 ]; then
        print_success "Sheets backups: $backup_count files"
    else
        print_info "No sheets backup files found"
    fi
}

audit_linkedin_content() {
    print_section "LinkedIn Content Audit"

    echo "Checking content directory..."

    if [ -d "content" ]; then
        local content_files=$(ls -1 content/*.md 2>/dev/null | wc -l)
        local metadata_files=$(ls -1 content/*-metadata.json 2>/dev/null | wc -l)

        print_success "Markdown content files: $content_files"
        print_success "Metadata files: $metadata_files"

        # Check latest content
        local latest_content=$(ls -t content/week-*.md 2>/dev/null | head -1)
        if [ -n "$latest_content" ]; then
            local word_count=$(wc -w < "$latest_content")
            print_info "Latest content: $latest_content ($word_count words)"
        fi
    else
        print_warning "Content directory not found"
    fi

    # Check content types
    echo ""
    echo "Content types generated:"
    for type in weeklyRoundup insightPost trendAnalysis longFormArticle; do
        local type_count=$(ls -1 content/*-${type}.md 2>/dev/null | wc -l)
        if [ "$type_count" -gt 0 ]; then
            print_success "$type: $type_count files"
        else
            print_info "$type: no files yet"
        fi
    done
}

audit_automation_flow() {
    print_section "Automation Flow Audit"

    echo "Checking automation components..."

    # News Scraper
    if grep -q "scrapeAllDutchSources" dutch-recruitment-news-scraper.cjs 2>/dev/null; then
        print_success "News scraper: scrapeAllDutchSources() present"
    else
        print_error "News scraper: scrapeAllDutchSources() missing"
    fi

    # Google Sheets Uploader
    if grep -q "runDailyUpload" google-sheets-uploader.cjs 2>/dev/null; then
        print_success "Sheets uploader: runDailyUpload() present"
    else
        print_error "Sheets uploader: runDailyUpload() missing"
    fi

    # LinkedIn Content Creator
    if grep -q "runWeeklyContentCreation" linkedin-content-creator.cjs 2>/dev/null; then
        print_success "Content creator: runWeeklyContentCreation() present"
    else
        print_error "Content creator: runWeeklyContentCreation() missing"
    fi

    # Check content templates
    echo ""
    echo "Checking content templates..."
    local templates=("weeklyRoundup" "insightPost" "trendAnalysis" "article")
    for template in "${templates[@]}"; do
        if grep -q "$template" linkedin-content-creator.cjs 2>/dev/null; then
            print_success "Template: $template configured"
        else
            print_warning "Template: $template not found"
        fi
    done
}

audit_security() {
    print_section "Security Audit"

    echo "Checking security configurations..."

    # Check for secrets in code
    if grep -rE "(api_key|secret|password|token).*=.*['\"][^'\"]{10,}['\"]" *.cjs 2>/dev/null | grep -v "example\|sample\|test" > /dev/null; then
        print_warning "Possible hardcoded secrets found"
    else
        print_success "No obvious hardcoded secrets in .cjs files"
    fi

    # Check .env file
    if [ -f ".env" ]; then
        print_success ".env file exists"
        if grep -q "WEBHOOK_SECRET" .env 2>/dev/null; then
            print_success "WEBHOOK_SECRET configured"
        else
            print_warning "WEBHOOK_SECRET not found in .env"
        fi
    else
        print_warning ".env file not found"
    fi

    # Check .gitignore
    if [ -f ".gitignore" ]; then
        if grep -q "\.env" .gitignore 2>/dev/null; then
            print_success ".env is in .gitignore"
        else
            print_warning ".env not in .gitignore - SECURITY RISK"
        fi
    else
        print_warning ".gitignore not found"
    fi

    # Check CORS settings
    if grep -q "Access-Control-Allow-Origin.*\*" zapier-webhook-server.cjs 2>/dev/null; then
        print_warning "CORS allows all origins (*) - consider restricting in production"
    fi
}

audit_dependencies() {
    print_section "Dependencies Audit"

    echo "Checking Node.js environment..."

    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        print_success "Node.js: $node_version"

        # Check minimum version
        local min_version="16.0.0"
        if [ "$(printf '%s\n' "$min_version" "$node_version" | sort -V | head -n1)" = "v$min_version" ] || [ "$node_version" = "v$min_version" ]; then
            print_success "Node.js version meets minimum requirement (>=16.0.0)"
        else
            print_warning "Node.js version below recommended minimum"
        fi
    else
        print_error "Node.js not found"
    fi

    if [ -f "package.json" ]; then
        print_success "package.json exists"

        # Check dependencies
        if [ -d "node_modules" ]; then
            local dep_count=$(ls -1 node_modules 2>/dev/null | wc -l)
            print_success "node_modules: $dep_count packages installed"
        else
            print_warning "node_modules not found - run 'npm install'"
        fi
    else
        print_error "package.json not found"
    fi
}

audit_reports() {
    print_section "Reports Audit"

    echo "Checking reports directory..."

    if [ -d "reports" ]; then
        local html_count=$(ls -1 reports/*.html 2>/dev/null | wc -l)
        local csv_count=$(ls -1 reports/*.csv 2>/dev/null | wc -l)
        local json_count=$(ls -1 reports/*.json 2>/dev/null | wc -l)

        print_success "HTML reports: $html_count"
        print_success "CSV exports: $csv_count"
        print_success "JSON files: $json_count"

        # Latest report
        local latest_html=$(ls -t reports/*.html 2>/dev/null | head -1)
        if [ -n "$latest_html" ]; then
            local file_date=$(stat -c %y "$latest_html" 2>/dev/null | cut -d' ' -f1)
            print_info "Latest HTML report: $latest_html ($file_date)"
        fi
    else
        print_warning "Reports directory not found"
    fi
}

generate_audit_report() {
    print_section "Generating Audit Report"

    cat > "$REPORT_FILE" << EOF
# Dutch Recruitment Intelligence - Audit Report

**Generated:** $(date "+%Y-%m-%d %H:%M:%S")
**Server:** $SERVER_URL

## Executive Summary

This audit evaluates the LinkedIn Intelligence Hub and Newsletter Automation Flow.

## File Structure

| Component | Status |
|-----------|--------|
EOF

    # Add file checks to report
    for file in zapier-webhook-server.cjs linkedin-content-creator.cjs dutch-recruitment-news-scraper.cjs google-sheets-uploader.cjs; do
        if [ -f "$file" ]; then
            echo "| $file | ✓ Present |" >> "$REPORT_FILE"
        else
            echo "| $file | ✗ Missing |" >> "$REPORT_FILE"
        fi
    done

    cat >> "$REPORT_FILE" << EOF

## Endpoint Status

| Endpoint | Method | Status |
|----------|--------|--------|
EOF

    # Test endpoints and add to report
    for endpoint in "/status" "/test" "/reports" "/daily-news-collection" "/upload-to-sheets" "/weekly-content-creation" "/get-top-articles"; do
        if [[ "$endpoint" == "/daily-news-collection" || "$endpoint" == "/upload-to-sheets" || "$endpoint" == "/weekly-content-creation" ]]; then
            method="POST"
            response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${SERVER_URL}${endpoint}" -H "Content-Type: application/json" 2>/dev/null || echo "N/A")
        else
            method="GET"
            response=$(curl -s -o /dev/null -w "%{http_code}" "${SERVER_URL}${endpoint}" 2>/dev/null || echo "N/A")
        fi
        echo "| $endpoint | $method | $response |" >> "$REPORT_FILE"
    done

    cat >> "$REPORT_FILE" << EOF

## LinkedIn Content Generation

### Content Types
- Weekly Roundup Post (Social media friendly)
- Insight Post (Single trend focus)
- Trend Analysis Post (Data-driven)
- Long-form Article (Comprehensive)

### Content Templates
- Hashtags configured for each content type
- Dutch language focus
- Recruitment-specific terminology

## Automation Flow

### Daily Flow (09:00 Amsterdam)
1. \`/daily-news-collection\` - Scrape 8 Dutch sources
2. \`/upload-to-sheets\` - Score and upload to Google Sheets
3. HTML report generation
4. Email notification

### Weekly Flow (Sunday 10:00)
1. \`/weekly-content-creation\` - Analyze top articles
2. Generate 4 LinkedIn content formats
3. Save markdown files
4. Email with content options
5. **Manual LinkedIn posting** (human control)

## Security Assessment

| Check | Result |
|-------|--------|
EOF

    # Security checks
    if grep -rE "(api_key|secret|password|token).*=.*['\"][^'\"]{10,}['\"]" *.cjs 2>/dev/null | grep -v "example\|sample\|test" > /dev/null; then
        echo "| Hardcoded secrets | ⚠ Warning |" >> "$REPORT_FILE"
    else
        echo "| Hardcoded secrets | ✓ None found |" >> "$REPORT_FILE"
    fi

    if [ -f ".env" ]; then
        echo "| .env file | ✓ Present |" >> "$REPORT_FILE"
    else
        echo "| .env file | ✗ Missing |" >> "$REPORT_FILE"
    fi

    if grep -q "Access-Control-Allow-Origin.*\*" zapier-webhook-server.cjs 2>/dev/null; then
        echo "| CORS | ⚠ Open (*) |" >> "$REPORT_FILE"
    else
        echo "| CORS | ✓ Restricted |" >> "$REPORT_FILE"
    fi

    cat >> "$REPORT_FILE" << EOF

## Data Sources

The system monitors 8 Dutch recruitment sources:
1. Werf& (werf-en.nl)
2. Intelligence Group (intelligence-group.nl)
3. RecruitmentTech.nl
4. Personnel & Winst (pwnet.nl)
5. HRkrant (hrkrant.nl)
6. Recruiters Connected
7. Recruiters United
8. Recruitment Matters

## Scoring Algorithm

Articles are scored 0-100 based on:
- **Keywords**: AI (10), automation (8), arbeidsmarkt (9), tekort (9), salaris (7)
- **Source reputation**: Intelligence Group (9), Werf& (8), RecruitmentTech (8)
- **Category importance**: AI & Tech (10), Arbeidsmarkt (9)
- **Content quality bonus**: +3 for >100 chars
- **Recency bonus**: +5 for today's articles

## Recommendations

1. Consider restricting CORS in production
2. Ensure .env is properly secured
3. Regular backup of data directory
4. Monitor endpoint response times
5. Review weekly content before manual posting

---
*Report generated by audit-suite.sh*
EOF

    print_success "Audit report saved to: $REPORT_FILE"
}

# Volledige audit
full_audit() {
    print_header "DUTCH RECRUITMENT INTELLIGENCE - FULL AUDIT"
    echo "LinkedIn Intelligence Hub & Newsletter Automation Flow"
    echo "Timestamp: $(date)"

    audit_file_structure
    audit_dependencies
    audit_data_integrity
    audit_linkedin_content
    audit_automation_flow
    audit_security
    audit_reports
    audit_endpoints
    generate_audit_report

    print_header "AUDIT COMPLETE"
    echo -e "Report saved to: ${GREEN}$REPORT_FILE${NC}"
}

# Help functie
show_help() {
    echo "Dutch Recruitment Intelligence - Audit Suite"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  full        Run complete audit (default)"
    echo "  endpoints   Test all webhook endpoints"
    echo "  data        Check data integrity"
    echo "  content     Audit LinkedIn content generation"
    echo "  security    Run security checks"
    echo "  flow        Audit automation flow"
    echo "  deps        Check dependencies"
    echo "  report      Generate audit report only"
    echo "  help        Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  WEBHOOK_BASE_URL  Server URL (default: http://localhost:3000)"
    echo ""
    echo "Examples:"
    echo "  $0 full"
    echo "  WEBHOOK_BASE_URL=https://myserver.com $0 endpoints"
}

# Main
case "${1:-full}" in
    full)
        full_audit
        ;;
    endpoints)
        print_header "ENDPOINTS AUDIT"
        audit_endpoints
        ;;
    data)
        print_header "DATA INTEGRITY AUDIT"
        audit_data_integrity
        ;;
    content)
        print_header "LINKEDIN CONTENT AUDIT"
        audit_linkedin_content
        ;;
    security)
        print_header "SECURITY AUDIT"
        audit_security
        ;;
    flow)
        print_header "AUTOMATION FLOW AUDIT"
        audit_automation_flow
        ;;
    deps)
        print_header "DEPENDENCIES AUDIT"
        audit_dependencies
        ;;
    report)
        print_header "GENERATING REPORT"
        generate_audit_report
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
