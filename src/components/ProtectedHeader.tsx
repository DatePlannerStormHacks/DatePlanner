"use client";
import React from "react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import "../../styles/Header.css";

const ProtectedHeader = () => {
  return (
    <header className="header sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-16 items-center">
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
      </div>
  <div className="fixed right-0 h-16 flex items-center gap-4 pr-6 z-50" style={{ top: '50%', transform: 'translateY(-50%)' }}>
        <SignedIn>
          <Link href="/form">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2 px-4 rounded-2xl transition-colors">
              Plan a Date
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2 px-4 rounded-2xl transition-colors">
              Dashboard
            </button>
          </Link>
          <Link href="/profile">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2 px-4 rounded-2xl transition-colors">
              Profile
            </button>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </header>
  );
};

export default ProtectedHeader;