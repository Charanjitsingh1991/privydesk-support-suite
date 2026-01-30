# PrivyDesk Admin & Super Admin Capabilities

## Overview
PrivyDesk has a comprehensive role-based access control (RBAC) system with multiple admin levels to manage the entire platform.

---

## Role Hierarchy

### 1. **Super Admin (Platform Owner)**
The highest level of access - manages the entire PrivyDesk platform across all organizations.

#### Capabilities:
- ✅ **Full Platform Management**
  - View and manage ALL organizations on the platform
  - Access any organization's data and settings
  - Create, suspend, or delete organizations
  - Override any organization-level settings

- ✅ **User Management**
  - View all users across all organizations
  - Impersonate users for support purposes
  - Reset passwords and unlock accounts
  - Manage user roles and permissions globally

- ✅ **Billing & Subscriptions**
  - View all subscription plans and payments
  - Upgrade/downgrade any organization
  - Apply discounts and credits
  - Manage payment disputes

- ✅ **System Configuration**
  - Configure global platform settings
  - Manage feature flags
  - Control API rate limits
  - Configure email templates
  - Manage integrations (Stripe, Twilio, etc.)

- ✅ **Security & Compliance**
  - Access all audit logs
  - Review security incidents
  - Manage IP whitelists/blacklists
  - Handle GDPR requests
  - Export data for compliance

- ✅ **Support Management**
  - Access platform support chatbox
  - View all support tickets from users
  - Respond to user inquiries
  - Escalate critical issues

- ✅ **Analytics & Monitoring**
  - View platform-wide analytics
  - Monitor system health
  - Track usage metrics across all orgs
  - Generate revenue reports

---

### 2. **Organization Admin (Org Owner)**
Manages a specific organization's workspace and settings.

#### Capabilities:
- ✅ **Organization Management**
  - Configure organization settings
  - Manage branding and white-label
  - Set up custom domains
  - Configure SSO (SAML, OAuth)

- ✅ **Team Management**
  - Invite and remove team members
  - Assign roles (Admin, Agent, Viewer)
  - Manage team permissions
  - View team performance

- ✅ **Ticket Management**
  - View all tickets in organization
  - Assign tickets to agents
  - Set SLA policies
  - Create automation rules
  - Manage ticket templates

- ✅ **Customer Management**
  - View all customers
  - Manage customer data
  - Export customer lists
  - Handle data deletion requests

- ✅ **Settings & Configuration**
  - Configure email integration
  - Set up chat widgets
  - Manage API keys
  - Configure webhooks
  - Set business hours

- ✅ **Billing (Org Level)**
  - View subscription plan
  - Update payment methods
  - View invoices
  - Manage add-ons

- ✅ **Analytics (Org Level)**
  - View organization analytics
  - Generate reports
  - Track team performance
  - Monitor SLA compliance

---

### 3. **Agent (Support Staff)**
Handles customer support tickets and inquiries.

#### Capabilities:
- ✅ **Ticket Handling**
  - View assigned tickets
  - Respond to tickets
  - Update ticket status
  - Add internal notes
  - Use canned responses

- ✅ **Customer Interaction**
  - Chat with customers (live chat)
  - Send emails
  - View customer history
  - Add customer notes

- ✅ **Knowledge Base**
  - Create and edit articles
  - Organize categories
  - Publish content

- ✅ **Limited Settings**
  - Update personal profile
  - Set notification preferences
  - View team members

---

### 4. **Viewer (Read-Only)**
Limited access for stakeholders who need visibility.

#### Capabilities:
- ✅ **View Only**
  - View tickets (no editing)
  - View analytics
  - View reports
  - View customer data

- ❌ **Cannot:**
  - Create or modify tickets
  - Change settings
  - Manage users
  - Access billing

---

## Platform Support Chatbox System

### For Users (Customers):
- **Access:** Available on all pages via floating chat button
- **Features:**
  - Real-time chat with platform support
  - File attachments
  - Ticket creation from chat
  - Chat history
  - Offline message support

### For Super Admin (Platform Support):
- **Admin Panel Access:** Dedicated support inbox
- **Features:**
  - View all incoming support chats
  - Respond in real-time
  - Assign chats to support team
  - View user context (org, plan, usage)
  - Create tickets from chats
  - Access user's organization data
  - View chat analytics

---

## Database Schema

### Users Table
```sql
- id (uuid)
- email (text)
- full_name (text)
- role (enum: 'super_admin', 'org_admin', 'agent', 'viewer')
- organization_id (uuid) -- null for super_admin
- is_active (boolean)
- last_login (timestamp)
```

### Organizations Table
```sql
- id (uuid)
- name (text)
- plan (enum: 'starter', 'professional', 'enterprise')
- status (enum: 'active', 'suspended', 'cancelled')
- owner_id (uuid)
- created_at (timestamp)
```

### Platform Support Chats Table
```sql
- id (uuid)
- user_id (uuid)
- organization_id (uuid)
- admin_id (uuid) -- assigned super admin
- status (enum: 'open', 'in_progress', 'resolved')
- priority (enum: 'low', 'medium', 'high', 'urgent')
- created_at (timestamp)
```

---

## Current Implementation Status

### ✅ Implemented:
- Multi-tenant architecture with organization isolation
- Role-based access control (RBAC)
- Organization admin capabilities
- Agent and viewer roles
- Audit logging
- Custom roles service

### ⚠️ Partially Implemented:
- Super admin dashboard (needs UI)
- Platform support chatbox (backend ready, UI pending)
- Organization management UI for super admin

### ❌ Not Yet Implemented:
- Super admin panel UI
- Platform support chatbox UI
- User impersonation feature
- Global analytics dashboard for super admin
- Organization suspension/activation UI

---

## Next Steps

1. **Create Super Admin Dashboard**
   - Organization list with search/filter
   - User management across all orgs
   - Platform analytics
   - Support ticket queue

2. **Build Platform Support Chatbox**
   - Floating chat widget for users
   - Admin inbox for super admin
   - Real-time messaging with Supabase
   - File upload support

3. **Implement User Impersonation**
   - Allow super admin to log in as any user
   - Audit trail for impersonation
   - Clear indicators when impersonating

4. **Create Organization Management UI**
   - Create/edit/delete organizations
   - Suspend/activate organizations
   - View organization details
   - Manage subscriptions

---

**Last Updated:** January 31, 2026  
**Status:** Documentation Complete - Implementation In Progress
