import React, { useMemo } from "react";
import type { AppProps } from "next/app";

import "../styles/globals.css";
import "../styles/App.css";
import { Toaster } from "react-hot-toast";

import Head from "next/head";
import { Footer } from "@components/layout/footer";
import { WalletProviderProvider } from "src/contexts/wallet-provider";
import { RecoilRoot } from "recoil";

function App({ Component, pageProps }: AppProps) {
  return (
    <WalletProviderProvider>
      <RecoilRoot>
        <Component {...pageProps} />
      </RecoilRoot>
    </WalletProviderProvider>
  );
}

export default App;
