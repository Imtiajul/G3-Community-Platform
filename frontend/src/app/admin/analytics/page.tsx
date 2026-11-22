import React from "react";
import { Metadata } from "next";
import { AnalyticsClient } from "./AnalyticsClient";

export const metadata: Metadata = {
  title: "পরিসংখ্যান ও অ্যানালিটিক্স | নিজের বলার মতো একটা গল্প",
  description: "প্ল্যাটফর্মের প্রবৃদ্ধি, সেশন এনগেজমেন্ট এবং ব্যাচ বিশ্লেষণের মেট্রিক্স।",
};

export default function AdminAnalyticsPage() {
  return <AnalyticsClient />;
}
