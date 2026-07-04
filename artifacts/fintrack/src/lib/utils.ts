import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoney(amount: number | null | undefined): string {
  if (amount == null) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    signDisplay: "always",
  }).format(amount);
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null) return "0.00%";
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: "always",
  }).format(value / 100);
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return "0";
  return new Intl.NumberFormat("en-US").format(value);
}

export function cnProfitLoss(value: number | null | undefined) {
  if (!value) return "text-muted-foreground";
  return value > 0 ? "text-profit" : value < 0 ? "text-loss" : "text-muted-foreground";
}

export function cnProfitLossBg(value: number | null | undefined) {
  if (!value) return "bg-muted text-muted-foreground";
  return value > 0 ? "bg-profit/10 text-profit" : value < 0 ? "bg-loss/10 text-loss" : "bg-muted text-muted-foreground";
}