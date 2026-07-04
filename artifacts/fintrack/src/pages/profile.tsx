import React from 'react';
import { useGetProfile, useUpdateProfile, useDeleteAccount } from '@workspace/api-client-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetProfileQueryKey } from '@workspace/api-client-react';
import { useClerk } from '@clerk/react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { signOut } = useClerk();
  const { data: profile, isLoading } = useGetProfile();
  const updateMutation = useUpdateProfile();
  const deleteMutation = useDeleteAccount();

  const [formData, setFormData] = React.useState({
    displayName: '',
    timezone: '',
    notificationsEnabled: true,
    aiInsightsEnabled: true,
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        timezone: profile.timezone || '',
        notificationsEnabled: profile.notificationsEnabled ?? true,
        aiInsightsEnabled: profile.aiInsightsEnabled ?? true,
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ data: formData }, {
      onSuccess: () => {
        toast.success("Profile updated successfully");
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
      },
      onError: () => {
        toast.error("Failed to update profile");
      }
    });
  };

  const handleDeleteAccount = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Account deleted");
        signOut({ redirectUrl: "/" });
      },
      onError: () => {
        toast.error("Failed to delete account");
      }
    });
  };

  if (isLoading) {
    return <div className="p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile & Preferences</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>Personalize your FinTrack experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input 
                id="displayName" 
                value={formData.displayName} 
                onChange={(e) => setFormData(p => ({...p, displayName: e.target.value}))} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input 
                id="timezone" 
                value={formData.timezone} 
                onChange={(e) => setFormData(p => ({...p, timezone: e.target.value}))} 
              />
              <p className="text-xs text-muted-foreground">Used to align daily P&L resets.</p>
            </div>

            <div className="flex items-center justify-between py-4 border-y border-border">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive weekly performance summaries.</p>
              </div>
              <Switch 
                checked={formData.notificationsEnabled} 
                onCheckedChange={(c) => setFormData(p => ({...p, notificationsEnabled: c}))} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automated AI Insights</Label>
                <p className="text-sm text-muted-foreground">Allow AI to passively analyze your journal entries.</p>
              </div>
              <Switch 
                checked={formData.aiInsightsEnabled} 
                onCheckedChange={(c) => setFormData(p => ({...p, aiInsightsEnabled: c}))} 
              />
            </div>
          </CardContent>
          <CardFooter className="border-t border-border bg-muted/10 pt-6">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>

      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated trading data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}