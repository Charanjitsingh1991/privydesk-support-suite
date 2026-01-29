import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Mail } from 'lucide-react';
import type { WidgetConfig } from '@/types/widget';

interface OfflineFormProps {
  config: WidgetConfig;
  onSubmit: (data: { name: string; email: string; subject: string; message: string }) => void;
  isLoading?: boolean;
}

export function OfflineForm({ config, onSubmit, isLoading }: OfflineFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: `${config.primary_color}20` }}
        >
          <Mail className="w-8 h-8" style={{ color: config.primary_color }} />
        </div>
        <h3 className="font-semibold text-lg mb-2">Message Sent!</h3>
        <p className="text-sm text-muted-foreground">
          We've received your message and will get back to you as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full p-4">
      <div className="text-center mb-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ backgroundColor: `${config.primary_color}20` }}
        >
          <Clock className="w-6 h-6" style={{ color: config.primary_color }} />
        </div>
        <h3 className="font-semibold">We're currently offline</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {config.offline_message}
        </p>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        <div className="space-y-1">
          <Label htmlFor="name" className="text-xs">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            placeholder="Your name"
            className={`h-9 ${errors.name ? 'border-destructive' : ''}`}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="email" className="text-xs">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            placeholder="your@email.com"
            className={`h-9 ${errors.email ? 'border-destructive' : ''}`}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="subject" className="text-xs">Subject *</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => {
              setFormData({ ...formData, subject: e.target.value });
              if (errors.subject) setErrors({ ...errors, subject: '' });
            }}
            placeholder="How can we help?"
            className={`h-9 ${errors.subject ? 'border-destructive' : ''}`}
          />
          {errors.subject && (
            <p className="text-xs text-destructive">{errors.subject}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="message" className="text-xs">Message *</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => {
              setFormData({ ...formData, message: e.target.value });
              if (errors.message) setErrors({ ...errors, message: '' });
            }}
            placeholder="Describe your issue..."
            rows={4}
            className={errors.message ? 'border-destructive' : ''}
          />
          {errors.message && (
            <p className="text-xs text-destructive">{errors.message}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full mt-4"
        style={{ backgroundColor: config.primary_color }}
        disabled={isLoading}
      >
        {isLoading ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}
