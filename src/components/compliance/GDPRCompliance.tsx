import { useState, useEffect } from 'react';
import { Download, Trash2, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { GDPRService } from '@/lib/services/gdprService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface DataRequest {
  id: string;
  request_type: string;
  status: string;
  requested_by: string;
  requested_at: string;
  completed_at?: string;
  export_url?: string;
}

interface RetentionPolicy {
  id: string;
  resource_type: string;
  retention_days: number;
  action_on_expiry: string;
  is_active: boolean;
}

export function GDPRCompliance({ organizationId, userId }: { organizationId: string; userId: string }) {
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteReason, setDeleteReason] = useState('');
  const [showDeleteForm, setShowDeleteForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [organizationId]);

  const loadData = async () => {
    setLoading(true);
    const [requestsData, policiesData] = await Promise.all([
      GDPRService.getDataRequests(organizationId),
      GDPRService.getRetentionPolicies(organizationId),
    ]);
    setRequests(requestsData);
    setPolicies(policiesData);
    setLoading(false);
  };

  const handleExportRequest = async () => {
    await GDPRService.requestDataExport(userId, organizationId, {
      includeTickets: true,
      includeMessages: true,
      includeAttachments: false,
    });
    alert('Data export request submitted. You will receive an email when ready.');
    loadData();
  };

  const handleDeleteRequest = async () => {
    if (!deleteReason.trim()) {
      alert('Please provide a reason for deletion');
      return;
    }
    await GDPRService.requestDataDeletion(userId, organizationId, deleteReason);
    setShowDeleteForm(false);
    setDeleteReason('');
    alert('Data deletion request submitted. This will be processed within 30 days.');
    loadData();
  };

  const handleDownload = (exportUrl: string) => {
    window.open(exportUrl, '_blank');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">GDPR & Data Privacy</h2>
        <p className="text-muted-foreground">Manage data requests and retention policies</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Your Data
            </CardTitle>
            <CardDescription>
              Request a copy of all your personal data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              We'll compile all your data including tickets, messages, and profile information into a downloadable file.
            </p>
            <Button onClick={handleExportRequest} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Request Data Export
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Your Data
            </CardTitle>
            <CardDescription>
              Request permanent deletion of your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showDeleteForm ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  This action is irreversible. All your data will be permanently deleted within 30 days.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteForm(true)}
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Request Data Deletion
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <Textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Please tell us why you're leaving (optional but helpful)"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteRequest}
                    className="flex-1"
                  >
                    Confirm Deletion
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Data Requests
          </CardTitle>
          <CardDescription>History of export and deletion requests</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No data requests yet
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <p className="font-medium capitalize">
                        {request.request_type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Requested on {new Date(request.requested_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      request.status === 'completed' ? 'default' :
                      request.status === 'processing' ? 'secondary' :
                      'destructive'
                    }>
                      {request.status}
                    </Badge>
                    {request.status === 'completed' && request.export_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(request.export_url!)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Retention Policies</CardTitle>
          <CardDescription>
            Automatic data cleanup based on retention rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          {policies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No retention policies configured
            </div>
          ) : (
            <div className="space-y-3">
              {policies.map((policy) => (
                <div
                  key={policy.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium capitalize">
                      {policy.resource_type.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Retained for {policy.retention_days} days, then {policy.action_on_expiry}
                    </p>
                  </div>
                  <Badge variant={policy.is_active ? 'default' : 'secondary'}>
                    {policy.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
