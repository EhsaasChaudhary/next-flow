// layout.tsx

import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "react-hot-toast";

// Import the ReactFlowProvider
import { ReactFlowProvider } from '@xyflow/react';

import { ThemeProvider } from "@/app/provider/theme-provider";
import { ThemeSwitcher } from "@/components/shared/ThemeSwitcher";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // html tag is needed for suppressHydrationWarning
    <html lang="en" suppressHydrationWarning>
      {/* Apply overflow-hidden to the body to prevent overall page scroll */}
      {/* Ensure body is a flex column and fills at least the screen height */}
      <body className={cn("min-h-screen h-screen bg-background font-sans antialiased flex flex-col overflow-hidden", inter.variable)}>
        <ThemeProvider>
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: "var(--card)",
                color: "var(--card-foreground)",
                border: "1px solid var(--border)",
              },
            }}
          />

          {/* Header */}
          {/* Ensure header has a fixed height or minimum height so its space is reserved */}
          <header className="sticky top-4 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 h-14"> {/* Used h-16 explicitly */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex h-full items-center justify-between"> {/* Used h-full inside h-16 parent */}
                {/* Logo Section */}
                <div className="flex items-center gap-3 group cursor-pointer">
                  <span className="font-bold text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    Next Flow
                  </span>
                </div>

                {/* Navigation/Actions Section with Theme Switcher */}
                <div className="flex items-center gap-4">
                  <ThemeSwitcher />
                </div>
              </div>
            </div>
          </header>

          <main className="relative flex-1 w-full overflow-hidden">
             {/* Wrap the children (your page content like app/page.tsx) with ReactFlowProvider */}
            <ReactFlowProvider>
              {children}
            </ReactFlowProvider>
          </main>

          {/* Footer */}
           {/* Ensure footer has a fixed height or minimum height */}
          <footer className="border-t bg-muted/30 w-full py-6"> {/* py-6 adds padding */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-0"> {/* Inner div content, remove py-6 here */}
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <p>Built with Next.js and TweakCN Theme System</p>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}