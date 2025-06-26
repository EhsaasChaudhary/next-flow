// layout.tsx
'use client'
import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "react-hot-toast";

// Import the ReactFlowProvider and your new UserProvider
import { ReactFlowProvider } from '@xyflow/react';
import { UserProvider, useUserContext } from "@/app/provider/user-provider"; // Import useUserContext too

import { ThemeProvider } from "@/app/provider/theme-provider";
import { ThemeSwitcher } from "@/components/shared/ThemeSwitcher";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// Component for the header with user selection
function AppHeader() {
  const { currentUser, setCurrentUser, demoUsers } = useUserContext();

  return (
    <header className="sticky top-3 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 h-14"> {/* Used h-16 explicitly */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-full items-center justify-between"> {/* Used h-full inside h-16 parent */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <span className="font-bold text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Next Flow
            </span>
          </div>

          {/* User Selector & Actions Section with Theme Switcher */}
          <div className="flex items-center gap-4">
             {/* User Selector */}
            <div className="flex items-center">
              <span className="mr-2 text-sm">Current User:</span>
              {demoUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => setCurrentUser(user.id)}
                  className={cn(
                    "px-3 py-1 rounded text-xs md:text-sm", // Adjust button size for small screens
                    currentUser === user.id ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-800 hover:bg-gray-400",
                    user !== demoUsers[demoUsers.length - 1] && "mr-1 md:mr-2" // Adjust margin
                  )}
                >
                  {user.name}
                </button>
              ))}
            </div>
            {/* Theme Switcher */}
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}


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

          {/* Wrap children and ReactFlowProvider with UserProvider */}
          <UserProvider>
            {/* Header */}
            <AppHeader /> {/* Use the header component */}

            <main className="relative flex-1 w-full overflow-hidden z-10"> {/* Add z-index: 10 */}
              <ReactFlowProvider>
                {children}
              </ReactFlowProvider>
            </main>

            {/* Footer */}
            <footer className="border-t bg-muted/30 w-full py-6 z-0"> {/* Add z-index: 0 */}
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-0">
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <p>Built with Next.js, React Flow and TweakCN Theme System</p>
                </div>
              </div>
            </footer>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}