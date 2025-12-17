import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

export const metadata: Metadata = {
  title: "Blog & Case Study Platform",
  description: "Collaborative blog and case study editor with real-time features",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-right" richColors />
            </AuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

