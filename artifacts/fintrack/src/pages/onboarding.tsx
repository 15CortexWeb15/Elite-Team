import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Common IANA timezones grouped for the dropdown
const TIMEZONES = [
  // Americas
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "America/Honolulu",
  "America/Toronto",
  "America/Vancouver",
  "America/Mexico_City",
  "America/Bogota",
  "America/Lima",
  "America/Santiago",
  "America/Sao_Paulo",
  "America/Argentina/Buenos_Aires",
  // Europe
  "Europe/London",
  "Europe/Dublin",
  "Europe/Lisbon",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Amsterdam",
  "Europe/Zurich",
  "Europe/Rome",
  "Europe/Madrid",
  "Europe/Stockholm",
  "Europe/Warsaw",
  "Europe/Prague",
  "Europe/Vienna",
  "Europe/Athens",
  "Europe/Helsinki",
  "Europe/Moscow",
  // Asia / Pacific
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Hong_Kong",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Brisbane",
  "Pacific/Auckland",
  "Pacific/Honolulu",
  // Africa
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Africa/Lagos",
  "Africa/Nairobi",
  // UTC
  "UTC",
];
import { useSaveOnboarding, getGetOnboardingQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = 6;

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const saveMutation = useSaveOnboarding();
  const [step, setStep] = useState(1);
  // Auto-detect browser timezone, falling back to UTC if not in the curated list
  const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const defaultTimezone = TIMEZONES.includes(detectedTz) ? detectedTz : "UTC";

  const [formData, setFormData] = useState({
    experience: '',
    markets: '',
    tradingStyle: '',
    goals: '',
    timezone: defaultTimezone,
    riskProfile: ''
  });

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => setStep(s => Math.min(s + 1, STEPS));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleComplete = () => {
    saveMutation.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetOnboardingQueryKey() });
        toast.success("Welcome to FinTrack");
        setLocation('/dashboard');
      },
      onError: () => {
        toast.error("Failed to save profile. Please try again.");
      }
    });
  };

  const progress = (step / STEPS) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-in-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2 text-center">Step {step} of {STEPS}</p>
        </div>

        <Card className="border-border shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === 1 && "Trading Experience"}
              {step === 2 && "Markets Traded"}
              {step === 3 && "Trading Style"}
              {step === 4 && "Primary Goal"}
              {step === 5 && "Timezone"}
              {step === 6 && "Risk Profile"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "How long have you been actively trading?"}
              {step === 2 && "What are your primary markets?"}
              {step === 3 && "How would you describe your approach?"}
              {step === 4 && "What are you looking to achieve with FinTrack?"}
              {step === 5 && "Set your local timezone for accurate reporting."}
              {step === 6 && "How much do you typically risk per trade?"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <Select value={formData.experience} onValueChange={(v) => updateForm('experience', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (&lt; 1 year)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                  <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                  <SelectItem value="professional">Professional (5+ years)</SelectItem>
                </SelectContent>
              </Select>
            )}

            {step === 2 && (
              <Select value={formData.markets} onValueChange={(v) => updateForm('markets', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select primary markets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  <SelectItem value="forex">Forex (FX)</SelectItem>
                  <SelectItem value="stocks">Equities / Stocks</SelectItem>
                  <SelectItem value="options">Options / Derivatives</SelectItem>
                  <SelectItem value="futures">Futures / Commodities</SelectItem>
                </SelectContent>
              </Select>
            )}

            {step === 3 && (
              <Select value={formData.tradingStyle} onValueChange={(v) => updateForm('tradingStyle', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trading style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scalping">Scalping (Minutes)</SelectItem>
                  <SelectItem value="day">Day Trading (Hours)</SelectItem>
                  <SelectItem value="swing">Swing Trading (Days to Weeks)</SelectItem>
                  <SelectItem value="position">Position Trading (Months)</SelectItem>
                </SelectContent>
              </Select>
            )}

            {step === 4 && (
              <Select value={formData.goals} onValueChange={(v) => updateForm('goals', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select primary goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consistency">Achieve consistency</SelectItem>
                  <SelectItem value="psychology">Improve psychology & discipline</SelectItem>
                  <SelectItem value="scale">Scale up position size safely</SelectItem>
                  <SelectItem value="data">Data tracking for prop firms</SelectItem>
                </SelectContent>
              </Select>
            )}

            {step === 5 && (
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={formData.timezone} onValueChange={(v) => updateForm('timezone', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>{tz.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Auto-detected from your browser — change if needed</p>
              </div>
            )}

            {step === 6 && (
              <Select value={formData.riskProfile} onValueChange={(v) => updateForm('riskProfile', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select typical risk per trade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative (&lt; 1%)</SelectItem>
                  <SelectItem value="moderate">Moderate (1% - 2%)</SelectItem>
                  <SelectItem value="aggressive">Aggressive (2% - 5%)</SelectItem>
                  <SelectItem value="high">High Risk (&gt; 5%)</SelectItem>
                </SelectContent>
              </Select>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border pt-6">
            <Button variant="outline" onClick={handleBack} disabled={step === 1 || saveMutation.isPending}>
              Back
            </Button>
            {step < STEPS ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={handleComplete} disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Setup
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}