import { Outlet } from "react-router-dom";
import AppSidebar from "../admin/app-sidebar";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Spinner } from "../ui/spinner";

export default function AdminLayout() {
  const { user, loading } = useAuth();

  console.log("AdminLayout render - user:", user);

  if (loading) {
    return (
      <div className="m-6 flex min-h-[60vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  console.log("AdminLayout - post");

  if (!user || user.role !== "admin") {
    console.log("Unauthorized access attempt to admin panel");
    return <Navigate to="/signin" />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
