import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { GridPattern } from "@/components/ui/GridPattern";
import { Header } from "@/components/layout/Header";

export default function Blog() {
  const posts = [
    {
      title: "Introducing PrivyDesk: The Future of Customer Support",
      excerpt: "We're excited to announce the launch of PrivyDesk, a modern customer support platform built for the AI era.",
      author: "PrivyDesk Content Team",
      date: "January 30, 2026",
      readTime: "5 min read",
      category: "Product",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    },
    {
      title: "10 Best Practices for Customer Support Teams",
      excerpt: "Learn how top support teams deliver exceptional customer experiences with these proven strategies.",
      author: "PrivyDesk Content Team",
      date: "January 28, 2026",
      readTime: "8 min read",
      category: "Best Practices",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop",
    },
    {
      title: "How AI is Transforming Customer Support",
      excerpt: "Discover how artificial intelligence is revolutionizing the way businesses handle customer inquiries.",
      author: "PrivyDesk Content Team",
      date: "January 25, 2026",
      readTime: "6 min read",
      category: "Technology",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    },
    {
      title: "Building a Knowledge Base That Customers Love",
      excerpt: "A comprehensive guide to creating self-service resources that reduce support tickets and improve satisfaction.",
      author: "PrivyDesk Content Team",
      date: "January 22, 2026",
      readTime: "7 min read",
      category: "Guides",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop",
    },
    {
      title: "The ROI of Investing in Customer Support Software",
      excerpt: "Calculate the real return on investment when you upgrade your customer support infrastructure.",
      author: "PrivyDesk Content Team",
      date: "January 20, 2026",
      readTime: "10 min read",
      category: "Business",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    },
    {
      title: "Multi-Channel Support: Meeting Customers Where They Are",
      excerpt: "Why omnichannel support is essential for modern businesses and how to implement it effectively.",
      author: "PrivyDesk Content Team",
      date: "January 18, 2026",
      readTime: "6 min read",
      category: "Strategy",
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <section className="relative pt-32 pb-20 overflow-hidden">
        <GridPattern variant="grid" className="opacity-100" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              <span className="text-accent-lime">Blog</span> & Insights
            </h1>
            <p className="text-xl text-white/60">
              Latest updates, best practices, and industry insights
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {posts.map((post, index) => (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="premium-card overflow-hidden hover:scale-105 transition-transform"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-accent-lime text-black text-xs font-medium">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 line-clamp-2">{post.title}</h3>
                  <p className="text-white/60 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
                    <div className="flex items-center gap-1">
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-white/40">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </div>
                    <Link
                      to={`/blog/${post.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-accent-lime text-sm font-medium hover:underline flex items-center gap-1"
                    >
                      Read more <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
