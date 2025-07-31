import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { WalletContextState, useWallet } from "@solana/wallet-adapter-react";
import "@solana/wallet-adapter-react-ui/styles.css";
import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { sendClientTransactions } from "@honeycomb-protocol/edge-client/client/walletHelpers";
import { client } from "../services/honeycomb/client";
import PuzzleRushGame from "./maingame/main";
import { useUserStore } from "../stores/useUserStore";

const WordPuzzleGame: React.FC = () => {
  const { setUser } = useUserStore();
  const wallet = useWallet();
  const { connected } = wallet;
  const [readyForGame, setReadyForGame] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      if (!wallet?.connected || !wallet.publicKey) return;

      setCheckingUser(true);
      try {
        const { user: usersArray } = await client.findUsers({
          wallets: [wallet.publicKey.toString()],
        });

        console.log(usersArray);
        if (usersArray.length > 0) {
          const newUser = {
            name: usersArray[0].info.name,
            bio: usersArray[0].info.bio,
            pfp: usersArray[0].info.pfp,
            username: usersArray[0].info.username,
            id: usersArray[0].id,
          };
          setUser(newUser);
          console.log("User already exists");
          setReadyForGame(true);
        } else {
          console.log("New user detected. Showing registration form...");
        }
      } catch (err) {
        console.error("Failed to check user:", err);
      } finally {
        setCheckingUser(false);
      }
    };
    checkUser();
  }, [wallet.connected, wallet.publicKey]);

  const showGame = connected && !checkingUser && readyForGame;

  return <div>{showGame ? <PuzzleRushGame /> : <Prep />}</div>;
};

export default WordPuzzleGame;

function Prep() {
  const wallet = useWallet();
  const { connected } = wallet;

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [readyForGame, setReadyForGame] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);

  const projectAddress = new PublicKey(
    "C5HSbkBokqUb3KLCybdzWwaLqzZUHyR5D8hFEQvaZwZA"
  );
  const adminPublicKey = new PublicKey(
    "45eFXHAhh7xGFVcKFMRx8p1NL33Ac2MJzzTpQ4u71rS1"
  );

  useEffect(() => {
    const checkUser = async () => {
      if (!wallet?.connected || !wallet.publicKey) return;

      setCheckingUser(true);
      try {
        const { user: usersArray } = await client.findUsers({
          wallets: [wallet.publicKey.toString()],
        });

        if (usersArray.length > 0) {
          console.log("User already exists");
          setReadyForGame(true);
        } else {
          console.log("New user detected. Showing registration form...");
        }
      } catch (err) {
        console.error("Failed to check user:", err);
      } finally {
        setCheckingUser(false);
      }
    };

    checkUser();
  }, [wallet.connected, wallet.publicKey]);

  async function createUser(wallet: WalletContextState) {
    setIsLoading(true);

    if (!wallet || !wallet.publicKey || !wallet.signTransaction) {
      console.error("Wallet not connected or missing features.");
      return;
    }

    try {
      const { createNewUserWithProfileTransaction: txResponse } =
        await client.createNewUserWithProfileTransaction({
          project: projectAddress.toString(),
          wallet: wallet.publicKey.toString(),
          payer: adminPublicKey.toString(),
          profileIdentity: "main",
          userInfo: {
            name,
            bio,
            pfp: "https://lh3.googleusercontent.com/-Jsm7S8BHy4nOzrw2f5AryUgp9Fym2buUOkkxgNplGCddTkiKBXPLRytTMXBXwGcHuRr06EvJStmkHj-9JeTfmHsnT0prHg5Mhg",
          },
        });

      await sendClientTransactions(
        client, // The client instance you created earlier in the setup
        wallet, // The wallet you got from the useWallet hook
        txResponse // You can pass the transaction response containing either a single transaction or an array of transactions
      );
      const checkUser = async () => {
        if (!wallet?.connected || !wallet.publicKey) return;

        setCheckingUser(true);
        try {
          const { user: usersArray } = await client.findUsers({
            wallets: [wallet.publicKey.toString()],
          });

          if (usersArray.length > 0) {
            console.log("User already exists");
            setReadyForGame(true);
          } else {
            console.log("New user detected. Showing registration form...");
          }
        } catch (err) {
          console.error("Failed to check user:", err);
        } finally {
          setCheckingUser(false);
        }
      };

      checkUser();
    } catch (error) {
      console.error("Failed to create user:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center relative justify-center flex-col md:flex-row px-20 md:px-0">
      {connected && !checkingUser && !readyForGame && (
        <div className="w-96 h-96 bg-gray-950 z-[99] border-2 border-purple-950 text-white p-5 rounded absolute top-[calc(50% - 12rem)] left-[calc(50% - 12rem)]">
          <p className="text-xl pb-10 Outfit font-bold">
            Complete Registration :
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name..."
            className="text-white placeholder:text-gray-500 bg-transparent w-4/5 block m-auto border border-amber-600 rounded-2xl h-10 p-2 focus:outline-none focus:h-12 my-2 transition-all duration-500"
          />
          <input
            type="text"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Short Bio..."
            className="text-white placeholder:text-gray-500 bg-transparent w-4/5 block m-auto border border-amber-600 rounded-2xl h-10 p-2 focus:outline-none focus:h-12 my-2 transition-all duration-500"
          />
          <button
            disabled={!name || !bio}
            onClick={() => createUser(wallet)}
            className="text-white bg-purple-950 p-3 my-10 hover:bg-purple-800 transition-all duration-500 rounded-2xl"
          >
            {isLoading ? "Loading..." : "Continue"}
          </button>
        </div>
      )}
      <img
        src="/letters.png"
        alt="alphabets"
        className="absolute w-screen h-screen top-0 bottom-0 opacity-25"
      />

      <div className="z-50 md:flex-1 p-10 pt-40 md:pt-0 md:p-0 md:h-screen flex items-center justify-center">
        <img src="/pr.png" alt="Puzzle Rush" className="h-20 md:h-40 top-0" />
      </div>

      <div className="z-50 flex-1 md:h-screen flex items-center text-center md:justify-center flex-col">
        <img
          src="/coin.png"
          alt="Coin"
          className="md:h-20 h-10 top-0 opacity-80"
        />
        <p className="mt-10 text-amber-400 font-bold text-4xl">
          Welcome To Puzzle Rush
        </p>
        <p className="mb-10 mt-3 text-gray-200 font-bold text-xl">
          Enjoy a puzzling life........ <span>On Chain!</span>
        </p>

        {!connected && <WalletMultiButton />}
        {connected && checkingUser && (
          <p className="text-white mt-5">Checking user profile...</p>
        )}

        {connected && !checkingUser && readyForGame && <PuzzleRushGame />}
      </div>
    </div>
  );
}
