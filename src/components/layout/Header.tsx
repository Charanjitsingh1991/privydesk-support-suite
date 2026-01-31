import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Ticket, ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/services", label: "Services" },
    { to: "/pricing", label: "Pricing" },
    { to: "/resources", label: "Resources" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-glass bg-black/80 border-b border-white/5"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              className="w-12 h-12 rounded-xl bg-accent-lime flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
            >
              <Ticket className="w-6 h-6 text-black" />
            </motion.div>
            <span className="text-2xl font-bold text-white">PrivyDesk</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 px-2 py-2 rounded-full bg-white/5 border border-white/10">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "text-white bg-white/10"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth/login">
              <button className="px-6 py-2.5 rounded-full text-white font-medium hover:bg-white/5 transition-colors">
                Sign In
              </button>
            </Link>
            <Link to="/auth/signup">
              <motion.button
                className="px-6 py-2.5 rounded-full bg-accent-lime text-black font-medium hover:bg-accent-lime/90 transition-colors flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-white/5"
          >
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? "text-white bg-white/10"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-4">
                <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full px-6 py-2.5 rounded-full text-white font-medium bg-white/5 hover:bg-white/10 transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link to="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full px-6 py-2.5 rounded-full bg-accent-lime text-black font-medium hover:bg-accent-lime/90 transition-colors">
                    Get Started
                  </button>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
