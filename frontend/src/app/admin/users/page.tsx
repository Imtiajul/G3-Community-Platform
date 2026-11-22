import React from "react";
import { Metadata } from "next";
import { UserManagementClient } from "./UserManagementClient";

export const metadata: Metadata = {
  title: "ব্যবহারকারী ব্যবস্থাপনা | নিজের বলার মতো একটা গল্প",
  description: "সদস্য তালিকা, রোল ম্যানেজমেন্ট এবং অনুমতি প্রশাসন।",
};

export default function AdminUsersPage() {
  return <UserManagementClient />;
}
