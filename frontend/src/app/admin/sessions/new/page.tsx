import React from "react";
import { Metadata } from "next";
import { SessionEditorForm } from "@/components/admin/SessionEditorForm";

export const metadata: Metadata = {
  title: "নতুন সেশন রচনা | নিজের বলার মতো একটা গল্প",
  description: "কমিউনিটির জন্য নতুন সেশন লিখুন এবং প্রকাশ করুন।",
};

export default function NewSessionPage() {
  return (
    <SessionEditorForm
      isEditMode={false}
      initialData={{
        title: "",
        content: "",
        batch: 24,
        session_number: 164,
        status: "draft",
        scheduled_date: new Date().toISOString().slice(0, 10),
        scheduled_time: "২০:০০",
        tags: ["উদ্যোক্তা", "নীতিমালা"],
        is_featured: false,
        visibility: "public",
        seo_title: "",
        meta_description: "",
      }}
    />
  );
}
