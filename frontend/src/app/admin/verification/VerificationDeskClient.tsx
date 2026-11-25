"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { banglaNumber } from "@/lib/utils";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  X,
  Eye,
  Info,
  ShieldCheck,
  RefreshCw,
  UserCheck,
} from "lucide-react";

export interface ApplicantDetail {
  id: number | string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  batch: number;
  reg_no: string;
  district: string;
  profession: string;
  submitted_at: string;
  matched_roster: boolean;
  status: "pending" | "approved" | "rejected" | string;
}

const INITIAL_APPLICANTS: ApplicantDetail[] = [
  {
    id: 1,
    name: "ফারহানা হক",
    initials: "ফা",
    email: "farhana.h@example.com",
    phone: "০১৭১২-৩৪৫৬৭৮",
    batch: 24,
    reg_no: "REG-24-9872",
    district: "সিলেট",
    profession: "ই-কমার্স উদ্যোক্তা (হস্তশিল্প)",
    submitted_at: "১৪ মে, ২০২৪ • ০২:১৫ অপরাহ্ন",
    matched_roster: true,
    status: "pending",
  },
  {
    id: 2,
    name: "তানভীর আহমেদ",
    initials: "তা",
    email: "tanvir.ahm@example.com",
    phone: "০১৮১৯-৮৭৬৫৪৩",
    batch: 24,
    reg_no: "REG-24-3419",
    district: "রাজশাহী",
    profession: "বুটিক ও পোশাক প্রস্তুতকারক",
    submitted_at: "১৪ মে, ২০২৪ • ১১:৩০ পূর্বাহ্ন",
    matched_roster: true,
    status: "pending",
  },
  {
    id: 3,
    name: "কাজী কামরুল হাসান",
    initials: "কা",
    email: "kamrul.agr@example.com",
    phone: "০১৯১১-২২৩৩৪৪",
    batch: 25,
    reg_no: "REG-25-1102",
    district: "চট্টগ্রাম",
    profession: "কৃষি প্রক্রিয়াজাতকরণ ও সরবরাহ",
    submitted_at: "১৩ মে, ২০২৪ • ০৬:৪৫ অপরাহ্ন",
    matched_roster: false,
    status: "pending",
  },
  {
    id: 4,
    name: "মাহমুদুল হাসান",
    initials: "মা",
    email: "m.hasan@example.org",
    phone: "০১৭৩৩-৯৯৮৮৭৭",
    batch: 23,
    reg_no: "REG-23-8841",
    district: "ঢাকা",
    profession: "সফটওয়্যার ও আইটি সেবা",
    submitted_at: "১৩ মে, ২০২৪ • ০২:২০ অপরাহ্ন",
    matched_roster: true,
    status: "pending",
  },
  {
    id: 5,
    name: "নুসরাত জাহান আরা",
    initials: "নআ",
    email: "nusrat.jahan@domain.bd",
    phone: "০১৬২২-৫৫৮৮৯৯",
    batch: 25,
    reg_no: "REG-25-4420",
    district: "বরিশাল",
    profession: "খাদ্য ও বেকারি পণ্য",
    submitted_at: "১২ মে, ২০২৪ • ০৮:১০ অপরাহ্ন",
    matched_roster: true,
    status: "pending",
  },
];

