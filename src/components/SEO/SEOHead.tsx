import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  jsonLd?: object;
}

export function SEOHead({
  title = 'PrivyDesk - AI-Powered Customer Support Platform',
  description = 'Transform your customer support with PrivyDesk. AI-powered ticketing, omnichannel support, real-time analytics, and seamless integrations. Start free today.',
  keywords = [
    'customer support software',
    'helpdesk software',
    'ticketing system',
    'AI customer service',
    'support ticket system',
    'customer service platform',
    'help desk solution',
    'customer support automation',
    'omnichannel support',
    'customer service software',
  ],
  ogImage = 'https://privydesk.com/og-image.png',
  ogType = 'website',
  canonical,
  noindex = false,
  nofollow = false,
  jsonLd,
}: SEOHeadProps) {
  const fullTitle = title.includes('PrivyDesk') ? title : `${title} | PrivyDesk`;
  const currentUrl = canonical || `https://privydesk.com${window.location.pathname}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <link rel="canonical" href={currentUrl} />

      {/* Robots Meta */}
      {(noindex || nofollow) && (
        <meta
          name="robots"
          content={`${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`}
        />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="PrivyDesk" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:creator" content="@PrivyDesk" />
      <meta name="twitter:site" content="@PrivyDesk" />

      {/* Additional SEO Tags */}
      <meta name="author" content="PrivyDesk" />
      <meta name="publisher" content="PrivyDesk" />
      <meta name="application-name" content="PrivyDesk" />
      <meta name="apple-mobile-web-app-title" content="PrivyDesk" />

      {/* Geo Tags */}
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />

      {/* Language */}
      <meta httpEquiv="content-language" content="en-US" />

      {/* Mobile */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* Structured Data (JSON-LD) */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}

// Predefined structured data schemas
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'PrivyDesk',
  url: 'https://privydesk.com',
  logo: 'https://privydesk.com/icons/icon-512x512.png',
  description: 'AI-powered customer support platform for modern businesses',
  foundingDate: '2026',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-XXX-XXX-XXXX',
    contactType: 'Customer Support',
    email: 'support@privydesk.com',
    availableLanguage: ['English'],
  },
  sameAs: [
    'https://twitter.com/privydesk',
    'https://linkedin.com/company/privydesk',
    'https://github.com/privydesk',
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US',
  },
};

export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PrivyDesk',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    priceValidUntil: '2026-12-31',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '250',
    bestRating: '5',
    worstRating: '1',
  },
  description: 'AI-powered customer support platform with ticketing, live chat, and analytics',
  screenshot: 'https://privydesk.com/screenshots/dashboard.png',
  featureList: [
    'AI-Powered Ticketing',
    'Omnichannel Support',
    'Real-Time Analytics',
    'Team Collaboration',
    'API Integration',
    'Mobile Support',
  ],
};

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const articleSchema = (article: {
  title: string;
  description: string;
  author: string;
  publishDate: string;
  modifiedDate?: string;
  image?: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.title,
  description: article.description,
  image: article.image || 'https://privydesk.com/og-image.png',
  datePublished: article.publishDate,
  dateModified: article.modifiedDate || article.publishDate,
  author: {
    '@type': 'Organization',
    name: article.author,
  },
  publisher: {
    '@type': 'Organization',
    name: 'PrivyDesk',
    logo: {
      '@type': 'ImageObject',
      url: 'https://privydesk.com/icons/icon-512x512.png',
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': article.url,
  },
});

export const faqSchema = (faqs: { question: string; answer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});
