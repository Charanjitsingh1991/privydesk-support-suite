import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Ticket, ArrowRight, Calendar, User, Clock } from "lucide-react";
import { GridPattern } from "@/components/ui/GridPattern";

export default function Blog() {
  const posts = [
    {
      title: "Introducing PrivyDesk: The Future of Customer Support",
      excerpt: "We're excited to announce the launch of PrivyDesk, a modern customer support platform built for the AI era.",
      author: "John Doe",
      date: "January 30, 2026",
      readTime: "5 min read",
      category: "Product",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    },
    {
      title: "10 Best Practices for Customer Support Teams",
      excerpt: "Learn how top support teams deliver exceptional customer experiences with these proven strategies.",
      author: "Jane Smith",
      date: "January 28, 2026",
      readTime: "8 min read",
      category: "Best Practices",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop",
    },
    {
      title: "How AI is Transforming Customer Support",
      excerpt: "Discover how artificial intelligence is revolutionizing the way businesses handle customer inquiries.",
      author: "Mike Johnson",
      date: "January 25, 2026",
      readTime: "6 min read",
      category: "Technology",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    },
    {
      title: "Building a Knowledge Base That Customers Love",
      excerpt: "A comprehensive guide to creating self-service resources that reduce support tickets and improve satisfaction.",
      author: "Sarah Williams",
      date: "January 22, 2026",
      readTime: "7 min read",
      category: "Guides",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop",
    },
    {
      title: "The ROI of Investing in Customer Support Software",
      excerpt: "Calculate the real return on investment when you upgrade your customer support infrastructure.",
      author: "David Brown",
      date: "January 20, 2026",
      readTime: "10 min read",
      category: "Business",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    },
    {
      title: "Multi-Channel Support: Meeting Customers Where They Are",
      excerpt: "Why omnichannel support is essential for modern businesses and how to implement it effectively.",
      author: "Emily Davis",
      date: "January 18, 2026",
      readTime: "6 min read",
      category: "Strategy",
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-glass bg-black/80 border-b border-white/5"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent-lime flex items-center justify-center">
                <Ticket className="w-6 h-6 text-black" />
              </div>
              <span className="font-bold text-2xl">PRIVYDESK</span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-1 px-2 py-2 rounded-full bg-white/5 border border-white/10">
              <Link to="/" className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Home</Link>
              <Link to="/resources" className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Resources</Link>
              <Link to="/blog" className="px-4 py-2 rounded-full text-sm font-medium text-white bg-white/10 transition-colors">Blog</Link>
            </nav>
            
            <Link to="/auth/signup">
              <button className="px-6 py-2.5 rounded-full bg-accent-lime text-black font-medium text-sm hover:bg-accent-lime/90 transition-colors flex items-center">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </motion.header>

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
                      <User className="w-3 h-3" />
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
