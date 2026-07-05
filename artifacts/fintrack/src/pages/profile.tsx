import React from 'react';
import { useGetProfile, useUpdateProfile, useDeleteAccount } from '@workspace/api-client-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  Loader2, AlertTriangle, User, Bell, Shield, LogOut,
  KeyRound, Smartphone, Mail,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetProfileQueryKey } from '@workspace/api-client-react';
import { useClerk, useUser } from '@clerk/react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { TIMEZONES, detectTimezone } from '@/lib/timezones';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { data: profile, isLoading } = useGetProfile();
  const updateMutation = useUpdateProfile();
  const deleteMutation = useDeleteAccount();

  const [formData, setFormData] = React.useState({
    displayName: '',
    timezone: detectTimezone(),
    notificationsEnabled: true,
    aiInsightsEnabled: true,
  });

  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        timezone: profile.timezone || detectTimezone(),
        notificationsEnabled: profile.notificationsEnabled ?? true,
        aiInsightsEnabled: profile.aiInsightsEnabled ?? true,
      });
    }
  }, [profile]);

  function patch<K extends keyof typeof formData>(key: K, val: (typeof formData)[K]) {
    setFormData((p) => ({ ...p, [key]: val }));
    setDirty(true);
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ data: formData }, {
      onSuccess: () => {
        toast.success('Profile saved');
        setDirty(false);
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
      },
      onError: () => toast.error('Failed to save profile'),
    });
  };

  const handleDeleteAccount = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('Account deleted');
        signOut({ redirectUrl: '/' });
      },
      onError: () => toast.error('Failed to delete account'),
    });
  };

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  const { openUserProfile } = useClerk();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const initials = user?.firstName?.charAt(0) || user?.primaryEmailAddress?.emailAddress?.charAt(0)?.toUpperCase() || 'T';

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border border-border">
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {formData.displayName || user?.fullName || 'Your Account'}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Mail className="h-3.5 w-3.5" />
            {user?.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </div>

      <Tabs defaultValue="account">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Bell className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* ── Account tab ── */}
        <TabsContent value="account" className="mt-6 space-y-6">
          <form onSubmit={handleSave}>
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Personalize your Roxel experience.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => patch('displayName', e.target.value)}
                    placeholder="e.g. Alex Trader"
                  />
                  <p className="text-xs text-muted-foreground">Shown in the sidebar and on your dashboard.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={formData.timezone} onValueChange={(v) => patch('timezone', v)}>
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>{tz.replace(/_/g, ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Used to align daily P&L resets and calendar views.</p>
                </div>

                <Separator />

                <div className="space-y-1.5">
                  <Label>Email address</Label>
                  <div className="flex items-center gap-2">
                    <Input value={user?.primaryEmailAddress?.emailAddress || ''} disabled className="text-muted-foreground" />
                    {user?.primaryEmailAddress?.verification?.status === 'verified' && (
                      <Badge variant="secondary" className="shrink-0 text-profit border-profit/20 bg-profit/10">Verified</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Managed by your authentication provider.</p>
                </div>
              </CardContent>
              <CardFooter className="border-t border-border bg-muted/10 pt-5 gap-3">
                <Button type="submit" disabled={updateMutation.isPending || !dirty}>
                  {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
                {dirty && (
                  <Button type="button" variant="ghost" onClick={() => {
                    if (profile) {
                      setFormData({
                        displayName: profile.displayName || '',
                        timezone: profile.timezone || detectTimezone(),
                        notificationsEnabled: profile.notificationsEnabled ?? true,
                        aiInsightsEnabled: profile.aiInsightsEnabled ?? true,
                      });
                    }
                    setDirty(false);
                  }}>
                    Discard
                  </Button>
                )}
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* ── Preferences tab ── */}
        <TabsContent value="preferences" className="mt-6 space-y-6">
          <form onSubmit={handleSave}>
            <Card>
              <CardHeader>
                <CardTitle>Notifications & AI</CardTitle>
                <CardDescription>Control what Roxel does automatically on your behalf.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-0 divide-y divide-border">
                <div className="flex items-center justify-between py-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive weekly performance summary emails.</p>
                  </div>
                  <Switch
                    checked={formData.notificationsEnabled}
                    onCheckedChange={(v) => patch('notificationsEnabled', v)}
                  />
                </div>
                <div className="flex items-center justify-between py-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Automated AI Insights</Label>
                    <p className="text-xs text-muted-foreground">Allow AI to passively analyze your journal entries and surface patterns.</p>
                  </div>
                  <Switch
                    checked={formData.aiInsightsEnabled}
                    onCheckedChange={(v) => patch('aiInsightsEnabled', v)}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t border-border bg-muted/10 pt-5">
                <Button type="submit" disabled={updateMutation.isPending || !dirty}>
                  {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* ── Security tab ── */}
        <TabsContent value="security" className="mt-6 space-y-6">
          {/* Sign-out all sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Sign out of all devices at once. Useful if you've used Roxel on a shared or public computer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => signOut({ redirectUrl: `${basePath}/sign-in` })}
              >
                <LogOut className="h-4 w-4" />
                Sign out of all sessions
              </Button>
            </CardContent>
          </Card>

          {/* Change password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                Password
              </CardTitle>
              <CardDescription>
                Update your password or switch to a passwordless sign-in method.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Password and authentication method changes are managed through your Clerk account. Click below to open the user profile portal.
              </p>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => openUserProfile()}
              >
                <KeyRound className="h-4 w-4" />
                Manage password &amp; auth methods
              </Button>
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all associated trading data. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your Roxel account and remove all trades,
                      analytics, and AI analyses from our servers. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Yes, delete everything'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
