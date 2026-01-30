import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Ticket, ArrowRight, Cookie } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CookiePolicy() {
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false,
  });

  const saveCookiePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
    alert('Cookie preferences saved!');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <motion.header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-glass bg-black/80 border-b border-white/5" initial={{ y: -100 }} animate={{ y: 0 }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent-lime flex items-center justify-center">
                <Ticket className="w-6 h-6 text-black" />
              </div>
              <span className="font-bold text-2xl">PRIVYDESK</span>
            </Link>
            <Link to="/auth/signup">
              <button className="px-6 py-2.5 rounded-full bg-accent-lime text-black font-medium text-sm hover:bg-accent-lime/90 transition-colors flex items-center">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 pt-32 pb-20 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-4">
            <Cookie className="w-12 h-12 text-accent-lime" />
            <h1 className="text-5xl font-bold">Cookie Policy</h1>
          </div>
          <p className="text-white/60 mb-12">Last updated: January 31, 2026</p>

          <div className="space-y-8 text-white/80">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">What Are Cookies?</h2>
              <p className="mb-4">
                Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">Types of Cookies We Use</h2>
              
              <div className="space-y-6">
                <div className="premium-card p-6">
                  <h3 className="text-xl font-bold mb-2 text-white">1. Necessary Cookies (Required)</h3>
                  <p className="mb-3">Essential for the website to function properly. These cannot be disabled.</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Authentication and session management</li>
                    <li>Security features</li>
                    <li>Load balancing</li>
                  </ul>
                </div>

                <div className="premium-card p-6">
                  <h3 className="text-xl font-bold mb-2 text-white">2. Functional Cookies</h3>
                  <p className="mb-3">Remember your preferences and settings.</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Language preferences</li>
                    <li>Theme settings (dark/light mode)</li>
                    <li>Dashboard customization</li>
                  </ul>
                </div>

                <div className="premium-card p-6">
                  <h3 className="text-xl font-bold mb-2 text-white">3. Analytics Cookies</h3>
                  <p className="mb-3">Help us understand how visitors interact with our website.</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Page views and navigation patterns</li>
                    <li>Feature usage statistics</li>
                    <li>Performance monitoring</li>
                  </ul>
                </div>

                <div className="premium-card p-6">
                  <h3 className="text-xl font-bold mb-2 text-white">4. Marketing Cookies</h3>
                  <p className="mb-3">Used to deliver relevant advertisements and track campaign effectiveness.</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Targeted advertising</li>
                    <li>Social media integration</li>
                    <li>Conversion tracking</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="premium-card p-8 bg-accent-lime/5 border border-accent-lime/20">
              <h2 className="text-2xl font-bold mb-6 text-white">Manage Your Cookie Preferences</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-white">Necessary Cookies</h4>
                    <p className="text-sm text-white/60">Always active - Required for basic functionality</p>
                  </div>
                  <input type="checkbox" checked disabled className="w-5 h-5" />
                </div>

                <div className="flex items-center justify-between p-4 bg-black/50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-white">Functional Cookies</h4>
                    <p className="text-sm text-white/60">Remember your preferences</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={cookiePreferences.functional}
                    onChange={(e) => setCookiePreferences({...cookiePreferences, functional: e.target.checked})}
                    className="w-5 h-5" 
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-black/50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-white">Analytics Cookies</h4>
                    <p className="text-sm text-white/60">Help us improve our service</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={cookiePreferences.analytics}
                    onChange={(e) => setCookiePreferences({...cookiePreferences, analytics: e.target.checked})}
                    className="w-5 h-5" 
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-black/50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-white">Marketing Cookies</h4>
                    <p className="text-sm text-white/60">Personalized advertising</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={cookiePreferences.marketing}
                    onChange={(e) => setCookiePreferences({...cookiePreferences, marketing: e.target.checked})}
                    className="w-5 h-5" 
                  />
                </div>
              </div>

              <Button 
                onClick={saveCookiePreferences}
                className="w-full mt-6 bg-accent-lime hover:bg-accent-lime/90 text-black font-medium"
              >
                Save Preferences
              </Button>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">Third-Party Cookies</h2>
              <p className="mb-4">We use services from trusted third parties that may set cookies:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Supabase:</strong> Authentication and database services</li>
                <li><strong>Stripe:</strong> Payment processing</li>
                <li><strong>Google Analytics:</strong> Website analytics (if enabled)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">How to Control Cookies</h2>
              <p className="mb-4">You can control cookies through:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Our cookie preference center (above)</li>
                <li>Your browser settings</li>
                <li>Browser extensions for cookie management</li>
              </ul>
              <p className="mt-4 text-sm text-white/60">
                Note: Disabling necessary cookies may affect website functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">Contact Us</h2>
              <p>
                Questions about our cookie policy? Contact us at{' '}
                <a href="mailto:privacy@privydesk.com" className="text-accent-lime hover:underline">
                  privacy@privydesk.com
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
