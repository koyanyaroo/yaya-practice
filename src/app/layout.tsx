import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { PERSONALIZATION } from "@/lib/personalization";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: `${PERSONALIZATION.user.name}'s Learning Space - Personalized Education`,
  description: `A private, personalized learning platform designed specifically for ${PERSONALIZATION.user.fullName} (${PERSONALIZATION.user.name}), featuring Math, English, and Science practice aligned with Cambridge Primary Curriculum`,
  keywords: `${PERSONALIZATION.user.name}, ${PERSONALIZATION.user.fullName}, personalized learning, year 1, primary education, math, english, science, cambridge curriculum`,
  authors: [{ name: PERSONALIZATION.user.parentName }],
  creator: PERSONALIZATION.user.parentName,
  publisher: `${PERSONALIZATION.user.name}'s Learning Space`,
  robots: "noindex, nofollow", // Private content, not for search engines
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          themes={['light', 'dark', 'high-contrast']}
        >
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">
              {children}
            </div>
          </div>
          <Toaster 
            richColors 
            position="top-center"
            duration={10000}
            className="[&>*]:duration-1000"
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
