import type { Metadata } from "next";
import { Noto_Sans_Bengali, Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { getCurrentUser } from "@/lib/auth/current-user";
import { UserProvider } from "@/lib/auth/context";
import { TanstackQueryProvider } from "@/components/shared/TanstackQueryProvider";
import { Toaster } from "sonner";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-noto-sans-bengali",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "নিজের বলার মতো একটা গল্প | উদ্যোক্তা ও মূল্যবোধের পাঠশালা",
  description:
    "প্রতিদিনের সেশন, শেখা আর একসাথে এগিয়ে চলার একটি অবাণিজ্যিক প্ল্যাটফর্ম। সততা ও আত্মমর্যাদার সাথে উদ্যোক্তা হওয়ার উন্মুক্ত পাঠশালা।",
  keywords: [
    "নিজের বলার মতো একটা গল্প",
    "উদ্যোক্তা",
    "Bangla Community",
    "ইকবাল বাহার জাহিদ",
    "Entrepreneurship",
  ],
  authors: [{ name: "ইকবাল বাহার জাহিদ" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "নিজের বলার মতো একটা গল্প",
    description: "উদ্যোক্তা উন্নয়ন, সততা ও মূল্যবোধের ধারাবাহিক শিক্ষণ প্ল্যাটফর্ম।",
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "নিজের বলার মতো একটা গল্প",
    description: "উদ্যোক্তা উন্নয়ন, সততা ও মূল্যবোধের ধারাবাহিক শিক্ষণ প্ল্যাটফর্ম।",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html
      lang="bn"
      className={`${notoSansBengali.variable} ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="font-bangla bg-background text-foreground min-h-screen flex flex-col antialiased">
        <TanstackQueryProvider>
          <UserProvider initialUser={user}>
            {children}
            <Toaster position="bottom-right" richColors />
          </UserProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  );
}
