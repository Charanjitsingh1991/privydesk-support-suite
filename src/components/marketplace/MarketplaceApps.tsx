import { useState, useEffect } from 'react';
import { Star, Download, Search } from 'lucide-react';
import { MarketplaceService } from '@/lib/services/marketplaceService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MarketplaceApp {
  id: string;
  name: string;
  description: string;
  category: string;
  logo_url: string;
  pricing_model: string;
  price_monthly: number | null;
  install_count: number;
  rating_average: number | null;
  rating_count: number;
}

export function MarketplaceApps({ organizationId }: { organizationId: string }) {
  const [apps, setApps] = useState<MarketplaceApp[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    setLoading(true);
    const data = await MarketplaceService.getMarketplaceApps({ 
      featured: true, 
      limit: 20 
    });
    setApps(data);
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadApps();
      return;
    }
    setLoading(true);
    const results = await MarketplaceService.searchApps(searchQuery);
    setApps(results);
    setLoading(false);
  };

  const handleInstall = async (appId: string) => {
    const userId = 'current-user-id'; // Get from auth context
    await MarketplaceService.installApp(organizationId, appId, userId);
    alert('App installed successfully!');
  };

  const categories = MarketplaceService.getCategories();

  const filteredApps = selectedCategory === 'all'
    ? apps
    : apps.filter(app => app.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">App Marketplace</h2>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Search apps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            size="sm"
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading apps...</div>
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No apps found
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredApps.map((app) => (
            <Card key={app.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <img
                    src={app.logo_url}
                    alt={app.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg">{app.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {app.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {app.rating_average?.toFixed(1) || 'N/A'}
                      </span>
                      <span className="text-muted-foreground">
                        ({app.rating_count})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Download className="h-4 w-4" />
                      {app.install_count}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="capitalize">
                      {app.pricing_model}
                    </Badge>
                    {app.price_monthly && (
                      <span className="text-sm font-medium">
                        ${app.price_monthly}/mo
                      </span>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleInstall(app.id)}
                  >
                    Install
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
