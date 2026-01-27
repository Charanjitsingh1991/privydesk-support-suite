import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageCircle } from 'lucide-react';
import type { PreChatFormData, WidgetConfig } from '@/types/widget';

interface PreChatFormProps {
  config: WidgetConfig;
  onSubmit: (data: PreChatFormData) => void;
  isLoading?: boolean;
}

export function PreChatForm({ config, onSubmit, isLoading }: PreChatFormProps) {
  const [formData, setFormData] = useState<PreChatFormData>({
    name: '',
    email: '',
    topic: config.topics[0] || 'General Question',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full p-4">
      <div className="text-center mb-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ backgroundColor: config.primary_color }}
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-semibold text-lg">How can we help you?</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Fill out the form below to start a conversation
        </p>
      </div>

      <div className="space-y-4 flex-1">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            placeholder="Your name"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            placeholder="your@email.com"
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="topic">Topic</Label>
          <Select
            value={formData.topic}
            onValueChange={(value) => setFormData({ ...formData, topic: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a topic" />
            </SelectTrigger>
            <SelectContent>
              {config.topics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message (optional)</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Describe your issue..."
            rows={3}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full mt-4"
        style={{ backgroundColor: config.primary_color }}
        disabled={isLoading}
      >
        {isLoading ? 'Starting chat...' : 'Start Chat'}
      </Button>
    </form>
  );
}
