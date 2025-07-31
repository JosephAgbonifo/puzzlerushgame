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

export default function CreateProject() {
  const network = "https://rpc.test.honeycombprotocol.com";
  const endpoint = useMemo(() => network, [network]);

  const wallets = useMemo(
    () => [
      // Manually define specific/custom wallets here
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [network]
  );

  const wallet = useWallet();
  const [projectAddress, setProjectAddress] = useState("");

  const handleCreateProject = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert("Please connect your wallet");
      return;
    }

    const authorityPublicKey = wallet.publicKey.toBase58();

    const {
      createCreateProjectTransaction: {
        project: newProjectAddress,
        tx: txResponse,
      },
    } = await client.createCreateProjectTransaction({
      name: "Word Puzzle Challenge",
      authority: authorityPublicKey,
      payer: authorityPublicKey,
      profileDataConfig: {
        achievements: [
          "First Solver",
          "One Hour One Win",
          "No Help Needed",
          "Streak Keeper",
          "Weekend Warrior",
          "The Dedicated",
          "Speed Demon",
          "Night Owl",
          "Lunchtime Brawler",
          "Flawless Victory",
          "One Shot Wonder",
          "Hard Mode Hero",
          "Puzzle Apprentice",
          "Puzzle Master",
          "Daily Legend",
          "All-Timer",
          "Secret Solver",
          "Hint Hoarder",
          "Procrastinator",
        ],
        customDataFields: [
          "XP",
          "Total Puzzles Solved",
          "Fastest Solve Time",
          "Current Streak",
          "Longest Streak",
          "Hints Used",
          "Wrong Guesses",
          "First Puzzle Date",
          "Last Puzzle Solved",
          "XP Claimable",
          "Tokens Claimed",
        ],
      },
    });

    await sendClientTransactions(client, wallet, txResponse);

    setProjectAddress(newProjectAddress);
    console.log("✅ Project created at:", newProjectAddress);
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div>
            <button
              onClick={handleCreateProject}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-green-600"
            >
              Create Project
            </button>
            {projectAddress && (
              <p className="mt-4">
                ✅ Project Address: <code>{projectAddress}</code>
              </p>
            )}
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
