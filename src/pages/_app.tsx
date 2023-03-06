import "hover.css";
import type { AppProps } from "next/app";
import { RecoilRoot } from "recoil";

import { WalletProviderProvider } from "@hooks";
import { SpaceStateProviderProvider } from "src/hooks/use-space-state-provider";
import "../styles/App.css";
import "../styles/globals.css";

function App({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <WalletProviderProvider>
        <SpaceStateProviderProvider>
          <Component {...pageProps} />
        </SpaceStateProviderProvider>
      </WalletProviderProvider>
    </RecoilRoot>
  );
}

export default App;
