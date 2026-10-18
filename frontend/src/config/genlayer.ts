import { studionet } from 'genlayer-js/chains';

// Authoritative Deployed Contract on GenLayer StudioNet (Chain ID: 61999)
export const DEFAULT_CONTRACT_ADDRESS = "0xAF808C4857Ec4593e3CbFfed67D42AbB40FF9107";

export const GENLAYER_STUDIONET = {
  ...studionet,
  id: 61999,
  name: "GenLayer Studio Network",
  rpcUrls: {
    default: { http: ["https://studio.genlayer.com/api"] },
    public: { http: ["https://studio.genlayer.com/api"] },
  },
  blockExplorers: {
    default: { name: "GenLayer Studio Explorer", url: "https://explorer-studio.genlayer.com" },
  },
  nativeCurrency: {
    name: "GEN Token",
    symbol: "GEN",
    decimals: 18,
  },
};

export const CHAIN_ID_DECIMAL = 61999;
export const CHAIN_ID_HEX = "0xF22F";
export const RPC_URL = "https://studio.genlayer.com/api";
export const EXPLORER_URL = "https://explorer-studio.genlayer.com";

export interface PQCEscrowRecord {
  escrow_id: string;
  client: string;
  cryptographer: string;
  dispute_initiator: string;
  escrow_amount: string;
  dispute_bond: string;
  target_algorithm_suite: string;
  min_security_category: number;
  spec_document_url: string;
  spec_evidence_hash: string;
  evidence_hash: string;
  status: number;
  verdict: string;
  original_verdict: string;
  reason: string;
  confidence: number;
  compliance_score: number;
  entropy_assurance_score: number;
  created_at_time: string;
  expires_at_time: string;
  audit_completed_time: string;
  supplemental_evidence_url?: string;
  appeal_prior_verdict?: string;
}

export interface ProtocolStats {
  total_escrows: number;
  total_migration_locked: string;
  total_audits_settled: number;
  owner: string;
}
