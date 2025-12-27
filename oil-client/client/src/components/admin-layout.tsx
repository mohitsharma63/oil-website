import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Tags,
  Package,
  ShoppingBag,
  Users,
  Settings,
  Store,
  Images,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/admin") return location === "/admin";
    return location === href || location.startsWith(`${href}/`);
  };

  const navItems = [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "Products", href: "/admin/products", icon: Package },
    { title: "Categories", href: "/admin/categories", icon: Tags },
    { title: "Sub Categories", href: "/admin/subcategories", icon: Tags },
    { title: "Sliders", href: "/admin/sliders", icon: Images },
    { title: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { title: "Customers", href: "/admin/customers", icon: Users },
    { title: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground overflow-hidden">
              <img src="/logo.png" alt="" className="h-6 w-auto" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-none"></div>
              <div className="text-xs text-muted-foreground">Admin</div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <Separator />
          <div className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Back to store">
                  <Link href="/">
                    <Store />
                    <span>Back to store</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="flex h-14 items-center gap-3 border-b bg-background px-4">
          <SidebarTrigger />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">Admin Dashboard</div>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
