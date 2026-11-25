"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { banglaNumber } from "@/lib/utils";
import {
  Search,
  FilterX,
  Trash2,
  Check,
} from "lucide-react";

export interface UserItem {
  id: number | string;
  name: string;
  email: string;
  role: "admin" | "moderator" | "member";
  batch: number;
  reg_no: string;
  verification_status: "verified" | "pending" | "unverified";
  joined_date: string;
}

export type UserRow = UserItem;

const INITIAL_USERS: UserItem[] = [
  {
    id: 1,
    name: "ইকবাল বাহার জাহিদ",
    email: "mentor@nijerbolarmotogolpo.com",
    role: "admin",
    batch: 1,
    reg_no: "ADMIN-001",
    verification_status: "verified",
    joined_date: "০১ জানুয়ারি, ২০১৮",
  },
  {
    id: 2,
    name: "তানজিলা ইসলাম",
    email: "tanzila.mod@community.bd",
    role: "moderator",
    batch: 22,
    reg_no: "REG-22-0941",
    verification_status: "verified",
    joined_date: "১২ নভেম্বর, ২০২৩",
  },
  {
    id: 3,
    name: "ফারহানা হক",
    email: "farhana.h@example.com",
    role: "member",
    batch: 24,
    reg_no: "REG-24-9872",
    verification_status: "pending",
    joined_date: "১৪ মে, ২০২৪",
  },
  {
    id: 4,
    name: "তানভীর আহমেদ",
    email: "tanvir.ahm@example.com",
    role: "member",
    batch: 24,
    reg_no: "REG-24-3419",
    verification_status: "verified",
    joined_date: "১০ এপ্রিল, ২০২৪",
  },
  {
    id: 5,
    name: "কাজী কামরুল হাসান",
    email: "kamrul.agr@example.com",
    role: "member",
    batch: 25,
    reg_no: "REG-25-1102",
    verification_status: "unverified",
    joined_date: "০২ মে, ২০২৪",
  },
];

export function UserManagementClient({
  initialUsers,
}: {
  initialUsers?: UserItem[];
}) {
  const [users, setUsers] = useState<UserItem[]>(
    initialUsers && initialUsers.length > 0 ? initialUsers : INITIAL_USERS
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleRoleChange = async (userId: number | string, newRole: "admin" | "moderator" | "member") => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    toast.success("সদস্যের ভূমিকা সফলভাবে পরিবর্তন করা হয়েছে");

    try {
      await fetch(`/api/bff/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ role: newRole }),
      });
    } catch {
      // Graceful
    }
  };

  const handleToggleVerification = async (userId: number | string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const nextStatus = user.verification_status === "verified" ? "unverified" : "verified";
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, verification_status: nextStatus } : u))
    );
    toast.success(`ভেরিফিকেশন অবস্থা পরিবর্তন করে ${nextStatus === "verified" ? "যাচাইকৃত" : "অযাচাইকৃত"} করা হয়েছে`);

    try {
      await fetch(`/api/bff/admin/users/${userId}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ verification_status: nextStatus }),
      });
    } catch {
      // Graceful
    }
  };

  const handleDeleteUser = (userId: number | string, name: string) => {
    if (confirm(`আপনি কি নিশ্চিতভাবে ${name}-কে অপসারণ করতে চান?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.error(`${name}-কে প্ল্যাটফর্ম থেকে অপসারণ করা হয়েছে`);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (statusFilter !== "all" && u.verification_status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.reg_no.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 w-full font-bangla">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#e5e7eb]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight font-headline">
            ব্যবহারকারী ব্যবস্থাপনা
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 font-normal">
            সকল নিবন্ধিত সদস্য, মডারেটর এবং অ্যাডমিনদের তালিকা ও অধিকার পরিচালনা।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-lg bg-white border border-[#e5e7eb] text-xs font-mono font-semibold text-gray-700">
            মোট সদস্য: {banglaNumber(users.length)} জন
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, ইমেইল বা রেজিস্ট্রেশন আইডি দিয়ে অনুসন্ধান..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-xs text-black placeholder:text-gray-400 outline-none focus:border-mint focus:ring-1 focus:ring-mint focus:bg-white transition-all font-normal"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="ভূমিকা নির্বাচন"
            className="h-10 px-3 rounded-lg bg-white border border-[#e5e7eb] text-xs font-mono font-semibold text-black outline-none cursor-pointer"
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
            className="h-10 px-3 rounded-lg bg-white border border-[#e5e7eb] text-xs font-mono font-semibold text-black outline-none cursor-pointer"
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
            className="p-2.5 rounded-lg border border-[#e5e7eb] bg-white hover:bg-gray-50 text-gray-600 hover:text-black transition-all"
            title="ফিল্টার রিসেট করুন"
          >
            <FilterX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f9fafb] text-gray-700 text-xs font-mono font-semibold uppercase tracking-wider border-b border-[#e5e7eb] select-none">
                <th className="py-3.5 px-4">সদস্য</th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">ভূমিকা (Role)</th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">ব্যাচ ও আইডি</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">যাচাইকরণ অবস্থা</th>
                <th className="py-3.5 px-4 whitespace-nowrap">যোগদানের তারিখ</th>
                <th className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] text-xs">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#63DB9A]/20 text-black font-headline font-bold flex items-center justify-center text-xs shrink-0 border border-[#63DB9A]">
                        {user.name[0]}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-black text-sm truncate">
                          {user.name}
                        </span>
                        <span className="text-gray-500 font-mono text-xs truncate">
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
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold border outline-none cursor-pointer ${
                        user.role === "admin"
                          ? "bg-[#FF49D2]/15 text-black border-[#FF49D2]"
                          : user.role === "moderator"
                          ? "bg-[#E2E361]/20 text-black border-[#E2E361]"
                          : "bg-white text-gray-700 border-[#e5e7eb]"
                      }`}
                    >
                      <option value="admin">অ্যাডমিন</option>
                      <option value="moderator">মডারেটর</option>
                      <option value="member">সদস্য</option>
                    </select>
                  </td>

                  <td className="py-4 px-3 text-center whitespace-nowrap">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-black">
                        ব্যাচ {banglaNumber(user.batch)}
                      </span>
                      <span className="text-gray-500 font-mono text-[11px] font-semibold">
                        {user.reg_no}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleToggleVerification(user.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border transition-all ${
                        user.verification_status === "verified"
                          ? "bg-[#63DB9A]/20 text-black border-[#63DB9A]"
                          : user.verification_status === "pending"
                          ? "bg-[#E2E361]/20 text-black border-[#E2E361]"
                          : "bg-white text-gray-500 border-[#e5e7eb]"
                      }`}
                      title="ক্লিক করে স্ট্যাটাস পরিবর্তন করুন"
                    >
                      {user.verification_status === "verified" && (
                        <Check className="w-3.5 h-3.5 text-black stroke-[2.5]" />
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

                  <td className="py-4 px-4 whitespace-nowrap text-gray-600 font-mono text-xs">
                    {user.joined_date}
                  </td>

                  <td className="py-4 pl-3 pr-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="w-8 h-8 rounded-lg border border-[#e5e7eb] bg-white hover:bg-[#FF49D2]/15 text-gray-500 hover:text-black flex items-center justify-center transition-all"
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
