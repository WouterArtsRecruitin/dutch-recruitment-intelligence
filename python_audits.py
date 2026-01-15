#!/usr/bin/env python3
"""
Dutch Recruitment Intelligence - Python Audit Suite
LinkedIn Intelligence Hub & Newsletter Automation Flow Analysis

Features:
- Deep code analysis
- Data flow validation
- Content quality assessment
- Performance metrics
- Security scanning
- Automated reporting
"""

import os
import sys
import json
import re
import hashlib
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field, asdict
from collections import Counter
import urllib.request
import urllib.error

# Configuration
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
CONTENT_DIR = BASE_DIR / "content"
REPORTS_DIR = BASE_DIR / "reports"
AUDIT_DIR = BASE_DIR / "audit-reports"

SERVER_URL = os.environ.get("WEBHOOK_BASE_URL", "http://localhost:3000")


@dataclass
class AuditResult:
    """Single audit check result"""
    name: str
    status: str  # 'pass', 'warn', 'fail'
    message: str
    details: Optional[Dict] = None
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class AuditReport:
    """Complete audit report"""
    title: str
    timestamp: str
    summary: Dict
    file_audit: List[AuditResult]
    endpoint_audit: List[AuditResult]
    data_audit: List[AuditResult]
    content_audit: List[AuditResult]
    security_audit: List[AuditResult]
    code_audit: List[AuditResult]
    recommendations: List[str]

    def to_dict(self) -> Dict:
        return {
            'title': self.title,
            'timestamp': self.timestamp,
            'summary': self.summary,
            'file_audit': [asdict(r) for r in self.file_audit],
            'endpoint_audit': [asdict(r) for r in self.endpoint_audit],
            'data_audit': [asdict(r) for r in self.data_audit],
            'content_audit': [asdict(r) for r in self.content_audit],
            'security_audit': [asdict(r) for r in self.security_audit],
            'code_audit': [asdict(r) for r in self.code_audit],
            'recommendations': self.recommendations
        }


