#!/bin/bash
# Monitoring Script voor Dutch Recruitment Intelligence

WEBHOOK_URL="https://dutch-recruitment-webhooks.herokuapp.com"
EMAIL="your-email@domain.com"
SLACK_WEBHOOK="your-slack-webhook-url"

# Health check
check_health() {
    response=$(curl -s -w "%{http_code}" "$WEBHOOK_URL/status")
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" != "200" ]; then
        echo "❌ Webhook server down! Status code: $http_code"
        # Send alert
        curl -X POST -H 'Content-type: application/json' \
            --data '{"text":"🚨 Dutch Recruitment Intelligence webhook server is down!"}' \
            "$SLACK_WEBHOOK"
        return 1
    else
        echo "✅ Webhook server healthy"
        return 0
    fi
}

# Daily statistics check
check_daily_stats() {
    stats=$(curl -s "$WEBHOOK_URL/get-top-articles")
    articles_count=$(echo "$stats" | jq '.totalEvaluated')
    
    if [ "$articles_count" -lt 5 ]; then
        echo "⚠️ Low article count: $articles_count"
        # Send warning
    else
        echo "📊 Daily stats OK: $articles_count articles"
    fi
}

# Run checks
echo "🔍 Running health checks..."
check_health
check_daily_stats

echo "✅ Monitoring check complete"
