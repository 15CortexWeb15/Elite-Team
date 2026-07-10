import React from 'react';
import { useGetLatestAiAnalysis, useRequestAiAnalysis } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BrainCircuit, Loader2, Sparkles, TrendingDown, Target, ShieldAlert } from 'lucide-react';
import { GA } from '@/lib/analytics';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { getGetLatestAiAnalysisQueryKey } from '@workspace/api-client-react';

export default function AiCoachPage() {
  const queryClient = useQueryClient();
  const { data: analysis, isLoading, isError } = useGetLatestAiAnalysis();
  const requestMutation = useRequestAiAnalysis();
  const [period, setPeriod] = React.useState<string>('month');

  const handleRequest = () => {
    GA.aiAnalysisRequested(period);
    requestMutation.mutate({ data: { period: period as any } }, {
      onSuccess: () => {
        toast.success("Analysis generated successfully.");
        queryClient.invalidateQueries({ queryKey: getGetLatestAiAnalysisQueryKey() });
      },
      onError: () => {
        toast.error("Failed to generate analysis. You might need more trades.");
      }
    });
  };

  const renderSection = (title: string, icon: React.ReactNode, content: string | null | undefined, className: string = "") => {
    if (!content) return null;
    return (
      <div className={`p-5 rounded-xl border ${className}`}>
        <h3 className="font-semibold flex items-center gap-2 mb-3 text-foreground">
          {icon}
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-primary" />
            AI Trading Coach
          </h1>
          <p className="text-muted-foreground mt-1">Behavioral analysis based on your execution data.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-card p-1 rounded-lg border border-border">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32 border-0 bg-transparent shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleRequest} disabled={requestMutation.isPending}>
            {requestMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Analyze
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-xl col-span-1 md:col-span-2" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          <Card className="border-primary/20 shadow-lg shadow-primary/5">
            <CardHeader className="pb-4 border-b border-border bg-muted/20">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Executive Summary</CardTitle>
                  <CardDescription>Generated on {format(new Date(analysis.createdAt), 'MMMM d, yyyy')}</CardDescription>
                </div>
                {analysis.consistencyScore && (
                  <div className="text-center bg-background px-4 py-2 rounded-lg border border-border">
                    <div className="text-2xl font-bold text-primary">{analysis.consistencyScore}<span className="text-sm text-muted-foreground">/100</span></div>
                    <div className="text-xs text-muted-foreground uppercase font-medium tracking-wider">Consistency</div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-lg leading-relaxed">{analysis.summary}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderSection("Strengths", <Target className="h-5 w-5 text-profit" />, analysis.strengths, "bg-profit/5 border-profit/10")}
            {renderSection("Weaknesses", <TrendingDown className="h-5 w-5 text-loss" />, analysis.weaknesses, "bg-loss/5 border-loss/10")}
            {renderSection("Repeated Mistakes", <ShieldAlert className="h-5 w-5 text-amber-500" />, analysis.repeatedMistakes, "bg-amber-500/5 border-amber-500/10")}
            {renderSection("Psychology & Discipline", <BrainCircuit className="h-5 w-5 text-blue-500" />, analysis.psychologyInsights, "bg-blue-500/5 border-blue-500/10")}
          </div>

          {analysis.actionableImprovements && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Actionable Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{analysis.actionableImprovements}</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <BrainCircuit className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
          <h2 className="text-xl font-bold mb-2">No Analysis Found</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            The AI coach needs trading data to identify patterns in your behavior. Log some trades and click Analyze to get started.
          </p>
          <Button onClick={handleRequest} disabled={requestMutation.isPending}>
            {requestMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Generate First Analysis
          </Button>
        </Card>
      )}
    </div>
  );
}