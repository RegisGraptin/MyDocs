import { Metadata } from "next";
import { JetBrains_Mono, Open_Sans } from "next/font/google";

import "@rainbow-me/rainbowkit/styles.css";

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});
const fontSans = Open_Sans({ subsets: ["latin"], variable: "--font-sans" });

import { DataProvider } from "@/components/calimero/DataProvider";
import { DisplayUser } from "@/components/shared/DisplayUser";
import Header from "@/components/shared/header";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "MyDocs",
  description:
    "A decentralized, self-sovereign platform for collaborative document editing",
  openGraph: {
    type: "website",
    title: "MyDocs",
    description:
      "A decentralized, self-sovereign platform for collaborative document editing",
    siteName: "MyDocs",
    locale: "en_US",
    images: "/opengraph-image.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (

    <html
      lang="en"
      className={`${fontMono.variable} ${fontSans.variable} antialiased`}
    >
      <body>
        <DataProvider>
          <WalletProvider>
            <Header />
            <DisplayUser />
            <main>{children}</main>
          </WalletProvider>
        </DataProvider>
      </body>
    </html>
  )
}
