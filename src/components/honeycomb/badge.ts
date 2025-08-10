import { BadgesCondition } from "@honeycomb-protocol/edge-client";

interface TransactionResult {
  blockhash: string;
  lastValidBlockHeight: number;
  transaction: unknown;
}

/**
 * Create a badge criteria transaction
 */
export async function createBadgeCriteriaTransaction(
  client: any,
  {
    authorityPublicKey,
    projectAddress,
    payerPublicKey,
    badgeIndex = 0,
    condition = BadgesCondition.Public,
    startTime = 0,
    endTime = 0,
  }: {
    authorityPublicKey: string;
    projectAddress: string;
    payerPublicKey?: string;
    badgeIndex?: number;
    condition?: BadgesCondition;
    startTime?: number;
    endTime?: number;
  }
): Promise<TransactionResult> {
  const {
    createCreateBadgeCriteriaTransaction: {
      blockhash,
      lastValidBlockHeight,
      transaction,
    },
  } = await client.createCreateBadgeCriteriaTransaction({
    args: {
      authority: authorityPublicKey,
      projectAddress,
      payer: payerPublicKey,
      badgeIndex,
      condition,
      startTime,
      endTime,
    },
  });

  return { blockhash, lastValidBlockHeight, transaction };
}

/**
 * Update a badge criteria transaction
 */
export async function updateBadgeCriteriaTransaction(
  client: any,
  {
    authorityPublicKey,
    projectAddress,
    payerPublicKey,
    criteriaIndex = 0,
    condition = BadgesCondition.Public,
    startTime = 0,
    endTime = 0,
  }: {
    authorityPublicKey: string;
    projectAddress: string;
    payerPublicKey?: string;
    criteriaIndex?: number;
    condition?: BadgesCondition;
    startTime?: number;
    endTime?: number;
  }
): Promise<TransactionResult> {
  const {
    createUpdateBadgeCriteriaTransaction: {
      blockhash,
      lastValidBlockHeight,
      transaction,
    },
  } = await client.createUpdateBadgeCriteriaTransaction({
    args: {
      authority: authorityPublicKey,
      projectAddress,
      payer: payerPublicKey,
      criteriaIndex,
      condition,
      startTime,
      endTime,
    },
  });

  return { blockhash, lastValidBlockHeight, transaction };
}

/**
 * Claim a badge criteria transaction
 */
export async function claimBadgeCriteriaTransaction(
  client: any,
  {
    profileAddress,
    projectAddress,
    userPublicKey,
    criteriaIndex = 0,
    proof = BadgesCondition.Public,
  }: {
    profileAddress: string;
    projectAddress: string;
    userPublicKey: { toString(): string };
    criteriaIndex?: number;
    proof?: BadgesCondition;
  }
): Promise<TransactionResult> {
  const {
    createClaimBadgeCriteriaTransaction: {
      blockhash,
      lastValidBlockHeight,
      transaction,
    },
  } = await client.createClaimBadgeCriteriaTransaction({
    args: {
      profileAddress,
      projectAddress,
      proof,
      payer: userPublicKey.toString(),
      criteriaIndex,
    },
  });

  return { blockhash, lastValidBlockHeight, transaction };
}