export function VerificationDeskClient({
  initialApplicants,
}: {
  initialApplicants?: ApplicantDetail[];
}) {
  const [applicants, setApplicants] = useState<ApplicantDetail[]>(
    initialApplicants && initialApplicants.length > 0 ? initialApplicants : INITIAL_APPLICANTS
  );
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantDetail>(
    initialApplicants && initialApplicants.length > 0 ? initialApplicants[0]! : INITIAL_APPLICANTS[0]!
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingCount = applicants.filter((a) => a.status === "pending").length;
  const approvedCount = 1450 + applicants.filter((a) => a.status === "approved").length;
  const rejectedCount = 38 + applicants.filter((a) => a.status === "rejected").length;

  const handleApprove = async (applicant: ApplicantDetail) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/bff/admin/verification/${applicant.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ reviewer_note: "অনুমোদিত" }),
      });

      if (!res.ok) {
        if (res.status === 409) {
          toast.error("অন্য একজন মডারেটর ইতিমধ্যে এই আবেদনটি পর্যালোচনা করেছেন (409 Conflict)");
        } else {
          toast.error("অনুমোদনে সমস্যা হয়েছে।");
        }
      } else {
        setApplicants((prev) =>
          prev.map((a) => (a.id === applicant.id ? { ...a, status: "approved" } : a))
        );
        toast.success(`${applicant.name}-এর রেজিস্ট্রেশন অনুমোদন করা হয়েছে`);
        const nextPending = applicants.find((a) => a.id !== applicant.id && a.status === "pending");
        if (nextPending) setSelectedApplicant(nextPending);
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা, পুনরায় চেষ্টা করুন");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (applicant: ApplicantDetail) => {
    if (!rejectionReason.trim()) {
      toast.error("প্রত্যাখ্যানের সুনির্দিষ্ট কারণ উল্লেখ করা বাধ্যতামূলক");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/bff/admin/verification/${applicant.id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ rejection_reason: rejectionReason }),
      });

      if (!res.ok) {
        if (res.status === 409) {
          toast.error("অন্য একজন মডারেটর ইতিমধ্যে পর্যালোচনা করেছেন (409 Conflict)");
        } else {
          toast.error("প্রত্যাখ্যান ব্যর্থ হয়েছে");
        }
      } else {
        setApplicants((prev) =>
          prev.map((a) => (a.id === applicant.id ? { ...a, status: "rejected" } : a))
        );
        toast.error(`${applicant.name}-এর আবেদন প্রত্যাখ্যান করা হয়েছে`);
        setRejectionReason("");
        const nextPending = applicants.find((a) => a.id !== applicant.id && a.status === "pending");
        if (nextPending) setSelectedApplicant(nextPending);
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredApplicants = applicants.filter((a) => {
    if (a.status !== activeTab) return false;
    if (batchFilter !== "all" && a.batch.toString() !== batchFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.reg_no.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 w-full font-bangla">
      {/* Top Header Bar with Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#e5e7eb]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight font-headline">
              সদস্যপদ যাচাইয়ের আবেদনসমূহ
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#63DB9A]/20 text-black border border-[#63DB9A] text-xs font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
              {banglaNumber(pendingCount)}টি নতুন আবেদন পর্যালোচনা প্রয়োজন
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 font-normal">
            কমিউনিটি সদস্যদের আত্মপরিচয় ও ব্যাচ রেজিস্ট্রেশন সংক্রান্ত আবেদন গভীরভাবে নিরীক্ষা ও অনুমোদন সিদ্ধান্ত গ্রহণ করুন।
          </p>
        </div>

        {/* Pace stat capsule */}
        <div className="flex items-center gap-2 bg-white border border-[#e5e7eb] p-1.5 rounded-lg text-xs font-mono">
          <div className="px-3 py-1.5 bg-[#E2E361]/20 border border-[#E2E361] rounded-md flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-black" />
            <span className="text-gray-600">আজকের গতি:</span>
            <span className="font-bold text-black font-mono">২৮/৪০ নিষ্পত্তি</span>
          </div>
        </div>
      </div>

      {/* Segmented Status Tabs */}
      <div className="flex items-center gap-2 bg-[#f9fafb] border border-[#e5e7eb] p-1.5 rounded-xl w-fit text-xs font-bold font-mono">
        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
            activeTab === "pending"
              ? "bg-mint text-black border-mint"
              : "border-transparent text-gray-600 hover:text-black hover:bg-white"
          }`}
        >
          <span>অপেক্ষমান</span>
          <span className="px-2 py-0.5 rounded-full bg-[#E2E361]/20 text-black border border-[#E2E361] text-[10px] font-bold">
            {banglaNumber(pendingCount)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("approved")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
            activeTab === "approved"
              ? "bg-mint text-black border-mint"
              : "border-transparent text-gray-600 hover:text-black hover:bg-white"
          }`}
        >
          <span>অনুমোদিত</span>
          <span className="px-2 py-0.5 rounded-full bg-[#63DB9A]/20 text-black border border-[#63DB9A] text-[10px] font-bold">
            {banglaNumber(approvedCount)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rejected")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
            activeTab === "rejected"
              ? "bg-mint text-black border-mint"
              : "border-transparent text-gray-600 hover:text-black hover:bg-white"
          }`}
        >
          <span>প্রত্যাখ্যাত</span>
          <span className="px-2 py-0.5 rounded-full bg-[#FF49D2]/15 text-black border border-[#FF49D2] text-[10px] font-bold">
            {banglaNumber(rejectedCount)}
          </span>
        </button>
      </div>

      {/* Filter & Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, ইমেইল বা রেজিস্ট্রেশন নম্বর দিয়ে খুঁজুন..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-xs text-black placeholder:text-gray-400 outline-none focus:border-mint focus:ring-1 focus:ring-mint focus:bg-white transition-all font-normal"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            aria-label="ব্যাচ ফিল্টার"
            className="h-10 px-3 rounded-lg bg-white border border-[#e5e7eb] text-xs text-black font-mono font-semibold outline-none cursor-pointer"
          >
            <option value="all">সকল ব্যাচ (সার্বজনীন)</option>
            <option value="25">ব্যাচ ২৫</option>
            <option value="24">ব্যাচ ২৪</option>
            <option value="23">ব্যাচ ২৩</option>
          </select>
        </div>
      </div>

      {/* Master-Detail Work Surface: Split Grid (7 cols + 5 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* LEFT TABLE: 7 Cols */}
        <div className="xl:col-span-7 bg-white rounded-xl border border-[#e5e7eb] overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f9fafb] text-gray-700 text-xs font-mono font-semibold uppercase tracking-wider border-b border-[#e5e7eb] select-none">
                  <th className="py-3.5 px-4">আবেদনকারী</th>
                  <th className="py-3.5 px-3">ব্যাচ ও আইডি</th>
                  <th className="py-3.5 px-3">রোস্টার অবস্থা</th>
                  <th className="py-3.5 px-4 text-right">সিদ্ধান্ত</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb] text-xs">
                {filteredApplicants.length > 0 ? (
                  filteredApplicants.map((applicant) => (
                    <tr
                      key={applicant.id}
                      onClick={() => setSelectedApplicant(applicant)}
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                        selectedApplicant.id === applicant.id ? "bg-[#63DB9A]/10" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#63DB9A]/20 text-black font-headline font-bold flex items-center justify-center text-xs shrink-0 border border-[#63DB9A]">
                            {applicant.initials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-black text-sm truncate">
                              {applicant.name}
                            </span>
                            <span className="text-gray-500 font-mono text-[11px] truncate">
                              {applicant.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-black">
                            ব্যাচ {banglaNumber(applicant.batch)}
                          </span>
                          <span className="text-gray-500 font-mono text-[11px] font-semibold">
                            {applicant.reg_no}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {applicant.matched_roster ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#63DB9A]/20 text-black border border-[#63DB9A] text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-black" />
                            রোস্টারে মিলেছে
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FF49D2]/15 text-black border border-[#FF49D2] text-[11px] font-bold">
                            মিলেনি
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {applicant.status === "pending" && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(applicant);
                                }}
                                className="w-8 h-8 rounded-lg border border-mint bg-mint text-black flex items-center justify-center hover:bg-[#72eab0] transition-all"
                                title="অনুমোদন করুন"
                              >
                                <Check className="w-4 h-4 stroke-[2.5]" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedApplicant(applicant);
                                }}
                                className="w-8 h-8 rounded-lg border border-[#e5e7eb] bg-white text-gray-600 hover:text-black hover:bg-gray-50 flex items-center justify-center transition-all"
                                title="বিবরণ দেখুন"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {applicant.status !== "pending" && (
                            <span className="text-gray-700 font-mono font-semibold text-xs uppercase px-2.5 py-0.5 rounded-full border border-[#e5e7eb] bg-[#f9fafb]">
                              {applicant.status === "approved" ? "অনুমোদিত" : "প্রত্যাখ্যাত"}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500 font-mono">
                      কোনো আবেদন খুঁজে পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT DETAIL INSPECTION PANEL: 5 Cols */}
        <div className="xl:col-span-5 bg-white rounded-xl border border-[#e5e7eb] p-6 flex flex-col gap-5">
          {/* Panel Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#e5e7eb]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-black" />
              <h2 className="text-base font-bold text-black font-headline">আবেদনকারী যাচাই বিবরণী</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E2E361]/20 text-black border border-[#E2E361] text-xs font-mono font-bold">
              {selectedApplicant.status === "pending"
                ? "অপেক্ষমান"
                : selectedApplicant.status === "approved"
                ? "অনুমোদিত"
                : "প্রত্যাখ্যাত"}
            </span>
          </div>

          {/* Collision Warning Alert */}
          <div className="p-3 bg-[#E2E361]/20 border border-[#E2E361] rounded-lg flex items-start gap-3 text-xs">
            <Info className="w-4 h-4 text-black shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <p className="font-bold text-black font-mono">সহকর্মী কার্যকলাপ নোটিশ</p>
              <p className="text-gray-700 leading-relaxed font-bangla font-normal">
                মডারেটর তানজিলা ইসলাম ৩ মিনিট পূর্বে এই ব্যাচের নথি যাচাই করছিলেন। একযোগে কাজ করার ক্ষেত্রে কনফ্লিক্ট এড়াতে নিশ্চিত হয়ে সিদ্ধান্ত নিন।
              </p>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-[#f9fafb] p-4 rounded-xl border border-[#e5e7eb] flex flex-col gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#63DB9A]/20 text-black font-headline font-bold text-base flex items-center justify-center shrink-0 border border-[#63DB9A]">
                {selectedApplicant.initials}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-black text-sm">
                  {selectedApplicant.name}
                </span>
                <span className="text-gray-500 font-mono">{selectedApplicant.email}</span>
                <span className="text-gray-700 font-mono font-semibold">{selectedApplicant.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#e5e7eb]">
              <div>
                <span className="text-gray-500 block text-[11px] font-mono">ব্যাচ নম্বর</span>
                <span className="font-bold text-black">
                  ব্যাচ {banglaNumber(selectedApplicant.batch)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px] font-mono">রেজিস্ট্রেশন নং</span>
                <span className="font-bold text-black font-mono">
                  {selectedApplicant.reg_no}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px] font-mono">জেলা</span>
                <span className="font-bold text-black">
                  {selectedApplicant.district}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px] font-mono">উদ্যোগ / পেশা</span>
                <span className="font-bold text-black">
                  {selectedApplicant.profession}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#e5e7eb]">
              <span className="text-gray-500 block text-[11px] font-mono">জমা দেওয়ার তারিখ</span>
              <span className="text-gray-700 font-mono font-medium">{selectedApplicant.submitted_at}</span>
            </div>
          </div>

          {/* Rejection reason textarea */}
          {selectedApplicant.status === "pending" && (
            <div className="flex flex-col gap-2">
              <label htmlFor="rejection-reason-input" className="text-xs font-mono font-bold text-black uppercase">
                প্রত্যাখ্যানের কারণ (প্রত্যাখ্যান করতে চাইলে আবশ্যক):
              </label>
              <textarea
                id="rejection-reason-input"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="যেমন: রেজিস্ট্রেশন নম্বর রোস্টারের সাথে মেলেনি বা ভুল তথ্য..."
                rows={3}
                className="w-full p-3 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-xs text-black placeholder:text-gray-400 outline-none resize-none focus:border-mint focus:ring-1 focus:ring-mint focus:bg-white transition-all font-normal"
              />
            </div>
          )}

          {/* Action buttons */}
          {selectedApplicant.status === "pending" && (
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleReject(selectedApplicant)}
                className="flex-1 py-2.5 rounded-lg border border-[#e5e7eb] bg-white hover:bg-[#FF49D2]/15 text-black text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-50"
              >
                প্রত্যাখ্যান
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleApprove(selectedApplicant)}
                className="flex-1 py-2.5 rounded-lg border border-mint bg-mint hover:bg-[#72eab0] text-black text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-50"
              >
                অনুমোদন করুন
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
