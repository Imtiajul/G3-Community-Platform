import React from "react";
import { Metadata } from "next";
import { VerificationDeskClient } from "./VerificationDeskClient";

export const metadata: Metadata = {
  title: "যাচাইয়ের আবেদন ডেক্স | নিজের বলার মতো একটা গল্প",
  description: "সদস্যদের প্রোফাইল যাচাইকরণ ও অনুমোদন প্রক্রিয়া পরিচালনা।",
};

export default function AdminVerificationPage() {
  return <VerificationDeskClient />;
}
