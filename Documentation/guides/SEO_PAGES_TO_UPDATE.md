# Pages That Need SEO Integration

## ✅ Completed
- [x] Homepage (Index.tsx) - Has SEO with structured data

## 📋 To Add SEO Components

Copy the import and component usage from the examples below to each page:

### Import Statement (add to top of file):
```tsx
import { SEOHead } from '@/components/SEO/SEOHead';
```

### Wrap return statement:
```tsx
return (
  <>
    <SEOHead ... />
    <div className="...">
      {/* existing content */}
    </div>
  </>
);
```

---

## Pages to Update:

### 1. Pricing.tsx ⏳
```tsx
<SEOHead
  title="Pricing Plans - Affordable Customer Support Software | PrivyDesk"
  description="Transparent pricing for PrivyDesk. Start free with Starter plan at $29/month. Professional at $79/month. Enterprise from $199/month. No per-agent fees."
  keywords={['helpdesk pricing', 'customer support software pricing', 'affordable helpdesk', 'ticketing system cost', 'support software plans']}
/>
```

### 2. Blog.tsx ⏳
```tsx
<SEOHead
  title="Customer Support Blog - Tips, Guides & Best Practices | PrivyDesk"
  description="Expert insights on customer support, helpdesk management, AI automation, and team productivity. Learn from industry leaders."
  keywords={['customer support blog', 'helpdesk tips', 'support best practices', 'customer service guides']}
/>
```

### 3. BlogPost.tsx ⏳
```tsx
import { SEOHead, articleSchema } from '@/components/SEO/SEOHead';

// Inside component, after fetching post:
<SEOHead
  title={post?.meta_title || post?.title || 'Blog Post'}
  description={post?.meta_description || post?.excerpt || ''}
  keywords={post?.meta_keywords || []}
  ogImage={post?.featured_image}
  canonical={`https://privydesk.com/blog/${post?.slug}`}
  jsonLd={post ? articleSchema({
    title: post.title,
    description: post.excerpt,
    author: post.author,
    publishDate: post.published_at,
    url: `https://privydesk.com/blog/${post.slug}`,
    image: post.featured_image,
  }) : undefined}
/>
```

### 4. Documentation.tsx ⏳
```tsx
<SEOHead
  title="Documentation - PrivyDesk Help Center & User Guide"
  description="Complete documentation for PrivyDesk. Learn how to set up, configure, and optimize your customer support platform."
  keywords={['privydesk documentation', 'helpdesk setup guide', 'customer support docs', 'user manual']}
/>
```

### 5. Support.tsx ⏳
```tsx
import { SEOHead, faqSchema } from '@/components/SEO/SEOHead';

<SEOHead
  title="Support & Help Center - Get Help with PrivyDesk"
  description="Get help with PrivyDesk. Browse FAQs, contact support, and find answers to common questions."
  keywords={['privydesk support', 'helpdesk help', 'customer service faq', 'technical support']}
  jsonLd={faqSchema(faqs.map(faq => ({
    question: faq.question,
    answer: faq.answer,
  })))}
/>
```

### 6. About.tsx ⏳
```tsx
<SEOHead
  title="About Us - Meet the PrivyDesk Team"
  description="Learn about PrivyDesk's mission to transform customer support with AI-powered solutions. Meet our team and discover our story."
  keywords={['about privydesk', 'customer support company', 'helpdesk team', 'company mission']}
/>
```

### 7. Contact.tsx ⏳
```tsx
<SEOHead
  title="Contact Us - Get in Touch with PrivyDesk"
  description="Contact PrivyDesk for sales inquiries, support, or partnership opportunities. We're here to help."
  keywords={['contact privydesk', 'customer support contact', 'sales inquiry', 'get in touch']}
/>
```

### 8. Features.tsx ⏳
```tsx
<SEOHead
  title="Features - Powerful Customer Support Tools | PrivyDesk"
  description="Explore PrivyDesk features: AI-powered ticketing, omnichannel support, real-time analytics, team collaboration, and more."
  keywords={['helpdesk features', 'customer support tools', 'ticketing features', 'support software capabilities']}
/>
```

### 9. Login.tsx ⏳
```tsx
<SEOHead
  title="Login - PrivyDesk"
  description="Sign in to your PrivyDesk account"
  noindex={true}
  nofollow={true}
/>
```

### 10. Signup.tsx ⏳
```tsx
<SEOHead
  title="Sign Up - Create Your PrivyDesk Account"
  description="Create your free PrivyDesk account and start transforming your customer support today."
  noindex={true}
  nofollow={true}
/>
```

### 11. Documentation Sub-pages:

#### docs/GettingStarted.tsx
```tsx
<SEOHead
  title="Getting Started Guide - PrivyDesk Documentation"
  description="Quick start guide for PrivyDesk. Learn how to set up your account, invite team members, and start managing support tickets."
  keywords={['getting started', 'privydesk setup', 'quick start guide', 'helpdesk onboarding']}
/>
```

#### docs/UserManagement.tsx
```tsx
<SEOHead
  title="User Management - PrivyDesk Documentation"
  description="Learn how to manage team members, roles, permissions, and SSO in PrivyDesk."
  keywords={['user management', 'team roles', 'permissions', 'SSO setup']}
/>
```

#### docs/TicketManagement.tsx
```tsx
<SEOHead
  title="Ticket Management - PrivyDesk Documentation"
  description="Master ticket workflows, automation rules, and SLA policies in PrivyDesk."
  keywords={['ticket management', 'support workflows', 'ticket automation', 'SLA policies']}
/>
```

#### docs/APIIntegration.tsx
```tsx
<SEOHead
  title="API Integration - PrivyDesk Documentation"
  description="Integrate PrivyDesk with your applications using our REST API, webhooks, and SDKs."
  keywords={['API integration', 'REST API', 'webhooks', 'API documentation']}
/>
```

#### docs/Configuration.tsx
```tsx
<SEOHead
  title="Configuration Guide - PrivyDesk Documentation"
  description="Configure email settings, chat widgets, custom domains, and branding in PrivyDesk."
  keywords={['configuration', 'email setup', 'chat widget', 'custom domain', 'branding']}
/>
```

#### docs/Analytics.tsx
```tsx
<SEOHead
  title="Analytics & Reporting - PrivyDesk Documentation"
  description="Learn how to use PrivyDesk analytics, create custom reports, and export data."
  keywords={['analytics', 'reporting', 'data export', 'performance metrics']}
/>
```

---

## Implementation Instructions:

1. Open each file listed above
2. Add the import statement at the top
3. Wrap the return statement with `<>` and `</>`
4. Add the `<SEOHead>` component right after the opening `<>`
5. Ensure the closing `</>` is at the end before the closing `;`
6. Save and test

## Testing:
After implementation, verify:
- No TypeScript errors
- Page titles update correctly
- Meta descriptions appear in page source
- Open Graph tags work (test with Facebook Debugger)
- No console errors
