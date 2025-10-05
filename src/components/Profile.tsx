"use client";

import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Image from "next/image";

const Profile = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-slate-600">Loading your profile...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-2xl mx-auto"
    >
      <div className="text-center">
        {/* Profile Image */}
        <div className="relative mx-auto w-32 h-32 mb-6">
          <Image
            src={user.imageUrl || "/icon.png"}
            alt="Profile"
            width={128}
            height={128}
            className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400/20 to-fuchsia-400/20"></div>
        </div>

        {/* User Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-lg text-slate-600">
              @{user.username || user.emailAddresses[0]?.emailAddress?.split('@')[0] || "user"}
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <p className="text-slate-700 leading-relaxed">
              {user.publicMetadata?.bio as string || "Welcome to DatePlanner! Ready to create amazing date experiences? 💕"}
            </p>
          </div>

          {/* Stats or Additional Info */}
          <div className="flex justify-center gap-8 mt-8 pt-6 border-t border-slate-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">🎯</div>
              <div className="text-sm text-slate-600 mt-1">Date Planner</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-fuchsia-600">💝</div>
              <div className="text-sm text-slate-600 mt-1">Ready to Plan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">🌟</div>
              <div className="text-sm text-slate-600 mt-1">Member</div>
            </div>
          </div>

          {/* Contact Info */}
          {user.emailAddresses[0] && (
            <div className="mt-6 p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-600">
                <span className="font-medium">Email:</span>{" "}
                <span className="text-slate-800">{user.emailAddresses[0].emailAddress}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;