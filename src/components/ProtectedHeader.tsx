"use client";
import React from "react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import "../../styles/Header.css";

const ProtectedHeader = () => {
  return (
    <header className="header sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/logo.png"
            alt="DatePlanner Logo"
            width={56}
            height={56}
            className="h-14 w-14 border-2 border-gray-800 rounded-full"
          />
          <span className="text-xl font-bold text-custom-sage">DatePlanner</span>
        </Link>

        <div className="flex gap-4 items-center">
          <SignedIn>
            <Link href="/form">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2 px-4 rounded transition-colors">
                Plan a Date
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2 px-4 rounded transition-colors">
                Dashboard
              </button>
            </Link>
            <Link href="/profile">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2 px-4 rounded transition-colors">
                Profile
              </button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default ProtectedHeader;