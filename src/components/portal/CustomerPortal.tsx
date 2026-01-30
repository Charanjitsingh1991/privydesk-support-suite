import { useState } from 'react';
import { MessageSquare, BookOpen, HelpCircle, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export function CustomerPortal() {
  const [searchQuery, setSearchQuery] = useState('');

  const myTickets = [
    { id: 'TKT-1001', title: 'Cannot access dashboard', status: 'open', updated: '2 hours ago' },
    { id: 'TKT-0998', title: 'Billing question', status: 'resolved', updated: '1 day ago' },
  ];

  const popularArticles = [
    { id: '1', title: 'How to reset your password', views: 1234 },
    { id: '2', title: 'Getting started guide', views: 987 },
    { id: '3', title: 'Billing and payments FAQ', views: 756 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Support Portal</h1>
            <Button variant="outline">Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">How can we help you?</h2>
            <p className="text-muted-foreground mb-6">
              Search our knowledge base or submit a support ticket
            </p>
            <div className="relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageSquare className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Submit a Ticket</CardTitle>
                <CardDescription>Get help from our support team</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Knowledge Base</CardTitle>
                <CardDescription>Browse help articles and guides</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <HelpCircle className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Community Forum</CardTitle>
                <CardDescription>Ask questions and share tips</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Tabs defaultValue="tickets">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tickets">My Tickets</TabsTrigger>
              <TabsTrigger value="articles">Popular Articles</TabsTrigger>
            </TabsList>

            <TabsContent value="tickets" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Your Support Tickets</h3>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Ticket
                </Button>
              </div>

              {myTickets.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No tickets yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {myTickets.map((ticket) => (
                    <Card key={ticket.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-sm text-muted-foreground">
                                {ticket.id}
                              </span>
                              <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>
                                {ticket.status}
                              </Badge>
                            </div>
                            <h4 className="font-semibold">{ticket.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Updated {ticket.updated}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="articles" className="space-y-4">
              <h3 className="text-lg font-semibold">Popular Help Articles</h3>
              <div className="space-y-3">
                {popularArticles.map((article) => (
                  <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{article.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {article.views} views
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
