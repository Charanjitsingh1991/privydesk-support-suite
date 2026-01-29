import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Download, 
  Trash2, 
  Shield, 
  Eye, 
  BarChart3, 
  Mail, 
  Users,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Calendar,
  FileJson,
} from 'lucide-react';
import { useGDPRCompliance } from '@/hooks/useSecurity';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function PrivacySettings() {
  const { loading, exportUserData, requestAccountDeletion, cancelAccountDeletion, updateConsentPreferences } = useGDPRCompliance();
  const [deletionScheduled, setDeletionScheduled] = useState<Date | null>(null);
  const [deletionReason, setDeletionReason] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [consents, setConsents] = useState({
    analytics: true,
    marketing: false,
    thirdParty: false,
  });

  useEffect(() => {
    async function loadPreferences() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      if (profile?.preferences) {
        const prefs = profile.preferences as Record<string, unknown>;
        if (prefs.deletion_scheduled_for) {
          setDeletionScheduled(new Date(prefs.deletion_scheduled_for as string));
        }
        if (prefs.consent) {
          const consent = prefs.consent as Record<string, boolean>;
          setConsents({
            analytics: consent.analytics ?? true,
            marketing: consent.marketing ?? false,
            thirdParty: consent.thirdParty ?? false,
          });
        }
      }
    }
    loadPreferences();
  }, []);

  const handleDeleteRequest = async () => {
    try {
      const scheduledDate = await requestAccountDeletion(deletionReason);
      setDeletionScheduled(scheduledDate);
      setShowDeleteDialog(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleCancelDeletion = async () => {
    await cancelAccountDeletion();
    setDeletionScheduled(null);
  };

  const handleConsentChange = async (key: keyof typeof consents, value: boolean) => {
    const newConsents = { ...consents, [key]: value };
    setConsents(newConsents);
    await updateConsentPreferences(newConsents);
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Privacy & Data
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your data, privacy settings, and GDPR rights
          </p>
        </div>

        {/* Deletion Warning */}
        {deletionScheduled && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-destructive">Account Deletion Scheduled</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your account and all associated data will be permanently deleted on{' '}
                    <strong>{format(deletionScheduled, 'PPP')}</strong>.
                    You can cancel this request before the scheduled date.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={handleCancelDeletion}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Cancel Deletion
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Your Data Rights (GDPR)
            </CardTitle>
            <CardDescription>
              Under GDPR, you have the following rights regarding your personal data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg border bg-muted/30">
                <Eye className="h-5 w-5 text-primary mb-2" />
                <h4 className="font-medium">Right to Access</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  You can export all your personal data at any time
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <Trash2 className="h-5 w-5 text-primary mb-2" />
                <h4 className="font-medium">Right to Erasure</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  You can request permanent deletion of your account
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <FileJson className="h-5 w-5 text-primary mb-2" />
                <h4 className="font-medium">Right to Portability</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Export your data in a portable JSON format
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <Shield className="h-5 w-5 text-primary mb-2" />
                <h4 className="font-medium">Right to Rectification</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Update your personal information in Settings
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Your Data
            </CardTitle>
            <CardDescription>
              Download a copy of all your personal data in JSON format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  This includes your profile, tickets, messages, and session history.
                  The export is generated instantly.
                </p>
              </div>
              <Button onClick={exportUserData} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Consent Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Consent Preferences</CardTitle>
            <CardDescription>
              Control how your data is used for analytics and communications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <Label htmlFor="analytics" className="font-medium">Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow us to collect anonymous usage data to improve our service
                  </p>
                </div>
              </div>
              <Switch
                id="analytics"
                checked={consents.analytics}
                onCheckedChange={(checked) => handleConsentChange('analytics', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <Label htmlFor="marketing" className="font-medium">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive product updates, tips, and promotional content
                  </p>
                </div>
              </div>
              <Switch
                id="marketing"
                checked={consents.marketing}
                onCheckedChange={(checked) => handleConsentChange('marketing', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <Label htmlFor="thirdParty" className="font-medium">Third-Party Sharing</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow sharing anonymized data with trusted partners
                  </p>
                </div>
              </div>
              <Switch
                id="thirdParty"
                checked={consents.thirdParty}
                onCheckedChange={(checked) => handleConsentChange('thirdParty', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Data Retention
            </CardTitle>
            <CardDescription>
              Information about how long we keep your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">Tickets & Messages</span>
                <Badge variant="secondary">3 years</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">Security Audit Logs</span>
                <Badge variant="secondary">1 year</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">Session Data</span>
                <Badge variant="secondary">30 days after expiry</Badge>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm">Deleted Account Data</span>
                <Badge variant="secondary">30 days (grace period)</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Account
            </CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <p className="text-sm text-muted-foreground">
                  <strong>Warning:</strong> This action is irreversible after the 30-day grace period.
                  All your data including tickets, messages, files, and personal information will be
                  permanently deleted.
                </p>
              </div>

              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    disabled={!!deletionScheduled}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deletionScheduled ? 'Deletion Already Scheduled' : 'Request Account Deletion'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-4">
                      <p>
                        This will schedule your account for deletion in 30 days. During this period,
                        you can still cancel the request and recover your account.
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="reason">Reason for leaving (optional)</Label>
                        <Textarea
                          id="reason"
                          value={deletionReason}
                          onChange={(e) => setDeletionReason(e.target.value)}
                          placeholder="Help us improve by sharing your feedback..."
                          className="resize-none"
                        />
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteRequest}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Confirm Deletion
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
