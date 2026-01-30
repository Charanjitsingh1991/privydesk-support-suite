import { useState, useEffect } from 'react';
import { Search, Plus, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';
import { KnowledgeBaseService } from '@/lib/services/knowledgeBaseService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface KBArticle {
  id: string;
  title: string;
  excerpt: string;
  category_id: string;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  status: string;
  created_at: string;
}

export function KnowledgeBaseList({ organizationId }: { organizationId: string }) {
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, [organizationId]);

  const loadArticles = async () => {
    setLoading(true);
    const data = await KnowledgeBaseService.getPublishedArticles(organizationId);
    setArticles(data);
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadArticles();
      return;
    }
    setLoading(true);
    const results = await KnowledgeBaseService.searchArticles(organizationId, searchQuery);
    setArticles(results);
    setLoading(false);
  };

  const handleVote = async (articleId: string, helpful: boolean) => {
    await KnowledgeBaseService.voteArticle(articleId, helpful);
    loadArticles();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Knowledge Base</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Article
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading articles...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No articles found
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {article.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {article.view_count}
                    </span>
                    <button
                      onClick={() => handleVote(article.id, true)}
                      className="flex items-center gap-1 hover:text-green-600"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {article.helpful_count}
                    </button>
                    <button
                      onClick={() => handleVote(article.id, false)}
                      className="flex items-center gap-1 hover:text-red-600"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      {article.not_helpful_count}
                    </button>
                  </div>
                  <Badge variant="secondary">{article.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
