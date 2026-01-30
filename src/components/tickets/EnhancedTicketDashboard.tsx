import { useState } from 'react';
import { Ticket, Filter, Search, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TicketItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  customer: string;
  assignee?: string;
  created_at: string;
  updated_at: string;
}

export function EnhancedTicketDashboard({ organizationId }: { organizationId: string }) {
  const [tickets] = useState<TicketItem[]>([
    {
      id: 'TKT-1001',
      title: 'Cannot login to account',
      status: 'open',
      priority: 'high',
      customer: 'John Doe',
      assignee: 'Agent 1',
      created_at: '2024-01-30T10:00:00Z',
      updated_at: '2024-01-30T10:30:00Z',
    },
    {
      id: 'TKT-1002',
      title: 'Payment processing issue',
      status: 'pending',
      priority: 'urgent',
      customer: 'Jane Smith',
      created_at: '2024-01-30T09:00:00Z',
      updated_at: '2024-01-30T11:00:00Z',
    },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'pending': return 'secondary';
      case 'resolved': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Ticket Management</h2>
          <p className="text-muted-foreground">Manage and track support tickets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 hover:bg-accent cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-1 h-16 rounded-full ${getPriorityColor(ticket.priority)}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm text-muted-foreground">
                          {ticket.id}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-2">{ticket.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Customer: {ticket.customer}</span>
                        {ticket.assignee && <span>Assigned to: {ticket.assignee}</span>}
                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(ticket.status)} className="capitalize">
                      {ticket.status}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {ticket.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
