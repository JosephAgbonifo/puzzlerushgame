// Honeycomb SDK integration for on-chain missions and identity
export interface MissionMetadata {
  category: string;
  difficulty: "easy" | "medium" | "hard" | "expert" | "master"; // optional: restrict to known values
  xpReward: number;
}

export interface MissionResults {
  completionTime: number; // or Date, depending on your use
  accuracy: number;
  wordsFound: string[];
  xpEarned: number;
}
export interface Trait {
  name: string;
  level: number;
}
export interface PuzzleProof {
  timeTaken: number;
  wordsFound: string[];
  hash: string;
  [key: string]: unknown; // ✅ no more 'any'
}

export class HoneycombService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = "https://api.honeycomb.gg/v1";
  }

  // Mission Management
  async createMission(puzzleId: string, metadata: MissionMetadata) {
    try {
      const response = await fetch(`${this.baseUrl}/missions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: puzzleId,
          metadata: {
            puzzle_id: puzzleId,
            release_time: new Date().toISOString(),
            category: metadata.category,
            difficulty: metadata.difficulty,
            xp_reward: metadata.xpReward,
          },
        }),
      });
      return await response.json();
    } catch (error) {
      console.error("Failed to create mission:", error);
      throw error;
    }
  }

  async claimMission(missionId: string, walletAddress: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/missions/${missionId}/claim`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wallet_address: walletAddress,
            claimed_at: new Date().toISOString(),
          }),
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Failed to claim mission:", error);
      throw error;
    }
  }

  async completeMission(
    missionId: string,
    walletAddress: string,
    results: MissionResults
  ) {
    try {
      const response = await fetch(
        `${this.baseUrl}/missions/${missionId}/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wallet_address: walletAddress,
            completion_time: results.completionTime,
            accuracy: results.accuracy,
            words_found: results.wordsFound,
            xp_earned: results.xpEarned,
            completed_at: new Date().toISOString(),
          }),
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Failed to complete mission:", error);
      throw error;
    }
  }

  // Trait System
  async updatePlayerTraits(walletAddress: string, traits: Trait[]) {
    try {
      const response = await fetch(
        `${this.baseUrl}/players/${walletAddress}/traits`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            traits,
            updated_at: new Date().toISOString(),
          }),
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Failed to update traits:", error);
      throw error;
    }
  }

  async getPlayerProfile(walletAddress: string) {
    try {
      const response = await fetch(`${this.baseUrl}/players/${walletAddress}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.error("Failed to get player profile:", error);
      throw error;
    }
  }

  // Verification
  async verifyPuzzleCompletion(
    puzzleId: string,
    walletAddress: string,
    proof: PuzzleProof
  ) {
    try {
      const response = await fetch(`${this.baseUrl}/verify/puzzle`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          puzzle_id: puzzleId,
          wallet_address: walletAddress,
          proof,
          verified_at: new Date().toISOString(),
        }),
      });
      return await response.json();
    } catch (error) {
      console.error("Failed to verify puzzle completion:", error);
      throw error;
    }
  }
}
