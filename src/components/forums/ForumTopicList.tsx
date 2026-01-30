import { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, CheckCircle2, Plus } from 'lucide-react';
import { ForumService } from '@/lib/services/forumService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  author_id: string;
  reply_count: number;
  vote_count: number;
  is_solved: boolean;
  is_pinned: boolean;
  created_at: string;
}

export function ForumTopicList({ organizationId }: { organizationId: string }) {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopics();
  }, [organizationId]);

  const loadTopics = async () => {
    setLoading(true);
    const data = await ForumService.getTopics(organizationId);
    setTopics(data);
    setLoading(false);
  };

  const handleVote = async (topicId: string) => {
    await ForumService.voteTopic(topicId, true);
    loadTopics();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Community Forum</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Topic
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading topics...</div>
      ) : topics.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No topics found
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <Card key={topic.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {topic.title}
                      {topic.is_solved && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-2">
                      {topic.content}
                    </CardDescription>
                  </div>
                  {topic.is_pinned && (
                    <Badge variant="secondary">Pinned</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <button
                    onClick={() => handleVote(topic.id)}
                    className="flex items-center gap-1 hover:text-lime-600"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {topic.vote_count} votes
                  </button>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {topic.reply_count} replies
                  </span>
                  <span className="text-xs">
                    {new Date(topic.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
