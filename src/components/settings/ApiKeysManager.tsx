import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Key, Plus, Copy, Trash2, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { useApiKeys, API_SCOPES, CreateApiKeyInput } from '@/hooks/useApiKeys';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function ApiKeysManager() {
  const { toast } = useToast();
  const { 
    apiKeys, 
    isLoading, 
    createApiKey, 
    revokeApiKey, 
    toggleApiKey, 
    newlyCreatedKey, 
    clearNewKey 
  } = useApiKeys();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [newKeyForm, setNewKeyForm] = useState<CreateApiKeyInput>({
    name: '',
    permissions: [],
    rate_limit: 60,
  });

  const handleCreateKey = async () => {
    if (!newKeyForm.name || newKeyForm.permissions.length === 0) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    await createApiKey.mutateAsync(newKeyForm);
    setCreateDialogOpen(false);
    setNewKeyForm({ name: '', permissions: [], rate_limit: 60 });
  };

  const handleCopyKey = () => {
    if (newlyCreatedKey) {
      navigator.clipboard.writeText(newlyCreatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'API Key Copied!' });
    }
  };

  const togglePermission = (scopeId: string) => {
    setNewKeyForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(scopeId)
        ? prev.permissions.filter(p => p !== scopeId)
        : [...prev.permissions, scopeId],
    }));
  };

  const confirmRevoke = async () => {
    if (keyToRevoke) {
      await revokeApiKey.mutateAsync(keyToRevoke);
      setRevokeDialogOpen(false);
      setKeyToRevoke(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <CardDescription>
              Manage API keys for third-party integrations
            </CardDescription>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create API Key</DialogTitle>
                <DialogDescription>
                  Generate a new API key for external integrations
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="key_name">Key Name</Label>
                  <Input
                    id="key_name"
                    value={newKeyForm.name}
                    onChange={(e) => setNewKeyForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Zapier Integration"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="grid gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {API_SCOPES.map((scope) => (
                      <div key={scope.id} className="flex items-start gap-2">
                        <Checkbox
                          id={scope.id}
                          checked={newKeyForm.permissions.includes(scope.id)}
                          onCheckedChange={() => togglePermission(scope.id)}
                        />
                        <div className="grid gap-0.5">
                          <Label htmlFor={scope.id} className="text-sm font-medium cursor-pointer">
                            {scope.label}
                          </Label>
                          <span className="text-xs text-muted-foreground">
                            {scope.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Rate Limit (requests per minute)</Label>
                  <Select
                    value={newKeyForm.rate_limit.toString()}
                    onValueChange={(val) => setNewKeyForm(prev => ({ ...prev, rate_limit: parseInt(val) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">60 req/min (Free)</SelectItem>
                      <SelectItem value="300">300 req/min (Starter)</SelectItem>
                      <SelectItem value="1000">1000 req/min (Pro)</SelectItem>
                      <SelectItem value="5000">5000 req/min (Enterprise)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateKey} disabled={createApiKey.isPending}>
                  {createApiKey.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Key
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* New key display dialog */}
        {newlyCreatedKey && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Copy your API key now!
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  This key will only be shown once. Store it securely.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <code className="flex-1 px-3 py-2 bg-background rounded border text-sm font-mono break-all">
                {newlyCreatedKey}
              </code>
              <Button size="sm" onClick={handleCopyKey}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button variant="outline" size="sm" className="mt-3" onClick={clearNewKey}>
              I've copied the key
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No API keys configured</p>
            <p className="text-sm">Create an API key to integrate with external services</p>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{key.name}</span>
                    <Badge variant={key.is_active ? 'secondary' : 'outline'}>
                      {key.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <code className="text-xs text-muted-foreground">{key.key_prefix}</code>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{key.permissions.length} permissions</span>
                    <span>{key.rate_limit} req/min</span>
                    {key.last_used_at && (
                      <span>Last used: {format(new Date(key.last_used_at), 'MMM d, yyyy')}</span>
                    )}
                    {key.expires_at && (
                      <span>Expires: {format(new Date(key.expires_at), 'MMM d, yyyy')}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={key.is_active}
                    onCheckedChange={(checked) => toggleApiKey.mutate({ keyId: key.id, isActive: checked })}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setKeyToRevoke(key.id);
                      setRevokeDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Revoke confirmation dialog */}
        <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Any integrations using this key will stop working immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmRevoke} className="bg-destructive text-destructive-foreground">
                Revoke Key
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
