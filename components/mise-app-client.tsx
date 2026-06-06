"use client";

import dynamic from "next/dynamic";

const MiseApp = dynamic(
  () => import("@/components/mise-app").then((mod) => mod.MiseApp),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="skeleton h-8 w-32 rounded" />
      </div>
    ),
  },
);

export function MiseAppClient() {
  return <MiseApp />;
}
