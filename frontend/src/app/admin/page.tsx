import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { banglaNumber, formatDateBn } from "@/lib/utils";
import {
  Users,
  CheckCircle2,
  BookOpen,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  Calendar,
  PlusCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  Clock,
  Mic,
  Check,
  X,
  ShieldCheck,
  AlertCircle,
  Radio,
} from "lucide-react";
import { AdminOverviewClient } from "./AdminOverviewClient";

export const metadata: Metadata = {
  title: "অ্যাডমিন ড্যাশবোর্ড | নিজের বলার মতো একটা গল্প",
  description: "কমিউনিটি প্ল্যাটফর্ম পরিচালনা ও সামগ্রিক কার্যক্রম পর্যবেক্ষণ।",
};

export default function AdminOverviewPage() {
  return <AdminOverviewClient />;
}
