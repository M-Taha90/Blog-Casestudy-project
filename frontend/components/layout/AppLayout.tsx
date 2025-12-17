"use client";

import { Header } from "./Header";

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Main application layout with header
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}

