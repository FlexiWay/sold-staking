import React from "react";

import "./globals.css";

require("@solana/wallet-adapter-react-ui/styles.css");

import LayoutWrapper from "./LayoutWrapper";
import Head from "next/head";
import { Toaster } from "sonner";
import NewAppBar from "@/components/shared/NewAppBar";

type Metadata = any;
type Viewport = any;


const APP_NAME = "BUILDERZ Solana dApp Scaffold";
const APP_DEFAULT_TITLE = "BUILDERZ Solana dApp Scaffold";
const APP_TITLE_TEMPLATE = "%s - PWA App";
const APP_DESCRIPTION = "Best PWA app in the world!";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

const AppHead = ({ metadata, viewport }: any) => {
  return (
    <Head>
      <title>{metadata.title.default}</title>
      <meta name="description" content={metadata.description} />
      <link rel="manifest" href={metadata.manifest} />
      <meta name="theme-color" content={viewport.themeColor} />
      <style>{`:root { --font-sans: 'Inter', sans-serif; }`}</style>
      {/* Add other head elements as needed based on metadata and viewport */}
    </Head>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutWrapper>
      <AppHead metadata={metadata} viewport={viewport} />
      <html
        lang="en"
      >
        {/* <script async src="https://www.googletagmanager.com/gtag/js?id=G-YOURID"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-YOURID');
      `,
          }}
        ></script> */}
        <body >
          <NewAppBar />
          <div lang="en">{children}</div>
          <Toaster theme="dark" />
        </body>
      </html>
    </LayoutWrapper>
  );
}
