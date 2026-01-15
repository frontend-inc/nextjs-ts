"use client";

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex items-center gap-6">
        <div className="text-lg font-medium text-black font-sans whitespace-nowrap">
          404
        </div>
        <div className="border-l border-gray-300 h-6"></div>
        <div className="text-sm text-gray-700 font-sans max-w-lg">
          This page could not be found.
        </div>
      </div>
    </div>
  );
}
