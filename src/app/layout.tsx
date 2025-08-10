import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YaYa Practice - Year 1 Learning Fun",
  description: "Fun and interactive practice for Year 1 students in Math, English, and Science aligned with Cambridge Primary Curriculum",
  keywords: "year 1, primary education, math, english, science, cambridge curriculum, kids learning",
  authors: [{ name: "YaYa Practice" }],
  creator: "YaYa Practice",
  publisher: "YaYa Practice",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
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
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
