import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Coarse role check for staff/admin area
  if (user && user.role === "member") {
    redirect("/forbidden");
  }

  return (
    <div className="min-h-screen bg-white text-black font-bangla antialiased">
      <AdminSidebar />
      <div className="pl-72 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="w-full pt-16 px-6 sm:px-8 py-6 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
