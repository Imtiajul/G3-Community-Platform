import React from "react";
import { Metadata } from "next";
import { ModerationDeskClient } from "./ModerationDeskClient";

export const metadata: Metadata = {
  title: "মন্তব্য মডারেশন | নিজের বলার মতো একটা গল্প",
  description: "কমিউনিটি নির্দেশিকা পরিপন্থী রিপোর্টকৃত মন্তব্যের নিষ্পত্তি ও নিয়ন্ত্রণ।",
};

export default function AdminModerationPage() {
  return <ModerationDeskClient />;
}