class LinkedInAutomationAuditor:
    """Audit the LinkedIn Intelligence Hub and Newsletter Automation Flow"""

    # Required files for the system
    REQUIRED_FILES = [
        "zapier-webhook-server.cjs",
        "linkedin-content-creator.cjs",
        "dutch-recruitment-news-scraper.cjs",
        "google-sheets-uploader.cjs",
        "complete-automation-flow.cjs",
        "package.json"
    ]

    # Required directories
    REQUIRED_DIRS = ["data", "content", "reports"]

    # Webhook endpoints to test
    ENDPOINTS = {
        "/status": "GET",
        "/test": "GET",
        "/reports": "GET",
        "/daily-news-collection": "POST",
        "/upload-to-sheets": "POST",
        "/weekly-content-creation": "POST",
        "/get-top-articles": "GET"
    }

    # Content types expected from LinkedIn content creator
    CONTENT_TYPES = [
        "weeklyRoundup",
        "insightPost",
        "trendAnalysis",
        "longFormArticle"
    ]

    # Security patterns to detect
    SECURITY_PATTERNS = [
        (r'(api_key|apikey)\s*[=:]\s*["\'][^"\']{10,}["\']', "Hardcoded API key"),
        (r'(secret|password)\s*[=:]\s*["\'][^"\']{8,}["\']', "Hardcoded secret/password"),
        (r'(token)\s*[=:]\s*["\'][^"\']{20,}["\']', "Hardcoded token"),
        (r'eval\s*\(', "Unsafe eval() usage"),
        (r'innerHTML\s*=', "Potential XSS via innerHTML"),
    ]

    def __init__(self, base_dir: Path = BASE_DIR):
        self.base_dir = base_dir
        self.results: List[AuditResult] = []
        self.server_url = SERVER_URL

    def log(self, message: str, level: str = "info"):
        """Print colored log message"""
        colors = {
            "info": "\033[94m",
            "success": "\033[92m",
            "warning": "\033[93m",
            "error": "\033[91m",
            "header": "\033[95m"
        }
        reset = "\033[0m"
        symbols = {
            "info": "i",
            "success": "✓",
            "warning": "⚠",
            "error": "✗",
            "header": "═"
        }
        print(f"{colors.get(level, '')}{symbols.get(level, '•')} {message}{reset}")

    def audit_files(self) -> List[AuditResult]:
        """Audit required files and directories"""
        results = []
        self.log("Auditing file structure...", "header")

        # Check required files
        for filename in self.REQUIRED_FILES:
            filepath = self.base_dir / filename
            if filepath.exists():
                size = filepath.stat().st_size
                results.append(AuditResult(
                    name=f"file_{filename}",
                    status="pass",
                    message=f"{filename} exists ({size} bytes)",
                    details={"path": str(filepath), "size": size}
                ))
                self.log(f"{filename} - OK ({size} bytes)", "success")
            else:
                results.append(AuditResult(
                    name=f"file_{filename}",
                    status="fail",
                    message=f"{filename} is missing"
                ))
                self.log(f"{filename} - MISSING", "error")

        # Check required directories
        for dirname in self.REQUIRED_DIRS:
            dirpath = self.base_dir / dirname
            if dirpath.exists() and dirpath.is_dir():
                file_count = len(list(dirpath.iterdir()))
                results.append(AuditResult(
                    name=f"dir_{dirname}",
                    status="pass",
                    message=f"{dirname}/ exists ({file_count} items)",
                    details={"path": str(dirpath), "items": file_count}
                ))
                self.log(f"{dirname}/ - OK ({file_count} items)", "success")
            else:
                results.append(AuditResult(
                    name=f"dir_{dirname}",
                    status="warn",
                    message=f"{dirname}/ is missing"
                ))
                self.log(f"{dirname}/ - MISSING", "warning")

        return results

    def audit_endpoints(self) -> List[AuditResult]:
        """Test all webhook endpoints"""
        results = []
        self.log("Auditing webhook endpoints...", "header")
        self.log(f"Server: {self.server_url}", "info")

        for endpoint, method in self.ENDPOINTS.items():
            try:
                url = f"{self.server_url}{endpoint}"
                req = urllib.request.Request(url, method=method)

                if method == "POST":
                    req.add_header("Content-Type", "application/json")
                    req.data = b'{}'

                with urllib.request.urlopen(req, timeout=10) as response:
                    status_code = response.getcode()

                    if status_code == 200:
                        results.append(AuditResult(
                            name=f"endpoint_{endpoint}",
                            status="pass",
                            message=f"{method} {endpoint} - HTTP {status_code}",
                            details={"method": method, "status": status_code}
                        ))
                        self.log(f"{method} {endpoint} - HTTP {status_code}", "success")
                    else:
                        results.append(AuditResult(
                            name=f"endpoint_{endpoint}",
                            status="warn",
                            message=f"{method} {endpoint} - HTTP {status_code}",
                            details={"method": method, "status": status_code}
                        ))
                        self.log(f"{method} {endpoint} - HTTP {status_code}", "warning")

            except urllib.error.URLError as e:
                results.append(AuditResult(
                    name=f"endpoint_{endpoint}",
                    status="fail",
                    message=f"{method} {endpoint} - Connection failed",
                    details={"error": str(e)}
                ))
                self.log(f"{method} {endpoint} - Connection failed", "error")
            except Exception as e:
                results.append(AuditResult(
                    name=f"endpoint_{endpoint}",
                    status="fail",
                    message=f"{method} {endpoint} - Error: {str(e)}",
                    details={"error": str(e)}
                ))
                self.log(f"{method} {endpoint} - Error: {str(e)}", "error")

        return results

    def audit_data(self) -> List[AuditResult]:
        """Audit data integrity and quality"""
        results = []
        self.log("Auditing data integrity...", "header")

        # Check latest-dutch-news.json
        news_file = DATA_DIR / "latest-dutch-news.json"
        if news_file.exists():
            try:
                with open(news_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                total_articles = data.get('totalArticles', 0)
                categories = len(data.get('categories', []))
                sources = len(data.get('sources', []))

                results.append(AuditResult(
                    name="data_latest_news",
                    status="pass",
                    message=f"latest-dutch-news.json: {total_articles} articles, {categories} categories",
                    details={
                        "total_articles": total_articles,
                        "categories": categories,
                        "sources": sources
                    }
                ))
                self.log(f"latest-dutch-news.json: {total_articles} articles", "success")

            except json.JSONDecodeError as e:
                results.append(AuditResult(
                    name="data_latest_news",
                    status="fail",
                    message=f"latest-dutch-news.json: Invalid JSON - {str(e)}"
                ))
                self.log(f"latest-dutch-news.json: Invalid JSON", "error")
        else:
            results.append(AuditResult(
                name="data_latest_news",
                status="warn",
                message="latest-dutch-news.json not found"
            ))
            self.log("latest-dutch-news.json not found", "warning")

        # Check weekly-top-articles.json
        weekly_file = DATA_DIR / "weekly-top-articles.json"
        if weekly_file.exists():
            try:
                with open(weekly_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                days_count = len(data) if isinstance(data, list) else 0

                results.append(AuditResult(
                    name="data_weekly_articles",
                    status="pass" if days_count >= 3 else "warn",
                    message=f"weekly-top-articles.json: {days_count} days of data",
                    details={"days": days_count}
                ))
                self.log(f"weekly-top-articles.json: {days_count} days", "success" if days_count >= 3 else "warning")

            except json.JSONDecodeError as e:
                results.append(AuditResult(
                    name="data_weekly_articles",
                    status="fail",
                    message=f"weekly-top-articles.json: Invalid JSON"
                ))
                self.log("weekly-top-articles.json: Invalid JSON", "error")
        else:
            results.append(AuditResult(
                name="data_weekly_articles",
                status="warn",
                message="weekly-top-articles.json not found - needed for LinkedIn content"
            ))
            self.log("weekly-top-articles.json not found", "warning")

        # Check sheets backups
        backup_files = list(DATA_DIR.glob("sheets-backup-*.json"))
        results.append(AuditResult(
            name="data_backups",
            status="pass" if backup_files else "info",
            message=f"Sheets backups: {len(backup_files)} files",
            details={"count": len(backup_files)}
        ))
        self.log(f"Sheets backups: {len(backup_files)} files", "success" if backup_files else "info")

        return results

    def audit_linkedin_content(self) -> List[AuditResult]:
        """Audit LinkedIn content generation"""
        results = []
        self.log("Auditing LinkedIn content...", "header")

        if not CONTENT_DIR.exists():
            results.append(AuditResult(
                name="content_dir",
                status="warn",
                message="Content directory does not exist"
            ))
            self.log("Content directory does not exist", "warning")
            return results

        # Count content by type
        content_stats = {}
        for content_type in self.CONTENT_TYPES:
            files = list(CONTENT_DIR.glob(f"*-{content_type}.md"))
            content_stats[content_type] = len(files)

            status = "pass" if files else "info"
            results.append(AuditResult(
                name=f"content_{content_type}",
                status=status,
                message=f"{content_type}: {len(files)} files",
                details={"count": len(files), "files": [f.name for f in files]}
            ))
            self.log(f"{content_type}: {len(files)} files", "success" if files else "info")

        # Analyze latest content quality
        md_files = list(CONTENT_DIR.glob("*.md"))
        if md_files:
            latest_file = max(md_files, key=lambda f: f.stat().st_mtime)
            with open(latest_file, 'r', encoding='utf-8') as f:
                content = f.read()

            word_count = len(content.split())
            has_hashtags = '#' in content
            has_dutch = any(word in content.lower() for word in ['recruitment', 'nederlandse', 'arbeidsmarkt'])

            results.append(AuditResult(
                name="content_quality",
                status="pass" if (word_count > 100 and has_hashtags and has_dutch) else "warn",
                message=f"Latest content: {latest_file.name} ({word_count} words)",
                details={
                    "file": latest_file.name,
                    "word_count": word_count,
                    "has_hashtags": has_hashtags,
                    "has_dutch_keywords": has_dutch
                }
            ))
            self.log(f"Latest: {latest_file.name} ({word_count} words)", "success")

        # Check metadata files
        metadata_files = list(CONTENT_DIR.glob("*-metadata.json"))
        results.append(AuditResult(
            name="content_metadata",
            status="pass" if metadata_files else "info",
            message=f"Metadata files: {len(metadata_files)}",
            details={"count": len(metadata_files)}
        ))
        self.log(f"Metadata files: {len(metadata_files)}", "success" if metadata_files else "info")

        return results

    def audit_security(self) -> List[AuditResult]:
        """Perform security audit"""
        results = []
        self.log("Performing security audit...", "header")

        # Scan code files for security issues
        js_files = list(self.base_dir.glob("*.cjs"))
        issues_found = []

        for js_file in js_files:
            try:
                with open(js_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                for pattern, issue_name in self.SECURITY_PATTERNS:
                    matches = re.findall(pattern, content, re.IGNORECASE)
                    if matches:
                        issues_found.append({
                            "file": js_file.name,
                            "issue": issue_name,
                            "matches": len(matches)
                        })
            except Exception as e:
                self.log(f"Error scanning {js_file.name}: {e}", "warning")

        if issues_found:
            results.append(AuditResult(
                name="security_code_scan",
                status="warn",
                message=f"Found {len(issues_found)} potential security issues",
                details={"issues": issues_found}
            ))
            self.log(f"Found {len(issues_found)} potential issues", "warning")
            for issue in issues_found:
                self.log(f"  - {issue['file']}: {issue['issue']}", "warning")
        else:
            results.append(AuditResult(
                name="security_code_scan",
                status="pass",
                message="No obvious security issues in code"
            ))
            self.log("No obvious security issues in code", "success")

        # Check .env file
        env_file = self.base_dir / ".env"
        if env_file.exists():
            results.append(AuditResult(
                name="security_env_file",
                status="pass",
                message=".env file exists"
            ))
            self.log(".env file exists", "success")

            # Check for required secrets
            with open(env_file, 'r') as f:
                env_content = f.read()

            has_webhook_secret = 'WEBHOOK_SECRET' in env_content
            results.append(AuditResult(
                name="security_webhook_secret",
                status="pass" if has_webhook_secret else "warn",
                message=f"WEBHOOK_SECRET: {'configured' if has_webhook_secret else 'not found'}"
            ))
            self.log(f"WEBHOOK_SECRET: {'configured' if has_webhook_secret else 'not found'}",
                     "success" if has_webhook_secret else "warning")
        else:
            results.append(AuditResult(
                name="security_env_file",
                status="warn",
                message=".env file not found"
            ))
            self.log(".env file not found", "warning")

        # Check .gitignore
        gitignore_file = self.base_dir / ".gitignore"
        if gitignore_file.exists():
            with open(gitignore_file, 'r') as f:
                gitignore_content = f.read()

            env_ignored = '.env' in gitignore_content
            results.append(AuditResult(
                name="security_gitignore",
                status="pass" if env_ignored else "fail",
                message=f".env in .gitignore: {env_ignored}"
            ))
            self.log(f".env in .gitignore: {env_ignored}", "success" if env_ignored else "error")

        # Check CORS configuration
        server_file = self.base_dir / "zapier-webhook-server.cjs"
        if server_file.exists():
            with open(server_file, 'r') as f:
                server_content = f.read()

            open_cors = "Access-Control-Allow-Origin', '*'" in server_content
            results.append(AuditResult(
                name="security_cors",
                status="warn" if open_cors else "pass",
                message=f"CORS: {'Open (*)' if open_cors else 'Restricted'}"
            ))
            self.log(f"CORS: {'Open (*) - consider restricting' if open_cors else 'Restricted'}",
                     "warning" if open_cors else "success")

        return results

    def audit_code_quality(self) -> List[AuditResult]:
        """Audit code structure and quality"""
        results = []
        self.log("Auditing code quality...", "header")

        # Check LinkedIn content creator
        creator_file = self.base_dir / "linkedin-content-creator.cjs"
        if creator_file.exists():
            with open(creator_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # Check for required methods
            required_methods = [
                "runWeeklyContentCreation",
                "generateWeeklyRoundupPost",
                "generateInsightPost",
                "generateTrendAnalysisPost",
                "generateLongFormArticle",
                "analyzeWeeklyTrends"
            ]

            found_methods = []
            missing_methods = []
            for method in required_methods:
                if method in content:
                    found_methods.append(method)
                else:
                    missing_methods.append(method)

            results.append(AuditResult(
                name="code_linkedin_methods",
                status="pass" if not missing_methods else "warn",
                message=f"LinkedIn Creator: {len(found_methods)}/{len(required_methods)} methods found",
                details={"found": found_methods, "missing": missing_methods}
            ))
            self.log(f"LinkedIn Creator methods: {len(found_methods)}/{len(required_methods)}",
                     "success" if not missing_methods else "warning")

            # Check content templates
            templates = ["weeklyRoundup", "insightPost", "trendAnalysis", "article"]
            found_templates = [t for t in templates if t in content]
            results.append(AuditResult(
                name="code_templates",
                status="pass" if len(found_templates) == len(templates) else "warn",
                message=f"Content templates: {len(found_templates)}/{len(templates)} configured",
                details={"templates": found_templates}
            ))
            self.log(f"Content templates: {len(found_templates)}/{len(templates)}", "success")

        # Check webhook server endpoints
        server_file = self.base_dir / "zapier-webhook-server.cjs"
        if server_file.exists():
            with open(server_file, 'r', encoding='utf-8') as f:
                content = f.read()

            endpoints_in_code = [
                "/daily-news-collection",
                "/upload-to-sheets",
                "/weekly-content-creation",
                "/get-top-articles",
                "/status",
                "/test",
                "/reports"
            ]

            found_endpoints = [e for e in endpoints_in_code if e in content]
            results.append(AuditResult(
                name="code_endpoints",
                status="pass" if len(found_endpoints) == len(endpoints_in_code) else "warn",
                message=f"Webhook endpoints: {len(found_endpoints)}/{len(endpoints_in_code)} implemented",
                details={"endpoints": found_endpoints}
            ))
            self.log(f"Webhook endpoints: {len(found_endpoints)}/{len(endpoints_in_code)}", "success")

        # Check error handling
        js_files = list(self.base_dir.glob("*.cjs"))
        files_with_try_catch = 0
        for js_file in js_files:
            with open(js_file, 'r', encoding='utf-8') as f:
                if 'try {' in f.read():
                    files_with_try_catch += 1

        results.append(AuditResult(
            name="code_error_handling",
            status="pass" if files_with_try_catch > 3 else "warn",
            message=f"Error handling: {files_with_try_catch}/{len(js_files)} files use try-catch",
            details={"files_with_handling": files_with_try_catch, "total_files": len(js_files)}
        ))
        self.log(f"Error handling: {files_with_try_catch}/{len(js_files)} files", "success")

        return results

    def generate_recommendations(self, all_results: List[AuditResult]) -> List[str]:
        """Generate recommendations based on audit results"""
        recommendations = []

        # Analyze results
        fails = [r for r in all_results if r.status == "fail"]
        warns = [r for r in all_results if r.status == "warn"]

        # Add recommendations based on findings
        if any("cors" in r.name.lower() for r in warns):
            recommendations.append("Consider restricting CORS to specific domains in production")

        if any("env" in r.name.lower() for r in warns + fails):
            recommendations.append("Ensure .env file is properly configured with all required secrets")

        if any("weekly" in r.name.lower() and r.status != "pass" for r in all_results):
            recommendations.append("Run daily uploads for at least 3 days before generating weekly LinkedIn content")

        if any("content" in r.name.lower() and "0 files" in r.message for r in all_results):
            recommendations.append("Generate LinkedIn content using: node linkedin-content-creator.cjs create")

        if any("backup" in r.name.lower() for r in all_results):
            recommendations.append("Set up automated backups of the data directory")

        if any("endpoint" in r.name.lower() and r.status == "fail" for r in all_results):
            recommendations.append("Ensure the webhook server is running: npm start")

        # Default recommendations
        recommendations.extend([
            "Review generated LinkedIn content before manual posting",
            "Monitor endpoint response times in production",
            "Keep dependencies updated: npm update",
            "Test automation flow weekly to ensure reliability"
        ])

        return recommendations

    def run_full_audit(self) -> AuditReport:
        """Run complete audit and generate report"""
        self.log("DUTCH RECRUITMENT INTELLIGENCE - FULL AUDIT", "header")
        self.log("LinkedIn Intelligence Hub & Newsletter Automation Flow", "info")
        self.log(f"Timestamp: {datetime.now().isoformat()}", "info")
        print()

        # Run all audits
        file_results = self.audit_files()
        print()
        endpoint_results = self.audit_endpoints()
        print()
        data_results = self.audit_data()
        print()
        content_results = self.audit_linkedin_content()
        print()
        security_results = self.audit_security()
        print()
        code_results = self.audit_code_quality()
        print()

        # Combine all results
        all_results = (file_results + endpoint_results + data_results +
                      content_results + security_results + code_results)

        # Generate summary
        summary = {
            "total_checks": len(all_results),
            "passed": len([r for r in all_results if r.status == "pass"]),
            "warnings": len([r for r in all_results if r.status == "warn"]),
            "failed": len([r for r in all_results if r.status == "fail"]),
            "info": len([r for r in all_results if r.status == "info"])
        }

        # Generate recommendations
        recommendations = self.generate_recommendations(all_results)

        # Create report
        report = AuditReport(
            title="Dutch Recruitment Intelligence - Audit Report",
            timestamp=datetime.now().isoformat(),
            summary=summary,
            file_audit=file_results,
            endpoint_audit=endpoint_results,
            data_audit=data_results,
            content_audit=content_results,
            security_audit=security_results,
            code_audit=code_results,
            recommendations=recommendations
        )

        return report

    def save_report(self, report: AuditReport, format: str = "all") -> Dict[str, Path]:
        """Save audit report in various formats"""
        AUDIT_DIR.mkdir(exist_ok=True)
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        saved_files = {}

        if format in ["json", "all"]:
            json_file = AUDIT_DIR / f"audit-report-{timestamp}.json"
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(report.to_dict(), f, indent=2, ensure_ascii=False)
            saved_files["json"] = json_file
            self.log(f"JSON report saved: {json_file}", "success")

        if format in ["md", "all"]:
            md_file = AUDIT_DIR / f"audit-report-{timestamp}.md"
            md_content = self._generate_markdown_report(report)
            with open(md_file, 'w', encoding='utf-8') as f:
                f.write(md_content)
            saved_files["md"] = md_file
            self.log(f"Markdown report saved: {md_file}", "success")

        return saved_files

    def _generate_markdown_report(self, report: AuditReport) -> str:
        """Generate markdown format report"""
        md = f"""# {report.title}

**Generated:** {report.timestamp}
**Server:** {self.server_url}

## Executive Summary

| Metric | Count |
|--------|-------|
| Total Checks | {report.summary['total_checks']} |
| Passed | {report.summary['passed']} |
| Warnings | {report.summary['warnings']} |
| Failed | {report.summary['failed']} |

## File Structure Audit

| Check | Status | Details |
|-------|--------|---------|
"""
        for r in report.file_audit:
            status_icon = {"pass": "✓", "warn": "⚠", "fail": "✗", "info": "ℹ"}.get(r.status, "?")
            md += f"| {r.name} | {status_icon} {r.status.upper()} | {r.message} |\n"

        md += """
## Endpoint Audit

| Endpoint | Status | Response |
|----------|--------|----------|
"""
        for r in report.endpoint_audit:
            status_icon = {"pass": "✓", "warn": "⚠", "fail": "✗"}.get(r.status, "?")
            md += f"| {r.name.replace('endpoint_', '')} | {status_icon} | {r.message} |\n"

        md += """
## Data Integrity Audit

| Data Source | Status | Details |
|-------------|--------|---------|
"""
        for r in report.data_audit:
            status_icon = {"pass": "✓", "warn": "⚠", "fail": "✗", "info": "ℹ"}.get(r.status, "?")
            md += f"| {r.name.replace('data_', '')} | {status_icon} | {r.message} |\n"

        md += """
## LinkedIn Content Audit

| Content Type | Status | Details |
|--------------|--------|---------|
"""
        for r in report.content_audit:
            status_icon = {"pass": "✓", "warn": "⚠", "fail": "✗", "info": "ℹ"}.get(r.status, "?")
            md += f"| {r.name.replace('content_', '')} | {status_icon} | {r.message} |\n"

        md += """
## Security Audit

| Check | Status | Details |
|-------|--------|---------|
"""
        for r in report.security_audit:
            status_icon = {"pass": "✓", "warn": "⚠", "fail": "✗"}.get(r.status, "?")
            md += f"| {r.name.replace('security_', '')} | {status_icon} | {r.message} |\n"

        md += """
## Code Quality Audit

| Check | Status | Details |
|-------|--------|---------|
"""
        for r in report.code_audit:
            status_icon = {"pass": "✓", "warn": "⚠", "fail": "✗"}.get(r.status, "?")
            md += f"| {r.name.replace('code_', '')} | {status_icon} | {r.message} |\n"

        md += """
## Recommendations

"""
        for i, rec in enumerate(report.recommendations, 1):
            md += f"{i}. {rec}\n"

        md += """
---

## LinkedIn Automation Flow Overview

### Daily Flow (09:00 Amsterdam)
1. `/daily-news-collection` - Scrape 8 Dutch recruitment sources
2. `/upload-to-sheets` - Score articles and upload to Google Sheets
3. HTML report generation
4. Email notification with daily summary

### Weekly Flow (Sunday 10:00)
1. `/weekly-content-creation` - Analyze top articles from the week
2. Generate 4 LinkedIn content formats:
   - Weekly Roundup (Social media post)
   - Insight Post (Single trend focus)
   - Trend Analysis (Data-driven)
   - Long-form Article (Comprehensive)
3. Save markdown files to `/content` directory
4. Email notification with content options
5. **Manual LinkedIn posting** (human review required)

### Content Types
- **weeklyRoundup**: Overview of top 5 articles for quick social sharing
- **insightPost**: Deep dive into one trending topic
- **trendAnalysis**: Data-driven analysis with statistics
- **longFormArticle**: Comprehensive article for LinkedIn publishing

---

*Report generated by python_audits.py*
"""
        return md


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(
        description="Dutch Recruitment Intelligence - Audit Suite",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python python_audits.py full          Run complete audit
  python python_audits.py endpoints     Test webhook endpoints only
  python python_audits.py content       Audit LinkedIn content only
  python python_audits.py security      Run security scan only

Environment variables:
  WEBHOOK_BASE_URL   Server URL (default: http://localhost:3000)
        """
    )

    parser.add_argument('command', nargs='?', default='full',
                       choices=['full', 'files', 'endpoints', 'data', 'content', 'security', 'code'],
                       help='Audit command to run (default: full)')
    parser.add_argument('--output', '-o', choices=['json', 'md', 'all'], default='all',
                       help='Output format (default: all)')
    parser.add_argument('--server', '-s', help='Server URL to test')

    args = parser.parse_args()

    auditor = LinkedInAutomationAuditor()

    if args.server:
        auditor.server_url = args.server

    if args.command == 'full':
        report = auditor.run_full_audit()

        # Print summary
        print()
        auditor.log("AUDIT SUMMARY", "header")
        auditor.log(f"Total checks: {report.summary['total_checks']}", "info")
        auditor.log(f"Passed: {report.summary['passed']}", "success")
        if report.summary['warnings'] > 0:
            auditor.log(f"Warnings: {report.summary['warnings']}", "warning")
        if report.summary['failed'] > 0:
            auditor.log(f"Failed: {report.summary['failed']}", "error")

        # Save report
        print()
        saved = auditor.save_report(report, args.output)
        print()
        auditor.log("AUDIT COMPLETE", "header")

    elif args.command == 'files':
        auditor.audit_files()
    elif args.command == 'endpoints':
        auditor.audit_endpoints()
    elif args.command == 'data':
        auditor.audit_data()
    elif args.command == 'content':
        auditor.audit_linkedin_content()
    elif args.command == 'security':
        auditor.audit_security()
    elif args.command == 'code':
        auditor.audit_code_quality()


if __name__ == "__main__":
    main()
