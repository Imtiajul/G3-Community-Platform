"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { banglaNumber } from "@/lib/utils";
import {
  Search,
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  MoreVertical,
  Check,
  X,
  Shield,
  Trash2,
  FilterX,
} from "lucide-react";

export interface UserRow {
  id: number;
  name: string;
  email: string;
  role: "admin" | "moderator" | "member";
  batch: number;
  reg_no: string;
  verification_status: "verified" | "pending" | "unverified" | "rejected";
  joined_date: string;
}

const INITIAL_USERS: UserRow[] = [
  {
    id: 1,
    name: "ইকবাল বাহার জাহিদ",
    email: "mentor@nijerbolargolpo.com",
    role: "admin",
    batch: 1,
    reg_no: "FOUNDER-001",
    verification_status: "verified",
    joined_date: "০১ জানু, ২০১৮",
  },
  {
    id: 2,
    name: "নাজমুল হাসান",
    email: "nazmul.mod@example.com",
    role: "moderator",
    batch: 3,
    reg_no: "REG-03-0102",
    verification_status: "verified",
    joined_date: "১৫ মার্চ, ২০২০",
  },
  {
    id: 3,
    name: "ফারহানা হক",
    email: "farhana.h@example.com",
    role: "member",
    batch: 24,
    reg_no: "REG-24-9872",
    verification_status: "verified",
    joined_date: "১৪ মে, ২০২৪",
  },
  {
    id: 4,
    name: "তানভীর আহমেদ",
    email: "tanvir.ahm@example.com",
    role: "member",
    batch: 24,
    reg_no: "REG-24-3419",
    verification_status: "pending",
    joined_date: "১৪ মে, ২০২৪",
  },
  {
    id: 5,
    name: "রাশেদুল করিম",
    email: "rashed.k@example.com",
    role: "member",
    batch: 22,
    reg_no: "REG-22-5401",
    verification_status: "verified",
    joined_date: "১০ জানু, ২০২৩",
  },
  {
    id: 6,
    name: "কাজী কামরুল হাসান",
    email: "kamrul.agr@example.com",
    role: "member",
    batch: 25,
    reg_no: "REG-25-1102",
    verification_status: "unverified",
    joined_date: "২৫ মে, ২০২৪",
  },
];

export function UserManagementClient() {
  const [users, setUsers] = useState<UserRow[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleRoleChange = (userId: number, newRole: "admin" | "moderator" | "member") => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    toast.success("ব্যবহারকারীর ভূমিকা পরিবর্তন করা হয়েছে");
  };

  const handleToggleVerification = (userId: number) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.verification_status === "verified" ? "unverified" : "verified";
          toast.success(
            nextStatus === "verified"
              ? "সদস্য সফলভাবে যাচাই করা হয়েছে"
              : "সদস্যের যাচাইকরণ প্রত্যাহার করা হয়েছে"
          );
          return { ...u, verification_status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleDeleteUser = (userId: number, name: string) => {
    if (confirm(`আপনি কি নিশ্চিতভাবে ${name}-কে প্ল্যাটফর্ম থেকে অপসারণ করতে চান?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("ব্যবহারকারী মুছে ফেলা হয়েছে");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery.trim() ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.reg_no.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.verification_status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 w-full font-bangla">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            ব্যবহারকারী ব্যবস্থাপনা
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            সকল নিবন্ধিত সদস্য, মডারেটর এবং অ্যাডমিনদের তালিকা ও অধিকার পরিচালনা।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-semibold text-foreground shadow-sm">
            মোট সদস্য: {banglaNumber(users.length)} জন
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-card rounded-2xl p-4 border border-border shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, ইমেইল বা রেজিস্ট্রেশন আইডি দিয়ে অনুসন্ধান..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary/40 border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:bg-card focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="ভূমিকা নির্বাচন"
            className="h-10 px-3 rounded-xl bg-card border border-border text-xs text-foreground outline-none cursor-pointer"
          >
            <option value="all">সকল ভূমিকা (All Roles)</option>
            <option value="admin">অ্যাডমিন (Admin)</option>
            <option value="moderator">মডারেটর (Moderator)</option>
            <option value="member">সাধারণ সদস্য (Member)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="ভেরিফিকেশন অবস্থা"
            className="h-10 px-3 rounded-xl bg-card border border-border text-xs text-foreground outline-none cursor-pointer"
          >
            <option value="all">সকল ভেরিফিকেশন অবস্থা</option>
            <option value="verified">যাচাইকৃত (Verified)</option>
            <option value="pending">অপেক্ষমান (Pending)</option>
            <option value="unverified">অযাচাইকৃত (Unverified)</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setRoleFilter("all");
              setStatusFilter("all");
            }}
            className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary border border-border transition-colors"
            title="ফিল্টার রিসেট করুন"
          >
            <FilterX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/40 text-muted-foreground text-xs font-semibold border-b border-border select-none">
                <th className="py-3.5 px-4 font-semibold">সদস্য</th>
                <th className="py-3.5 px-3 font-semibold text-center whitespace-nowrap">ভূমিকা (Role)</th>
                <th className="py-3.5 px-3 font-semibold text-center whitespace-nowrap">ব্যাচ ও আইডি</th>
                <th className="py-3.5 px-4 font-semibold text-center whitespace-nowrap">যাচাইকরণ অবস্থা</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">যোগদানের তারিখ</th>
                <th className="py-3.5 pl-3 pr-5 font-semibold text-right whitespace-nowrap">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                        {user.name[0]}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-foreground text-sm truncate">
                          {user.name}
                        </span>
                        <span className="text-muted-foreground text-xs truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-3 text-center whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(
                          user.id,
                          e.target.value as "admin" | "moderator" | "member"
                        )
                      }
                      aria-label={`${user.name}-এর ভূমিকা নির্বাচন`}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border outline-none cursor-pointer ${
                        user.role === "admin"
                          ? "bg-rose-50 text-rose-800 border-rose-200"
                          : user.role === "moderator"
                          ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                          : "bg-secondary text-foreground border-border"
                      }`}
                    >
                      <option value="admin">অ্যাডমিন</option>
                      <option value="moderator">মডারেটর</option>
                      <option value="member">সদস্য</option>
                    </select>
                  </td>

                  <td className="py-4 px-3 text-center whitespace-nowrap">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-foreground">
                        ব্যাচ {banglaNumber(user.batch)}
                      </span>
                      <span className="text-muted-foreground font-mono text-[11px]">
                        {user.reg_no}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleToggleVerification(user.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                        user.verification_status === "verified"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : user.verification_status === "pending"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-secondary text-muted-foreground border-border"
                      }`}
                      title="ক্লিক করে স্ট্যাটাস পরিবর্তন করুন"
                    >
                      {user.verification_status === "verified" && (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span>
                        {user.verification_status === "verified"
                          ? "যাচাইকৃত"
                          : user.verification_status === "pending"
                          ? "অপেক্ষমান"
                          : "অযাচাইকৃত"}
                      </span>
                    </button>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap text-muted-foreground">
                    {user.joined_date}
                  </td>

                  <td className="py-4 pl-3 pr-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="সদস্য অপসারণ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
