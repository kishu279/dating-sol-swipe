/**
 * Types for VerificationPayment class
 */

export interface SwipeResult {
    signature: string;
    nonce: number;
    bump: number;
    treasuryBalance: number;
}

export interface TransactionVerificationSuccess {
    isValid: true;
    signature: string;
    status: "SUCCESS";
    blockTime: number | null | undefined;
    slot: number;
    computeUnitsConsumed: number;
    fee: number;
    isSwipeInstruction: boolean;
    preBalances?: number[];
    postBalances?: number[];
    logMessages: string[];
}

export interface TransactionVerificationNotFound {
    isValid: false;
    signature: string;
    error: string;
    status: "NOT_FOUND";
}

export interface TransactionVerificationFailed {
    isValid: false;
    signature: string;
    error: any;
    status: "FAILED";
    blockTime: number | null | undefined;
    slot: number;
}

export interface TransactionVerificationError {
    isValid: false;
    signature: string;
    error: string;
    status: "ERROR";
}

export type VerificationResult =
    | TransactionVerificationSuccess
    | TransactionVerificationNotFound
    | TransactionVerificationFailed
    | TransactionVerificationError;
