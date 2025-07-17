import { sendClientTransactions } from "@honeycomb-protocol/edge-client/client/walletHelpers";
import { client } from "./client";

async function createProject() {
  const authorityPublicKey = "45eFXHAhh7xGFVcKFMRx8p1NL33Ac2MJzzTpQ4u71rS1";

  const payerPublicKey = authorityPublicKey; // You’ll pay the fees too

  const {
    createCreateProjectTransaction: { project: projectAddress, tx: txResponse },
  } = await client.createCreateProjectTransaction({
    name: "Word Puzzle Challenge",
    authority: authorityPublicKey,
    payer: payerPublicKey,
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
        "XP", // Total experience points earned
        "Total Puzzles Solved", // Number of puzzles solved
        "Fastest Solve Time", // Best puzzle time
        "Current Streak", // Current consecutive daily solves
        "Longest Streak", // All-time best streak
        "Hints Used", // Total hints used
        "Wrong Guesses", // Total incorrect attempts
        "First Puzzle Date", // Date of first solve
        "Last Puzzle Solved", // Date of last solve
        "XP Claimable", // XP available to convert to tokens
        "Tokens Claimed", // Track how much they’ve already claimed
      ],
    },
  });

  // Get the transaction signed by the user and send it to the blockchain
  const response = await sendClientTransactions(
    client, // The client instance you created earlier in the setup
    wallet, // The wallet you got from the useWallet hook
    txResponse // You can pass the transaction response containing either a single transaction or an array of transactions
  );

  return <div>{response}</div>;
}

createProject();
