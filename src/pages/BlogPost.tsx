import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { Calendar, Clock, ArrowLeft, Share2, Bookmark } from "lucide-react";
import { GridPattern } from "@/components/ui/GridPattern";
import { Header } from "@/components/layout/Header";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { SEOHead } from "@/components/SEO/SEOHead";
import type { BlogPost } from "@/types/blog";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      
      if (error) throw error;
      
      // Increment view count
      await supabase
        .from('blog_posts')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);
      
      return data;
    },
    enabled: !!slug,
  });

  const articleSchema = post ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.featured_image,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "PrivyDesk",
      "logo": {
        "@type": "ImageObject",
        "url": "https://privydesk.com/logo.png"
      }
    },
    "datePublished": post.published_at,
    "dateModified": post.updated_at
  } : undefined;

  if (isLoading) {
    return (
      <>
        <SEOHead
          title="Loading... | PrivyDesk Blog"
          description="Loading blog post..."
        />
        <div className="min-h-screen bg-black text-white">
        <Header />
        <section className="relative pt-32 pb-20">
          <GridPattern variant="grid" className="opacity-100" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-accent-lime border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-white/60">Loading article...</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <section className="relative pt-32 pb-20">
          <GridPattern variant="grid" className="opacity-100" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-5xl font-bold mb-6">Article Not Found</h1>
            <p className="text-xl text-white/60 mb-8">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/blog">
              <button className="px-8 py-3 rounded-full bg-accent-lime text-black font-medium hover:bg-accent-lime/90 transition-colors">
                Back to Blog
              </button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const publishedDate = new Date(post.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <SEOHead
        title={`${post.title} | PrivyDesk Blog`}
        description={post.excerpt}
        keywords={post.meta_keywords || post.tags || []}
        ogImage={post.featured_image}
        jsonLd={articleSchema}
      />
      <div className="min-h-screen bg-black text-white">
      <Header />

      <article className="relative pt-32 pb-20 overflow-hidden">
        <GridPattern variant="grid" className="opacity-100" />
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <Link to="/blog" className="inline-flex items-center gap-2 text-accent-lime hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Category Badge */}
            <div className="mb-4">
              <span className="px-4 py-1.5 rounded-full bg-accent-lime/10 text-accent-lime text-sm font-medium border border-accent-lime/20">
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 mb-8 text-white/60">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {publishedDate}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.read_time}
              </div>
              <div className="text-sm">
                By {post.author}
              </div>
              {post.view_count > 0 && (
                <div className="text-sm">
                  {post.view_count.toLocaleString()} views
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-12">
              <button className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                Save
              </button>
            </div>

            {/* Featured Image */}
            {post.featured_image && (
              <div className="mb-12 rounded-2xl overflow-hidden">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Excerpt */}
            <div className="text-xl text-white/80 mb-12 pb-12 border-b border-white/10">
              {post.excerpt}
            </div>

            {/* Content */}
            <div className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-4xl font-bold mb-6 mt-12">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-3xl font-bold mb-4 mt-10">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-2xl font-bold mb-3 mt-8">{children}</h3>,
                  p: ({ children }) => <p className="text-white/80 mb-6 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-6 space-y-2 text-white/80">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-6 space-y-2 text-white/80">{children}</ol>,
                  li: ({ children }) => <li className="ml-4">{children}</li>,
                  a: ({ href, children }) => (
                    <a href={href} className="text-accent-lime hover:underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-accent-lime pl-6 italic my-6 text-white/60">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-white/5 px-2 py-1 rounded text-accent-lime font-mono text-sm">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-white/5 p-6 rounded-lg overflow-x-auto mb-6">
                      {children}
                    </pre>
                  ),
                  strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-6">
                      <table className="w-full border-collapse border border-white/10">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-white/10 px-4 py-2 bg-white/5 text-left font-bold">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-white/10 px-4 py-2 text-white/80">
                      {children}
                    </td>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Tags/Keywords */}
            {post.meta_keywords && post.meta_keywords.length > 0 && (
              <div className="mt-12 pt-12 border-t border-white/10">
                <h3 className="text-sm font-semibold text-white/60 mb-4">TAGS</h3>
                <div className="flex flex-wrap gap-2">
                  {post.meta_keywords.map((keyword: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-white/5 text-sm text-white/60 hover:bg-white/10 transition-colors"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Section */}
            <div className="mt-16 premium-card p-8 bg-gradient-to-br from-accent-lime/10 to-transparent border-accent-lime/20 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Customer Support?</h3>
              <p className="text-white/60 mb-6">
                Join thousands of teams using PrivyDesk to deliver exceptional customer experiences.
              </p>
              <Link to="/auth/signup">
                <button className="px-8 py-3 rounded-full bg-accent-lime text-black font-medium hover:bg-accent-lime/90 transition-colors">
                  Get Started Free
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </article>
      </div>
    </>
  );
}
