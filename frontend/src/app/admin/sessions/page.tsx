import React from "react";
import { Metadata } from "next";
import { SessionsManagerClient } from "./SessionsManagerClient";

export const metadata: Metadata = {
  title: "সেশনস ম্যানেজার | নিজের বলার মতো একটা গল্প",
  description: "সেশনসমূহের প্রকাশনা তালিকা, শিডিউল ও ড্রাফট পরিচালনা।",
};

export default function AdminSessionsPage() {
  return <SessionsManagerClient />;
}
