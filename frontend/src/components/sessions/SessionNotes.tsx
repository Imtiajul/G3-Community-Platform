"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/lib/auth/context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Lock, Save, Edit3, Check } from "lucide-react";
import { toast } from "sonner";

interface SessionNotesProps {
  slug: string;
}

export function SessionNotes({ slug }: SessionNotesProps) {
  const user = useUser();
  const [noteContent, setNoteContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      fetch(`/api/bff/interactions/note?slug=${slug}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.content) {
            setNoteContent(data.content);
          }
        })
        .catch(() => {});
    }
  }, [user, slug]);

  if (!user) {
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/bff/interactions/note", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, content: noteContent }),
      });
      if (res.ok) {
        setSaved(true);
        toast.success("ব্যক্তিগত নোট সংরক্ষিত হয়েছে।");
        setTimeout(() => setSaved(false), 2000);
      } else {
        toast.error("নোট সংরক্ষণ করা সম্ভব হয়নি।");
      }
    } catch {
      toast.error("সার্ভারে সমস্যা হয়েছে।");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-10 p-6 rounded-xl border border-[#e5e7eb] bg-white font-bangla">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#63DB9A]/20 border border-[#63DB9A] flex items-center justify-center">
            <Edit3 className="w-4 h-4 text-black" />
          </div>
          <h3 className="text-base font-bold text-black font-headline">আমার ব্যক্তিগত নোট</h3>
        </div>
        <span className="text-xs text-gray-500 flex items-center gap-1 font-mono">
          <Lock className="w-3.5 h-3.5" /> শুধুমাত্র আপনি দেখতে পারবেন
        </span>
      </div>

      <Textarea
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
        placeholder="এই সেশন থেকে আপনার নিজস্ব উপলব্ধি বা গুরুত্বপূর্ণ পয়েন্টগুলো লিখে রাখুন..."
        rows={4}
        className="w-full text-sm mb-3 border-[#e5e7eb] rounded-lg focus-visible:ring-1 focus-visible:ring-mint"
      />

      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={saving}
          className="font-bold text-xs gap-1.5 bg-mint hover:bg-[#72eab0] text-black border border-mint rounded-lg"
        >
          {saved ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>সংরক্ষিত!</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "সংরক্ষণ হচ্ছে..." : "নোট সংরক্ষণ করুন"}</span>
            </>
          )}
        </Button>
      </div>
    </section>
  );
}
