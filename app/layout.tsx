import type { Metadata } from "next";
import "./globals.css";
import ClientWrapper from "@/components/ClientWrapper";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner"


export const metadata: Metadata = {
  title: "TubeBetter",
  description: "Your Youtube AI Agent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        
      >
        <ClientWrapper>
          <Header />

          <main>{children}</main>
          <Toaster position="bottom-center" />
        </ClientWrapper>
      </body>
    </html>
  );
}
