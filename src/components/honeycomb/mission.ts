import { RewardKind } from "@honeycomb-protocol/edge-client";

/**
 * Create a mission pool transaction.
 */
export async function createMissionPoolTransaction(
  client: any,
  name: string,
  projectAddress: { toString(): string },
  payerPublicKey: { toString(): string },
  authorityPublicKey: { toString(): string },
  characterModelAddress: { toString(): string }
) {
  const {
    createCreateMissionPoolTransaction: { missionPoolAddress, tx },
  } = await client.createCreateMissionPoolTransaction({
    data: {
      name,
      project: projectAddress.toString(),
      payer: payerPublicKey.toString(),
      authority: authorityPublicKey.toString(),
      characterModel: characterModelAddress.toString(),
    },
  });

  return { missionPoolAddress, tx };
}

/**
 * Create a mission transaction.
 */
export interface MissionReward {
  kind: RewardKind;
  max: string;
  min: string;
  resource?: string;
}

export interface CreateMissionTransactionParams {
  client: any;
  name: string;
  projectAddress: { toString(): string };
  resourceAddress: { toString(): string };
  missionPoolAddress: { toString(): string };
  authorityPublicKey: { toString(): string };
  payerPublicKey: { toString(): string };
  costAmount?: string;
  duration?: string;
  minXp?: string;
  rewards?: MissionReward[];
}

export interface CreateMissionTransactionResult {
  missionAddress: string;
  tx: unknown;
}

export async function createMissionTransaction({
  client,
  name,
  projectAddress,
  resourceAddress,
  missionPoolAddress,
  authorityPublicKey,
  payerPublicKey,
  costAmount = "100000",
  duration = "86400",
  minXp = "50000",
  rewards = [],
}: CreateMissionTransactionParams): Promise<CreateMissionTransactionResult> {
  const {
    createCreateMissionTransaction: { missionAddress, tx },
  } = await client.createCreateMissionTransaction({
    data: {
      name,
      project: projectAddress.toString(),
      cost: {
        address: resourceAddress.toString(),
        amount: costAmount,
      },
      duration,
      minXp,
      rewards: rewards.length
        ? rewards
        : [
            {
              kind: RewardKind.Xp,
              max: "100",
              min: "100",
            },
            {
              kind: RewardKind.Resource,
              max: "50000000",
              min: "25000000",
              resource: resourceAddress.toString(),
            },
          ],
      missionPool: missionPoolAddress.toString(),
      authority: authorityPublicKey.toString(),
      payer: payerPublicKey.toString(),
    },
  });

  return { missionAddress, tx };
}

/**
 * Send characters on a mission.
 */
export interface SendCharactersOnMissionTransactionParams {
  client: any;
  missionAddress: { toString(): string };
  characterAddresses: Array<{ toString(): string }>;
  authorityPublicKey: { toString(): string };
  payerPublicKey?: { toString(): string };
}

export async function sendCharactersOnMissionTransaction({
  client,
  missionAddress,
  characterAddresses,
  authorityPublicKey,
  payerPublicKey,
}: SendCharactersOnMissionTransactionParams): Promise<unknown> {
  const { createSendCharactersOnMissionTransaction: txResponse } =
    await client.createSendCharactersOnMissionTransaction({
      data: {
        mission: missionAddress.toString(),
        characterAddresses: characterAddresses.map((addr) => addr.toString()),
        authority: authorityPublicKey.toString(),
        payer: payerPublicKey?.toString(),
      },
    });

  return txResponse;
}

/**
 * Recall characters from a mission.
 */
export interface RecallCharactersTransactionParams {
  client: any;
  missionAddress: { toString(): string };
  characterAddresses: Array<{ toString(): string }>;
  authorityPublicKey: { toString(): string };
  payerPublicKey?: { toString(): string };
  lutAddresses?: string[];
}

export async function recallCharactersTransaction({
  client,
  missionAddress,
  characterAddresses,
  authorityPublicKey,
  payerPublicKey,
  lutAddresses = [],
}: RecallCharactersTransactionParams): Promise<unknown> {
  const { createRecallCharactersTransaction: txResponse } =
    await client.createRecallCharactersTransaction({
      data: {
        mission: missionAddress.toString(),
        characterAddresses: characterAddresses.map((addr) => addr.toString()),
        authority: authorityPublicKey.toString(),
        payer: payerPublicKey?.toString(),
      },
      lutAddresses,
    });

  return txResponse;
}
