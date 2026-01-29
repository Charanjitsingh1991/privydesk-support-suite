import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Code,
  Eye,
  Edit3,
  Quote,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your message...',
  minHeight = '150px',
  maxLength,
  disabled = false,
  className,
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = useCallback(
    (prefix: string, suffix: string = prefix) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const newText =
        value.substring(0, start) +
        prefix +
        selectedText +
        suffix +
        value.substring(end);

      onChange(newText);

      // Reset cursor position
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + prefix.length + selectedText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [value, onChange]
  );

  const formatActions = [
    { icon: Bold, label: 'Bold', action: () => insertMarkdown('**') },
    { icon: Italic, label: 'Italic', action: () => insertMarkdown('_') },
    { icon: Code, label: 'Code', action: () => insertMarkdown('`') },
    { icon: Quote, label: 'Quote', action: () => insertMarkdown('\n> ', '\n') },
    { icon: List, label: 'Bullet List', action: () => insertMarkdown('\n- ', '\n') },
    { icon: ListOrdered, label: 'Numbered List', action: () => insertMarkdown('\n1. ', '\n') },
    { icon: Link2, label: 'Link', action: () => insertMarkdown('[', '](url)') },
  ];

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded">$1</code>')
      .replace(/^> (.*)$/gm, '<blockquote class="border-l-4 border-primary pl-4 italic">$1</blockquote>')
      .replace(/^- (.*)$/gm, '<li>$1</li>')
      .replace(/^\d+\. (.*)$/gm, '<li>$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline">$1</a>')
      .replace(/\n/g, '<br />');

    return html;
  };

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'write' | 'preview')}>
        <div className="flex items-center justify-between border-b bg-muted/30 px-2">
          <div className="flex items-center gap-1 py-1">
            {formatActions.map((action, index) => (
              <Button
                key={index}
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={action.action}
                disabled={disabled || activeTab === 'preview'}
                title={action.label}
              >
                <action.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
          <TabsList className="h-8 bg-transparent">
            <TabsTrigger value="write" className="h-7 text-xs gap-1">
              <Edit3 className="h-3 w-3" />
              Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="h-7 text-xs gap-1">
              <Eye className="h-3 w-3" />
              Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="write" className="m-0">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="border-0 rounded-none focus-visible:ring-0 resize-none"
            style={{ minHeight }}
            maxLength={maxLength}
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0">
          <div
            className="p-3 prose prose-sm dark:prose-invert max-w-none"
            style={{ minHeight }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(value) || '<span class="text-muted-foreground">Nothing to preview</span>' }}
          />
        </TabsContent>
      </Tabs>

      {maxLength && (
        <div className="flex justify-end px-3 py-1 border-t bg-muted/30">
          <span className={cn('text-xs', value.length > maxLength * 0.9 ? 'text-warning' : 'text-muted-foreground')}>
            {value.length}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
}
