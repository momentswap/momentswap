import type { AppProps } from "next/app";
import { RecoilRoot } from "recoil";

import { WalletProviderProvider } from "src/hooks";
import "../styles/App.css";
import "../styles/globals.css";

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
