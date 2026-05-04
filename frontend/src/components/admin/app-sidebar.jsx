import {
  BookOpen,
  LayoutDashboard,
  MessageSquareText,
  ReceiptText,
  Users,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import profilePhoto from "../../assets/photo_2026-05-04_02-11-40.jpg";
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
  SidebarSeparator,
} from "../ui/sidebar"

const navItems = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/admin/books",
    label: "Books",
    icon: BookOpen,
  },
  {
    to: "/admin/orders",
    label: "Orders",
    icon: ReceiptText,
  },
  {
    to: "/admin/customers",
    label: "Customers",
    icon: Users,
  },
  {
    to: "/admin/genres",
    label: "Genres",
    icon: BookOpen,
  },
  {
    to: "/admin/reviews",
    label: "Reviews",
    icon: MessageSquareText,
  },
  {
    to: "/admin/analytics",
    label: "Analytics",
    icon: LayoutDashboard,
  },
  {
    to: "/admin/settings",
    label: "Settings",
    icon: LayoutDashboard,
  }
];

export default function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar variant="inset" className="text-black" style={{ backgroundColor: 'rgb(175, 143, 111)' }}>
      <SidebarHeader>
        <div className="px-2 py-1">
          <p className="text-sm text-black/80">Readex</p>
          <h2 className="text-lg font-semibold text-black">Admin Panel</h2>
        </div>
      </SidebarHeader>

      <SidebarSeparator className="my-1 h-[2px] bg-white/30" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.to ||
                  (item.to !== "/admin/dashboard" &&
                    location.pathname.startsWith(item.to));

                return (
                  <SidebarMenuItem key={item.to} className="hover:bg-white/20">
                    <SidebarMenuButton asChild isActive={isActive} className="text-black">
                      <NavLink to={item.to}>
                        <Icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="my-1 h-[2px] bg-white/30" />

      <SidebarFooter>
        {/* adding an icon profile for the admin and a button for signing out */}
         <div className="flex items-center gap-2 px-4 py-3">
            <img
              src={profilePhoto}
              alt="Admin Profile"
              className="h-8 w-8 rounded-full border border-white/40 object-cover"
            />
            <div>
              <p className="text-sm font-medium text-white">Admin User</p>
              <button
                className="text-xs text-white hover:text-white border border-white rounded px-2 py-1 mt-1 hover:bg-white/20"
                onClick={() => {
                  alert("Sign out clicked");
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
      </SidebarFooter>
    </Sidebar>
  );
}
