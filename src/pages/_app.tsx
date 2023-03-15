import "hover.css";
import type { AppProps } from "next/app";
import { RecoilRoot } from "recoil";

import { WalletProviderProvider } from "@hooks";
import "../styles/App.css";
import "../styles/globals.css";

function App({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <WalletProviderProvider>
        <Component {...pageProps} />
      </WalletProviderProvider>
    </RecoilRoot>
  );
}

export default App;
