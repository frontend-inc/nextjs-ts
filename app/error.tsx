"use client";

import React from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex items-center gap-6">
        <div className="text-lg font-medium text-black font-sans whitespace-nowrap">
          Something went wrong
        </div>
        <div className="border-l border-gray-300 h-6"></div>
        <div className="text-sm text-gray-700 font-sans max-w-lg">
          {error.message}
        </div>
      </div>
    </div>
  );
}
