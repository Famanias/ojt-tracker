import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import MuiThemeProvider from "@/components/shared/MuiThemeProvider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OJT Tracker System",
  description: "On-the-Job Training Time Tracking & Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <AppRouterCacheProvider>
          <MuiThemeProvider>
            <AuthProvider>{children}</AuthProvider>
          </MuiThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
