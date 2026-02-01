# PrivyDesk - Complete API Documentation

**Version:** 2.0.0  
**Base URL:** `https://your-project.supabase.co`  
**Authentication:** Bearer Token (JWT)

---

## Table of Contents
1. [Authentication](#authentication)
2. [Tickets API](#tickets-api)
3. [Messages API](#messages-api)
4. [Users & Teams API](#users--teams-api)
5. [Organizations API](#organizations-api)
6. [Live Chat API](#live-chat-api)
7. [Email Integration API](#email-integration-api)
8. [Analytics API](#analytics-api)
9. [Webhooks](#webhooks)
10. [Error Handling](#error-handling)
11. [Rate Limiting](#rate-limiting)
12. [Code Examples](#code-examples)

---

## Authentication

### Overview
PrivyDesk uses Supabase Auth with JWT tokens for API authentication.

### Login
```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

### Using the Token
Include the access token in all API requests:
```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Refresh Token
```http
POST /auth/v1/token?grant_type=refresh_token
Content-Type: application/json

{
  "refresh_token": "your-refresh-token"
}
```

---

## Tickets API

### List Tickets
```http
GET /rest/v1/tickets
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
- `status` (string): Filter by status (open, in_progress, resolved, closed)
- `priority` (string): Filter by priority (low, medium, high, urgent)
- `assigned_to` (uuid): Filter by assigned user
- `limit` (number): Number of results (default: 50, max: 100)
- `offset` (number): Pagination offset

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Cannot login to account",
    "description": "User experiencing login issues",
    "status": "open",
    "priority": "high",
    "assigned_to": "user-uuid",
    "customer_id": "customer-uuid",
    "organization_id": "org-uuid",
    "tags": ["login", "urgent"],
    "created_at": "2026-02-01T10:00:00Z",
    "updated_at": "2026-02-01T10:30:00Z"
  }
]
```

### Get Single Ticket
```http
GET /rest/v1/tickets?id=eq.{ticket_id}
Authorization: Bearer YOUR_TOKEN
```

### Create Ticket
```http
POST /rest/v1/tickets
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Issue with payment",
  "description": "Customer cannot complete checkout",
  "priority": "high",
  "customer_id": "customer-uuid",
  "tags": ["payment", "checkout"]
}
```

**Response:**
```json
{
  "id": "new-ticket-uuid",
  "title": "Issue with payment",
  "status": "open",
  "created_at": "2026-02-01T11:00:00Z"
}
```

### Update Ticket
```http
PATCH /rest/v1/tickets?id=eq.{ticket_id}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "status": "in_progress",
  "assigned_to": "agent-uuid",
  "priority": "urgent"
}
```

### Delete Ticket
```http
DELETE /rest/v1/tickets?id=eq.{ticket_id}
Authorization: Bearer YOUR_TOKEN
```

### Assign Ticket
```http
PATCH /rest/v1/tickets?id=eq.{ticket_id}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "assigned_to": "agent-uuid"
}
```

### Add Tags
```http
PATCH /rest/v1/tickets?id=eq.{ticket_id}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "tags": ["bug", "high-priority", "ui"]
}
```

---

## Messages API

### List Messages for Ticket
```http
GET /rest/v1/messages?ticket_id=eq.{ticket_id}&order=created_at.asc
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
[
  {
    "id": "message-uuid",
    "ticket_id": "ticket-uuid",
    "user_id": "user-uuid",
    "content": "Thank you for contacting support...",
    "is_internal": false,
    "attachments": [
      {
        "name": "screenshot.png",
        "url": "https://storage.url/file.png",
        "size": 102400
      }
    ],
    "created_at": "2026-02-01T10:05:00Z"
  }
]
```

### Create Message
```http
POST /rest/v1/messages
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "ticket_id": "ticket-uuid",
  "content": "We are looking into this issue...",
  "is_internal": false
}
```

### Create Internal Note
```http
POST /rest/v1/messages
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "ticket_id": "ticket-uuid",
  "content": "Customer seems frustrated, handle with care",
  "is_internal": true
}
```

---

## Users & Teams API

### List Team Members
```http
GET /rest/v1/users?organization_id=eq.{org_id}
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
[
  {
    "id": "user-uuid",
    "email": "agent@company.com",
    "full_name": "John Doe",
    "role": "agent",
    "avatar_url": "https://...",
    "status": "online",
    "created_at": "2026-01-15T00:00:00Z"
  }
]
```

### Get User Profile
```http
GET /rest/v1/users?id=eq.{user_id}
Authorization: Bearer YOUR_TOKEN
```

### Update User
```http
PATCH /rest/v1/users?id=eq.{user_id}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "full_name": "Jane Smith",
  "avatar_url": "https://new-avatar.png",
  "role": "admin"
}
```

### Invite Team Member
```http
POST /rest/v1/invitations
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "email": "newagent@company.com",
  "role": "agent",
  "organization_id": "org-uuid"
}
```

---

## Organizations API

### Get Organization
```http
GET /rest/v1/organizations?id=eq.{org_id}
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "id": "org-uuid",
  "name": "Acme Corp",
  "slug": "acme-corp",
  "plan": "professional",
  "settings": {
    "timezone": "America/New_York",
    "business_hours": {
      "monday": "9:00-17:00",
      "tuesday": "9:00-17:00"
    }
  },
  "created_at": "2026-01-01T00:00:00Z"
}
```

### Update Organization
```http
PATCH /rest/v1/organizations?id=eq.{org_id}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Acme Corporation",
  "settings": {
    "timezone": "America/Los_Angeles"
  }
}
```

---

## Live Chat API

### Start Chat Session
```http
POST /rest/v1/chat_sessions
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "customer_email": "customer@example.com",
  "customer_name": "Alice Johnson"
}
```

**Response:**
```json
{
  "id": "session-uuid",
  "status": "active",
  "agent_id": null,
  "created_at": "2026-02-01T12:00:00Z"
}
```

### Send Chat Message
```http
POST /rest/v1/chat_messages
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "session_id": "session-uuid",
  "message": "Hello, how can I help you?",
  "sender_type": "agent"
}
```

### Get Chat History
```http
GET /rest/v1/chat_messages?session_id=eq.{session_id}&order=created_at.asc
Authorization: Bearer YOUR_TOKEN
```

### End Chat Session
```http
PATCH /rest/v1/chat_sessions?id=eq.{session_id}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "status": "closed",
  "ended_at": "2026-02-01T12:30:00Z"
}
```

---

## Email Integration API

### List Email Accounts
```http
GET /rest/v1/email_accounts?organization_id=eq.{org_id}
Authorization: Bearer YOUR_TOKEN
```

### Add Email Account
```http
POST /rest/v1/email_accounts
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "email": "support@company.com",
  "imap_host": "imap.gmail.com",
  "imap_port": 993,
  "smtp_host": "smtp.gmail.com",
  "smtp_port": 587,
  "username": "support@company.com",
  "password": "app-specific-password"
}
```

### Sync Emails
```http
POST /rest/v1/rpc/sync_emails
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "account_id": "email-account-uuid"
}
```

---

## Analytics API

### Get Dashboard Stats
```http
GET /rest/v1/rpc/get_dashboard_stats
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "organization_id": "org-uuid",
  "start_date": "2026-01-01",
  "end_date": "2026-02-01"
}
```

**Response:**
```json
{
  "total_tickets": 1250,
  "open_tickets": 45,
  "resolved_tickets": 1180,
  "avg_response_time": "2h 15m",
  "avg_resolution_time": "1d 4h",
  "customer_satisfaction": 4.6,
  "tickets_by_status": {
    "open": 45,
    "in_progress": 25,
    "resolved": 1180
  }
}
```

### Get Agent Performance
```http
GET /rest/v1/rpc/get_agent_performance
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "agent_id": "agent-uuid",
  "start_date": "2026-01-01",
  "end_date": "2026-02-01"
}
```

### Export Report
```http
POST /rest/v1/rpc/export_report
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "report_type": "tickets",
  "format": "csv",
  "filters": {
    "status": "resolved",
    "date_range": "last_30_days"
  }
}
```

---

## Webhooks

### Create Webhook
```http
POST /rest/v1/webhooks
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["ticket.created", "ticket.updated", "message.created"],
  "secret": "your-webhook-secret"
}
```

### Webhook Events

#### ticket.created
```json
{
  "event": "ticket.created",
  "timestamp": "2026-02-01T10:00:00Z",
  "data": {
    "ticket_id": "uuid",
    "title": "New ticket",
    "priority": "high",
    "customer_id": "uuid"
  }
}
```

#### ticket.updated
```json
{
  "event": "ticket.updated",
  "timestamp": "2026-02-01T10:30:00Z",
  "data": {
    "ticket_id": "uuid",
    "changes": {
      "status": { "old": "open", "new": "in_progress" },
      "assigned_to": { "old": null, "new": "agent-uuid" }
    }
  }
}
```

#### message.created
```json
{
  "event": "message.created",
  "timestamp": "2026-02-01T10:05:00Z",
  "data": {
    "message_id": "uuid",
    "ticket_id": "uuid",
    "content": "Message content",
    "is_internal": false
  }
}
```

### Verify Webhook Signature
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

---

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is invalid",
    "details": {
      "field": "email",
      "issue": "Email format is invalid"
    }
  }
}
```

### HTTP Status Codes
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid request
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Common Error Codes
- `INVALID_REQUEST`: Request validation failed
- `UNAUTHORIZED`: Invalid or expired token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource doesn't exist
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

---

## Rate Limiting

### Limits
- **Free Plan**: 100 requests/minute
- **Starter**: 500 requests/minute
- **Professional**: 2,000 requests/minute
- **Enterprise**: 10,000 requests/minute

### Rate Limit Headers
```http
X-RateLimit-Limit: 2000
X-RateLimit-Remaining: 1950
X-RateLimit-Reset: 1643723400
```

### Handling Rate Limits
```javascript
if (response.status === 429) {
  const resetTime = response.headers['X-RateLimit-Reset'];
  const waitTime = resetTime - Date.now() / 1000;
  await sleep(waitTime * 1000);
  // Retry request
}
```

---

## Code Examples

### JavaScript/TypeScript
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Create ticket
const { data: ticket } = await supabase
  .from('tickets')
  .insert({
    title: 'New issue',
    description: 'Description here',
    priority: 'high'
  })
  .select()
  .single();

// List tickets
const { data: tickets } = await supabase
  .from('tickets')
  .select('*')
  .eq('status', 'open')
  .order('created_at', { ascending: false });

// Update ticket
const { data: updated } = await supabase
  .from('tickets')
  .update({ status: 'resolved' })
  .eq('id', ticketId)
  .select()
  .single();

// Real-time subscription
const channel = supabase
  .channel('tickets')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'tickets'
  }, (payload) => {
    console.log('New ticket:', payload.new);
  })
  .subscribe();
```

### Python
```python
from supabase import create_client, Client

supabase: Client = create_client(
    "https://your-project.supabase.co",
    "your-anon-key"
)

# Login
auth_response = supabase.auth.sign_in_with_password({
    "email": "user@example.com",
    "password": "password"
})

# Create ticket
ticket = supabase.table('tickets').insert({
    "title": "New issue",
    "description": "Description here",
    "priority": "high"
}).execute()

# List tickets
tickets = supabase.table('tickets')\
    .select("*")\
    .eq('status', 'open')\
    .order('created_at', desc=True)\
    .execute()

# Update ticket
updated = supabase.table('tickets')\
    .update({"status": "resolved"})\
    .eq('id', ticket_id)\
    .execute()
```

### cURL
```bash
# Login
curl -X POST 'https://your-project.supabase.co/auth/v1/token?grant_type=password' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }'

# Create ticket
curl -X POST 'https://your-project.supabase.co/rest/v1/tickets' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "New issue",
    "description": "Description here",
    "priority": "high"
  }'

# List tickets
curl -X GET 'https://your-project.supabase.co/rest/v1/tickets?status=eq.open' \
  -H 'Authorization: Bearer YOUR_TOKEN'

# Update ticket
curl -X PATCH 'https://your-project.supabase.co/rest/v1/tickets?id=eq.TICKET_ID' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "resolved"
  }'
```

---

## Best Practices

1. **Always use HTTPS** for API requests
2. **Store tokens securely** - never in client-side code
3. **Implement retry logic** for failed requests
4. **Use pagination** for large datasets
5. **Cache responses** when appropriate
6. **Handle rate limits** gracefully
7. **Validate input** before sending requests
8. **Log errors** for debugging
9. **Use webhooks** for real-time updates
10. **Keep tokens fresh** - refresh before expiry

---

## Support

**API Issues**: api-support@privydesk.com  
**Documentation**: https://docs.privydesk.com  
**Status Page**: https://status.privydesk.com

---

**Last Updated:** February 1, 2026  
**API Version:** 2.0.0
