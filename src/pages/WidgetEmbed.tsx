import { useParams } from 'react-router-dom';
import { ChatWidget } from '@/components/widget/ChatWidget';

export default function WidgetEmbed() {
  const { orgId } = useParams<{ orgId: string }>();

  if (!orgId) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent">
        <p className="text-muted-foreground">Invalid widget configuration</p>
      </div>
    );
  }

  return (
    <div className="bg-transparent">
      <ChatWidget orgId={orgId} />
    </div>
  );
}
