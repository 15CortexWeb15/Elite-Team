import React from "react";
import { Link, useLocation } from "wouter";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { 
  BarChart3, 
  BrainCircuit, 
  CalendarDays, 
  LayoutDashboard, 
  Settings, 
  Table2, 
  User, 
  MessageSquare,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Journal", href: "/journal", icon: Table2 },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Markets", href: "/stocks", icon: TrendingUp },
  { name: "AI Coach", href: "/ai-coach", icon: BrainCircuit },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
];

const secondaryNavigation = [
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Feedback", href: "/feedback", icon: MessageSquare },
];

// 5 items shown in bottom nav on mobile
const mobileNav = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Journal", href: "/journal", icon: Table2 },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "AI Coach", href: "/ai-coach", icon: BrainCircuit },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <SidebarProvider>
      <div className="flex min-h-[100dvh] w-full bg-background">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="p-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <BarChart3 className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight">Roxel</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild isActive={location === item.href}>
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto">
              <SidebarGroupLabel>Preferences</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {secondaryNavigation.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild isActive={location === item.href}>
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border">
            <div className="flex items-center gap-3 w-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-sm font-medium truncate">{user?.fullName || user?.primaryEmailAddress?.emailAddress}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</span>
              </div>
              <button 
                onClick={() => signOut({ redirectUrl: basePath || "/" })}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 flex flex-col min-w-0">
          {/* Mobile top header with sidebar trigger */}
          <header className="h-14 lg:hidden flex items-center px-4 border-b border-border gap-4 shrink-0">
            <SidebarTrigger />
            <span className="font-bold">Roxel</span>
          </header>

          {/* Page content — extra bottom padding on mobile for the nav bar */}
          <div className="flex-1 p-4 lg:p-8 overflow-auto pb-24 lg:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* ── Mobile bottom navigation bar ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 h-16 bg-background/95 backdrop-blur-sm border-t border-border flex items-stretch">
        {mobileNav.map(({ name, href, icon: Icon }) => {
          const isActive = location === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${isActive ? "bg-muted" : ""}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span>{name}</span>
            </Link>
          );
        })}
      </nav>
    </SidebarProvider>
  );
}
