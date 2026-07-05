import React, { useState } from 'react';
import { useListTrades, useCreateTrade, useUpdateTrade, useDeleteTrade } from '@workspace/api-client-react';
import type { Trade, TradeInput } from '@workspace/api-client-react';
import { formatMoney, formatPercent, cnProfitLoss } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Plus, Target, ArrowUpDown, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { getListTradesQueryKey, getGetDashboardQueryKey } from '@workspace/api-client-react';

export default function JournalPage() {
  const [search, setSearch] = useState('');
  const [direction, setDirection] = useState<string>('all');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [deletingTradeId, setDeletingTradeId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const deleteMutation = useDeleteTrade();

  const queryParams = {
    ...(search ? { search } : {}),
    ...(direction !== 'all' ? { direction: direction as any } : {})
  };

  const { data: trades, isLoading } = useListTrades(queryParams);
  
  const handleOpenNew = () => {
    setEditingTrade(null);
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (trade: Trade) => {
    setEditingTrade(trade);
    setIsSheetOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingTradeId == null) return;
    deleteMutation.mutate({ id: deletingTradeId }, {
      onSuccess: () => {
        toast.success('Trade deleted');
        queryClient.invalidateQueries({ queryKey: getListTradesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        setDeletingTradeId(null);
      },
      onError: () => {
        toast.error('Failed to delete trade');
        setDeletingTradeId(null);
      },
    });
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trade Journal</h1>
          <p className="text-muted-foreground mt-1">Review and manage your executions.</p>
        </div>
        <Button onClick={handleOpenNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Trade
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search asset, notes..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={direction} onValueChange={setDirection}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Directions</SelectItem>
              <SelectItem value="long">Long</SelectItem>
              <SelectItem value="short">Short</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden flex-1 flex flex-col">
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Dir</TableHead>
                <TableHead className="text-right">Entry</TableHead>
                <TableHead className="text-right">Exit</TableHead>
                <TableHead className="text-right">Risk</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead className="text-right">Return</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1,2,3,4,5].map(i => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : !trades || trades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-64 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Target className="h-10 w-10 mb-4 opacity-20" />
                      <p>No trades found.</p>
                      {search || direction !== 'all' ? (
                        <p className="text-sm mt-1">Try adjusting your filters.</p>
                      ) : (
                        <Button variant="link" onClick={handleOpenNew} className="mt-2 text-primary">Log your first trade</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                trades.map(trade => (
                  <TableRow 
                    key={trade.id} 
                    className="group cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleOpenEdit(trade)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(trade.tradeDate), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {trade.asset}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">{trade.market}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] uppercase ${trade.direction === 'long' ? 'text-profit border-profit/20 bg-profit/5' : 'text-loss border-loss/20 bg-loss/5'}`}>
                        {trade.direction}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{trade.entryPrice}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{trade.exitPrice || '-'}</TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">{trade.riskPercent ? formatPercent(trade.riskPercent) : '-'}</TableCell>
                    <TableCell className={`text-right font-mono font-medium ${cnProfitLoss(trade.profitLoss)}`}>
                      {trade.profitLoss ? formatMoney(trade.profitLoss) : '-'}
                    </TableCell>
                    <TableCell className={`text-right font-mono ${cnProfitLoss(trade.profitLossPercent)}`}>
                      {trade.profitLossPercent ? formatPercent(trade.profitLossPercent) : '-'}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()} className="w-10 pr-3">
                      <button
                        onClick={() => setDeletingTradeId(trade.id)}
                        className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete trade"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <TradeFormSheet 
        isOpen={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        trade={editingTrade} 
      />

      <AlertDialog open={deletingTradeId !== null} onOpenChange={(open) => { if (!open) setDeletingTradeId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this trade?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the trade from your journal. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TradeFormSheet({ isOpen, onOpenChange, trade }: { isOpen: boolean, onOpenChange: (open: boolean) => void, trade: Trade | null }) {
  const queryClient = useQueryClient();
  const createMutation = useCreateTrade();
  const updateMutation = useUpdateTrade();
  const deleteMutation = useDeleteTrade();

  const [formData, setFormData] = useState<Partial<TradeInput>>({
    asset: '',
    market: 'crypto',
    direction: 'long',
    entryPrice: 0,
    exitPrice: 0,
    positionSize: 0,
    stopLoss: null,
    takeProfit: null,
    riskPercent: null,
    commission: 0,
    notes: '',
    tradeDate: new Date().toISOString().slice(0, 16),
  });

  // Reset form when opened with a new trade
  React.useEffect(() => {
    if (isOpen) {
      if (trade) {
        setFormData({
          asset: trade.asset,
          market: trade.market,
          direction: trade.direction,
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          positionSize: trade.positionSize || 0,
          stopLoss: trade.stopLoss,
          takeProfit: trade.takeProfit,
          riskPercent: trade.riskPercent,
          commission: trade.commission,
          notes: trade.notes || '',
          tradeDate: new Date(trade.tradeDate).toISOString().slice(0, 16),
          closeDate: trade.closeDate ? new Date(trade.closeDate).toISOString().slice(0, 16) : undefined,
        });
      } else {
        setFormData({
          asset: '',
          market: 'crypto',
          direction: 'long',
          entryPrice: 0,
          exitPrice: 0,
          positionSize: 0,
          stopLoss: null,
          takeProfit: null,
          riskPercent: null,
          commission: 0,
          notes: '',
          tradeDate: new Date().toISOString().slice(0, 16),
        });
      }
    }
  }, [isOpen, trade]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      entryPrice: Number(formData.entryPrice),
      exitPrice: Number(formData.exitPrice),
      positionSize: Number(formData.positionSize),
      stopLoss: formData.stopLoss ? Number(formData.stopLoss) : null,
      takeProfit: formData.takeProfit ? Number(formData.takeProfit) : null,
      riskPercent: formData.riskPercent ? Number(formData.riskPercent) : null,
      commission: formData.commission ? Number(formData.commission) : null,
      tradeDate: new Date(formData.tradeDate!).toISOString(),
    } as TradeInput;

    const action = trade 
      ? updateMutation.mutateAsync({ id: trade.id, data: payload })
      : createMutation.mutateAsync({ data: payload });

    action.then(() => {
      toast.success(`Trade ${trade ? 'updated' : 'logged'} successfully`);
      queryClient.invalidateQueries({ queryKey: getListTradesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      onOpenChange(false);
    }).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to save trade: ${msg}`);
    });
  };

  const handleDelete = () => {
    if (!trade) return;
    if (confirm("Are you sure you want to delete this trade?")) {
      deleteMutation.mutate({ id: trade.id }, {
        onSuccess: () => {
          toast.success("Trade deleted");
          queryClient.invalidateQueries({ queryKey: getListTradesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          onOpenChange(false);
        },
        onError: () => {
          toast.error("Failed to delete trade.");
        }
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[100vw] sm:max-w-md overflow-y-auto bg-card border-l-border p-0">
        <div className="p-6 border-b border-border sticky top-0 bg-card z-10">
          <SheetHeader>
            <SheetTitle>{trade ? 'Edit Trade' : 'Log New Trade'}</SheetTitle>
            <SheetDescription>
              {trade ? 'Update the details of your execution.' : 'Enter the details of your execution.'}
            </SheetDescription>
          </SheetHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Asset Ticker</Label>
              <Input 
                required 
                placeholder="e.g. BTC/USD" 
                value={formData.asset}
                onChange={e => setFormData(p => ({...p, asset: e.target.value.toUpperCase()}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Market</Label>
              <Select value={formData.market} onValueChange={v => setFormData(p => ({...p, market: v}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="forex">Forex</SelectItem>
                  <SelectItem value="stocks">Stocks</SelectItem>
                  <SelectItem value="futures">Futures</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Direction</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                type="button" 
                variant={formData.direction === 'long' ? 'default' : 'outline'}
                className={formData.direction === 'long' ? 'bg-profit hover:bg-profit/90 text-profit-foreground' : ''}
                onClick={() => setFormData(p => ({...p, direction: 'long'}))}
              >
                Long
              </Button>
              <Button 
                type="button" 
                variant={formData.direction === 'short' ? 'default' : 'outline'}
                className={formData.direction === 'short' ? 'bg-loss hover:bg-loss/90 text-loss-foreground' : ''}
                onClick={() => setFormData(p => ({...p, direction: 'short'}))}
              >
                Short
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Entry Price</Label>
              <Input 
                type="number" step="any" required 
                value={formData.entryPrice || ''}
                onChange={e => setFormData(p => ({...p, entryPrice: parseFloat(e.target.value) || 0}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Exit Price</Label>
              <Input 
                type="number" step="any" required
                value={formData.exitPrice || ''}
                onChange={e => setFormData(p => ({...p, exitPrice: parseFloat(e.target.value) || 0}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Stop Loss</Label>
              <Input 
                type="number" step="any" 
                value={formData.stopLoss || ''}
                onChange={e => setFormData(p => ({...p, stopLoss: e.target.value ? parseFloat(e.target.value) : null}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Take Profit</Label>
              <Input 
                type="number" step="any" 
                value={formData.takeProfit || ''}
                onChange={e => setFormData(p => ({...p, takeProfit: e.target.value ? parseFloat(e.target.value) : null}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Position Size</Label>
              <Input 
                type="number" step="any" required
                value={formData.positionSize || ''}
                onChange={e => setFormData(p => ({...p, positionSize: parseFloat(e.target.value) || 0}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Risk % (Optional)</Label>
              <Input 
                type="number" step="any"
                value={formData.riskPercent || ''}
                onChange={e => setFormData(p => ({...p, riskPercent: e.target.value ? parseFloat(e.target.value) : null}))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Trade Date & Time</Label>
            <Input 
              type="datetime-local" required
              value={formData.tradeDate}
              onChange={e => setFormData(p => ({...p, tradeDate: e.target.value}))}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes & Reflections</Label>
            <textarea 
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              placeholder="What was your thesis? How did you feel?"
              value={formData.notes || ''}
              onChange={e => setFormData(p => ({...p, notes: e.target.value}))}
            />
          </div>

          <div className="pt-4 border-t border-border flex justify-between gap-4">
            {trade ? (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : <div />}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {trade ? 'Update' : 'Save'} Trade
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}