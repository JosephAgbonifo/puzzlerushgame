"use client";

import { useMemo, useState } from "react";
import { sendClientTransactions } from "@honeycomb-protocol/edge-client/client/walletHelpers";
import { client } from "./client";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

export default function CreateProfileTree() {
  const network = "https://rpc.test.honeycombprotocol.com";
  const endpoint = useMemo(() => network, [network]);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  const wallet = useWallet();
  const [treeTxStatus, setTreeTxStatus] = useState("");
  const [projectAddress, setProjectAddress] = useState(""); // 👈 You'll need to input this manually or fetch it

  const handleCreateProfileTree = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert("Please connect your wallet");
      return;
    }

    if (!projectAddress) {
      alert("Please enter a valid project address");
      return;
    }

    try {
      const { createCreateProfilesTreeTransaction: txResponse } =
        await client.createCreateProfilesTreeTransaction({
          payer: wallet.publicKey.toBase58(),
          project: projectAddress,
          treeConfig: {
            basic: {
              numAssets: 100000,
            },
          },
        });

      await sendClientTransactions(client, wallet, txResponse.tx);
      setTreeTxStatus("✅ Profile tree created successfully");
    } catch (err) {
      console.error(err);
      setTreeTxStatus("❌ Failed to create profile tree");
    }
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter existing Project Address"
              value={projectAddress}
              onChange={(e) => setProjectAddress(e.target.value)}
              className="border px-2 py-1 w-full rounded"
            />
            <button
              onClick={handleCreateProfileTree}
              className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800"
            >
              Create Profile Tree
            </button>
            {treeTxStatus && <p>{treeTxStatus}</p>}
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
