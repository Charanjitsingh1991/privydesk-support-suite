# PrivyDesk API Documentation

## Overview

Complete API documentation for all PrivyDesk services including Knowledge Base, Forums, Enterprise features, Omnichannel, Integrations, Mobile, and Marketplace.

**Base URL:** `https://your-domain.com/api`  
**Authentication:** Supabase JWT tokens via `Authorization: Bearer <token>`

---

## Table of Contents

1. [Knowledge Base API](#knowledge-base-api)
2. [Forum API](#forum-api)
3. [SSO & Authentication API](#sso--authentication-api)
4. [Custom Roles & RBAC API](#custom-roles--rbac-api)
5. [Branding & White-Label API](#branding--white-label-api)
6. [GDPR & Compliance API](#gdpr--compliance-api)
7. [Omnichannel API](#omnichannel-api)
8. [Integration API](#integration-api)
9. [Marketplace API](#marketplace-api)
10. [Mobile API](#mobile-api)

---

## Knowledge Base API

### Get Published Articles

```typescript
GET /kb/articles?organizationId={orgId}&categoryId={catId}&language={lang}&limit={limit}
```

**Query Parameters:**
- `organizationId` (required): Organization UUID
- `categoryId` (optional): Filter by category
- `language` (optional): Filter by language (default: 'en')
- `limit` (optional): Number of results (default: 50)

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "How to Reset Password",
    "slug": "how-to-reset-password",
    "excerpt": "Learn how to reset your password...",
    "content": "Full article content...",
    "category_id": "uuid",
    "view_count": 1250,
    "helpful_count": 45,
    "not_helpful_count": 3,
    "status": "published",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### Search Articles

```typescript
POST /kb/articles/search
```

**Request Body:**
```json
{
  "organizationId": "uuid",
  "query": "password reset"
}
```

**Response:** Array of matching articles (same structure as above)

### Vote on Article

```typescript
POST /kb/articles/{articleId}/vote
```

**Request Body:**
```json
{
  "helpful": true  // true for helpful, false for not helpful
}
```

**Response:**
```json
{
  "success": true,
  "helpful_count": 46,
  "not_helpful_count": 3
}
```

### Increment View Count

```typescript
POST /kb/articles/{articleId}/view
```

**Response:**
```json
{
  "success": true,
  "view_count": 1251
}
```

### Get Analytics

```typescript
GET /kb/analytics?organizationId={orgId}&startDate={date}&endDate={date}
```

**Response:**
```json
{
  "totalArticles": 125,
  "totalViews": 45230,
  "totalHelpful": 3420,
  "totalNotHelpful": 234,
  "topArticles": [
    {
      "id": "uuid",
      "title": "Most Viewed Article",
      "view_count": 5420
    }
  ]
}
```

---

## Forum API

### Get Topics

```typescript
GET /forum/topics?organizationId={orgId}&categoryId={catId}&status={status}&limit={limit}
```

**Query Parameters:**
- `organizationId` (required): Organization UUID
- `categoryId` (optional): Filter by category
- `status` (optional): 'open', 'closed', 'pinned'
- `limit` (optional): Number of results (default: 50)

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "How to integrate with Zapier?",
    "content": "I'm trying to set up...",
    "author_id": "uuid",
    "reply_count": 12,
    "vote_count": 8,
    "is_solved": false,
    "is_pinned": false,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### Create Topic

```typescript
POST /forum/topics
```

**Request Body:**
```json
{
  "organizationId": "uuid",
  "authorId": "uuid",
  "title": "New Topic Title",
  "slug": "new-topic-title",
  "content": "Topic content...",
  "category_id": "uuid",
  "tags": ["integration", "zapier"]
}
```

### Vote on Topic

```typescript
POST /forum/topics/{topicId}/vote
```

**Request Body:**
```json
{
  "value": 1  // 1 for upvote, -1 for downvote
}
```

### Mark as Solution

```typescript
POST /forum/topics/{topicId}/solution
```

**Request Body:**
```json
{
  "replyId": "uuid"
}
```

### Get Replies

```typescript
GET /forum/topics/{topicId}/replies?limit={limit}&offset={offset}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "topic_id": "uuid",
    "content": "Reply content...",
    "author_id": "uuid",
    "vote_count": 5,
    "is_best_answer": false,
    "created_at": "2024-01-15T11:00:00Z"
  }
]
```

---

## SSO & Authentication API

### Create SSO Configuration

```typescript
POST /sso/configurations
```

**Request Body:**
```json
{
  "organizationId": "uuid",
  "provider": "okta",
  "sso_type": "saml",
  "entity_id": "https://your-org.okta.com",
  "sso_url": "https://your-org.okta.com/sso",
  "certificate": "-----BEGIN CERTIFICATE-----...",
  "is_active": true
}
```

### Test SSO Connection

```typescript
POST /sso/configurations/{configId}/test
```

**Response:**
```json
{
  "success": true,
  "message": "SSO connection successful"
}
```

### Toggle SSO

```typescript
PATCH /sso/configurations/{configId}/toggle
```

**Request Body:**
```json
{
  "is_active": true
}
```

---

## Custom Roles & RBAC API

### Create Custom Role

```typescript
POST /roles
```

**Request Body:**
```json
{
  "organizationId": "uuid",
  "name": "Support Manager",
  "description": "Can manage support tickets and agents",
  "permissions": [
    "tickets.view",
    "tickets.create",
    "tickets.assign",
    "users.view"
  ]
}
```

### Assign Role to User

```typescript
POST /roles/assignments
```

**Request Body:**
```json
{
  "userId": "uuid",
  "roleId": "uuid"
}
```

### Check Permission

```typescript
GET /roles/permissions/check?userId={userId}&permission={permission}
```

**Response:**
```json
{
  "hasPermission": true
}
```

### Available Permissions

```typescript
GET /roles/permissions
```

**Response:**
```json
{
  "permissions": [
    "tickets.view",
    "tickets.create",
    "tickets.edit",
    "tickets.delete",
    "tickets.assign",
    "users.view",
    "users.create",
    "users.edit",
    "users.delete",
    "settings.view",
    "settings.edit",
    "reports.view",
    "billing.view",
    "billing.edit",
    "integrations.manage"
  ]
}
```

---

## Branding & White-Label API

### Get Branding Settings

```typescript
GET /branding?organizationId={orgId}
```

**Response:**
```json
{
  "id": "uuid",
  "organization_id": "uuid",
  "logo_url": "https://cdn.example.com/logo.png",
  "favicon_url": "https://cdn.example.com/favicon.ico",
  "primary_color": "#6366f1",
  "secondary_color": "#a3e635",
  "custom_css": ".header { background: #000; }",
  "email_header_html": "<div>Custom header</div>",
  "email_footer_html": "<div>Custom footer</div>"
}
```

### Upload Logo

```typescript
POST /branding/logo
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Image file (PNG, JPG, SVG)
- `organizationId`: Organization UUID

**Response:**
```json
{
  "logo_url": "https://cdn.example.com/logo.png"
}
```

### Add Custom Domain

```typescript
POST /branding/domains
```

**Request Body:**
```json
{
  "organizationId": "uuid",
  "domain": "support.yourcompany.com"
}
```

**Response:**
```json
{
  "id": "uuid",
  "domain": "support.yourcompany.com",
  "verification_token": "abc123xyz",
  "is_verified": false,
  "dns_instructions": "Add TXT record: privydesk-verify=abc123xyz"
}
```

### Verify Domain

```typescript
POST /branding/domains/{domainId}/verify
```

**Response:**
```json
{
  "verified": true,
  "message": "Domain verified successfully"
}
```

---

## GDPR & Compliance API

### Request Data Export

```typescript
POST /gdpr/export
```

**Request Body:**
```json
{
  "userId": "uuid",
  "organizationId": "uuid",
  "includeTickets": true,
  "includeMessages": true,
  "includeAttachments": false
}
```

**Response:**
```json
{
  "requestId": "uuid",
  "status": "processing",
  "estimatedCompletionTime": "2024-01-15T12:00:00Z"
}
```

### Request Data Deletion

```typescript
POST /gdpr/delete
```

**Request Body:**
```json
{
  "userId": "uuid",
  "organizationId": "uuid",
  "reason": "User requested account deletion"
}
```

### Create Retention Policy

```typescript
POST /gdpr/retention-policies
```

**Request Body:**
```json
{
  "organizationId": "uuid",
  "resource_type": "tickets",
  "retention_days": 365,
  "action_on_expiry": "archive"
}
```

---

## Omnichannel API

### Send WhatsApp Message

```typescript
POST /omnichannel/whatsapp/send
```

**Request Body:**
```json
{
  "organizationId": "uuid",
  "channelConfigId": "uuid",
  "to": "+1234567890",
  "message": "Hello from PrivyDesk!",
  "mediaUrl": "https://example.com/image.jpg"
}
```

### Send SMS

```typescript
POST /omnichannel/sms/send
```

**Request Body:**
```json
{
  "organizationId": "uuid",
  "channelConfigId": "uuid",
  "to": "+1234567890",
  "message": "Your ticket has been updated"
}
```

### Initiate Voice Call

```typescript
POST /omnichannel/voice/call
```

**Request Body:**
```json
{
  "organizationId": "uuid",
  "channelConfigId": "uuid",
  "to": "+1234567890",
  "agentId": "uuid"
}
```

### Get Conversations

```typescript
GET /omnichannel/conversations?organizationId={orgId}&status={status}&assignedTo={userId}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "channel_type": "whatsapp",
    "customer_identifier": "+1234567890",
    "status": "open",
    "assigned_to": "uuid",
    "last_message_at": "2024-01-15T10:30:00Z",
    "message_count": 12
  }
]
```

---

## Integration API

### Get Integrations

```typescript
GET /integrations?organizationId={orgId}&type={type}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "integration_name": "Zapier Integration",
    "integration_type": "zapier",
    "is_active": true,
    "last_sync_at": "2024-01-15T10:00:00Z",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Create Integration

```typescript
POST /integrations
```

**Request Body:**
```json
{
  "organizationId": "uuid",
  "integration_type": "slack",
  "integration_name": "Slack Notifications",
  "credentials": {
    "webhook_url": "https://hooks.slack.com/services/..."
  },
  "settings": {
    "channel": "#support",
    "notify_on_new_ticket": true
  }
}
```

### Start Sync

```typescript
POST /integrations/{integrationId}/sync
```

**Request Body:**
```json
{
  "syncType": "manual"  // 'manual', 'full', 'incremental'
}
```

### Create Zapier Trigger

```typescript
POST /integrations/zapier/triggers
```

**Request Body:**
```json
{
  "organizationId": "uuid",
  "trigger_event": "ticket.created",
  "trigger_name": "New Ticket Alert",
  "webhook_url": "https://hooks.zapier.com/hooks/catch/...",
  "filters": {
    "priority": ["high", "urgent"]
  }
}
```

### Send Slack Message

```typescript
POST /integrations/slack/send
```

**Request Body:**
```json
{
  "integrationId": "uuid",
  "channel": "#support",
  "message": "New ticket created: #1234"
}
```

---

## Marketplace API

### Get Apps

```typescript
GET /marketplace/apps?category={category}&featured={boolean}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Advanced Analytics",
    "slug": "advanced-analytics",
    "description": "Powerful analytics and reporting",
    "category": "analytics",
    "logo_url": "https://cdn.example.com/app-logo.png",
    "pricing_model": "freemium",
    "price_monthly": 29.99,
    "install_count": 1250,
    "rating_average": 4.8,
    "rating_count": 156
  }
]
```

### Search Apps

```typescript
GET /marketplace/apps/search?q={query}
```

### Install App

```typescript
POST /marketplace/apps/{appId}/install
```

**Request Body:**
```json
{
  "organizationId": "uuid"
}
```

### Uninstall App

```typescript
DELETE /marketplace/installations/{installationId}
```

### Create Review

```typescript
POST /marketplace/apps/{appId}/reviews
```

**Request Body:**
```json
{
  "userId": "uuid",
  "rating": 5,
  "review_text": "Excellent app! Highly recommended.",
  "pros": ["Easy to use", "Great features"],
  "cons": ["Slightly expensive"]
}
```

### Get App Reviews

```typescript
GET /marketplace/apps/{appId}/reviews?limit={limit}
```

---

## Mobile API

### Register Device

```typescript
POST /mobile/devices
```

**Request Body:**
```json
{
  "userId": "uuid",
  "organizationId": "uuid",
  "device_token": "fcm_token_or_apns_token",
  "platform": "ios",
  "device_model": "iPhone 14 Pro",
  "os_version": "17.2",
  "app_version": "1.0.0"
}
```

### Send Push Notification

```typescript
POST /mobile/notifications
```

**Request Body:**
```json
{
  "userId": "uuid",
  "organizationId": "uuid",
  "title": "New Message",
  "body": "You have a new message from customer",
  "data": {
    "ticketId": "uuid",
    "type": "message"
  },
  "notification_type": "message"
}
```

### Create Session

```typescript
POST /mobile/sessions
```

**Request Body:**
```json
{
  "userId": "uuid",
  "deviceId": "uuid"
}
```

**Response:**
```json
{
  "id": "uuid",
  "session_token": "abc123xyz",
  "started_at": "2024-01-15T10:00:00Z"
}
```

### Add to Offline Sync Queue

```typescript
POST /mobile/sync/queue
```

**Request Body:**
```json
{
  "userId": "uuid",
  "deviceId": "uuid",
  "action_type": "create_ticket",
  "resource_type": "tickets",
  "resource_id": "uuid",
  "payload": {
    "title": "Offline created ticket",
    "description": "Created while offline"
  }
}
```

### Process Sync Queue

```typescript
POST /mobile/sync/process
```

**Request Body:**
```json
{
  "deviceId": "uuid"
}
```

**Response:**
```json
{
  "processed": 5,
  "failed": 0,
  "items": [
    {
      "id": "uuid",
      "status": "synced",
      "synced_at": "2024-01-15T10:05:00Z"
    }
  ]
}
```

---

## Error Responses

All API endpoints return standard error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` (400): Invalid request data
- `UNAUTHORIZED` (401): Missing or invalid authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource already exists
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

---

## Rate Limiting

All API endpoints are rate-limited:

- **Free Plan:** 100 requests/minute
- **Starter Plan:** 500 requests/minute
- **Professional Plan:** 2,000 requests/minute
- **Enterprise Plan:** 10,000 requests/minute

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642252800
```

---

## Webhooks

PrivyDesk can send webhooks for various events:

### Webhook Events

- `ticket.created`
- `ticket.updated`
- `ticket.closed`
- `message.created`
- `user.created`
- `integration.synced`
- `payment.succeeded`
- `payment.failed`

### Webhook Payload

```json
{
  "event": "ticket.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "uuid",
    "title": "New Support Ticket",
    "status": "open",
    "priority": "high"
  }
}
```

### Webhook Security

All webhooks include a signature header for verification:
```
X-PrivyDesk-Signature: sha256=abc123...
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { PrivyDeskClient } from '@privydesk/sdk';

const client = new PrivyDeskClient({
  apiKey: 'your-api-key',
  organizationId: 'your-org-id'
});

// Knowledge Base
const articles = await client.kb.getArticles({ limit: 10 });
await client.kb.voteArticle(articleId, true);

// Forum
const topics = await client.forum.getTopics();
await client.forum.createTopic({
  title: 'New Topic',
  content: 'Topic content...'
});

// Integrations
const integrations = await client.integrations.list();
await client.integrations.sync(integrationId);

// Marketplace
const apps = await client.marketplace.getApps();
await client.marketplace.install(appId);
```

### Python

```python
from privydesk import PrivyDeskClient

client = PrivyDeskClient(
    api_key='your-api-key',
    organization_id='your-org-id'
)

# Knowledge Base
articles = client.kb.get_articles(limit=10)
client.kb.vote_article(article_id, helpful=True)

# Forum
topics = client.forum.get_topics()
client.forum.create_topic(
    title='New Topic',
    content='Topic content...'
)

# Integrations
integrations = client.integrations.list()
client.integrations.sync(integration_id)
```

---

## Support

For API support, contact:
- **Email:** api-support@privydesk.com
- **Documentation:** https://docs.privydesk.com
- **Status Page:** https://status.privydesk.com
- **Community Forum:** https://community.privydesk.com

---

**Last Updated:** January 30, 2026  
**API Version:** v1.0.0
