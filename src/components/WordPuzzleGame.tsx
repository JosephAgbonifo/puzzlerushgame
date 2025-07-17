import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";

import { useWallet } from "@solana/wallet-adapter-react";
import PuzzleRushGame from "./maingame/main";

const WordPuzzleGame: React.FC = () => {
  const { connected } = useWallet();

  // Save player profile when it changes

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center relative justify-center flex-col md:flex-row px-20 md:px-0">
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
          <WalletMultiButton className="" />
        </div>
      </div>
    );
  }

  return <PuzzleRushGame />;
};

export default WordPuzzleGame;
