# 🏛️ AgentQuantumGuard — Architectural Specification & Consensus Design

This document details the architectural topology, cryptographic state machine, and GenLayer semantic consensus mechanics governing **AgentQuantumGuard**.

---

## 📌 1. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Enterprise ["Enterprise / Web3 Protocol"]
        Client["Enterprise / DAO"]
        Deposit["Lock GEN Escrow Deposit"]
    end

    subgraph CryptographerNode ["Specialized Cryptography Firm"]
        Contractor["PQC Cryptographer"]
        Deliverable["Submit PQC Keys / CSR + SHA-256 Hash"]
    end

    subgraph GenVM ["GenLayer Consensus Network (StudioNet - 61999)"]
        Contract["Intelligent Contract (contracts/contract.py)"]
        LeaderNode["Consensus Leader Validator"]
        PeerValidators["Decentralized Validator Council"]
    end

    subgraph ExternalSources ["Accredited Cryptographic Authorities"]
        NIST["NIST CSRC (csrc.nist.gov)"]
        OQS["Open Quantum Safe (openquantumsafe.org)"]
        IACR["IACR Cryptology ePrint (eprint.iacr.org)"]
    end

    Client -->|create_pqc_escrow| Contract
    Contractor -->|submit_pqc_deliverable| Contract

    Contract -->|adjudicate_pqc_compliance| LeaderNode
    LeaderNode -->|gl.nondet.web.render| ExternalSources
    LeaderNode -->|gl.nondet.exec_prompt| LeaderNode
    LeaderNode -->|gl.vm.run_nondet| PeerValidators

    PeerValidators -->|Semantic Agreement| Contract
    Contract -->|Cooling-Off 24 Blocks| CoolingWindow["STATUS_AWAITING_PAYOUT"]
    CoolingWindow -->|No Dispute: finalize_settlement| Settlement["Disburse GEN via Pull-Payment"]
    CoolingWindow -->|Dispute: appeal_verdict + 10% Bond| AppellateTribunal["Supreme Court Review"]
```

---

## 🔄 2. End-to-End Execution Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Client as Enterprise / DAO
    actor Contractor as PQC Cryptographer
    participant GenVM as GenLayer Intelligent Contract
    participant AIJury as AI Cryptographic Tribunal
    participant Authority as Accredited Authority (NIST/OQS)

    Client->>GenVM: create_pqc_escrow(target_suite, min_category, duration_blocks) [value: GEN]
    GenVM-->>Client: Escrow Created (ID: #1, STATUS_ESCROW_OPEN)

    Contractor->>GenVM: submit_pqc_deliverable(escrow_id, spec_url, spec_hash)
    GenVM-->>Contractor: Deliverable Registered (STATUS_DELIVERABLE_SUBMITTED)

    Client->>GenVM: adjudicate_pqc_compliance(escrow_id)
    GenVM->>AIJury: run_nondet(leader_fn, validator_fn)
    AIJury->>Authority: gl.nondet.web.render(spec_url)
    Authority-->>AIJury: Return raw cryptographic payload
    AIJury->>AIJury: Verify SHA-256 match & Evaluate NIST FIPS 203/204 parameters
    AIJury-->>GenVM: Output: PQC_COMPLIANT_APPROVED (96% compliance, CANARY token)
    GenVM-->>GenVM: Transition to STATUS_AWAITING_PAYOUT (Start 24-block timelock)

    alt Uncontested Settlement
        Note over GenVM: 24 Blocks (~72 seconds) pass without dispute
        Contractor->>GenVM: finalize_settlement(escrow_id)
        GenVM->>Contractor: Transfer 100% Escrow Capital
    else Disputed Appeal
        Client->>GenVM: appeal_verdict(escrow_id, reason, supplemental_url) [value: 10% Bond]
        GenVM-->>Client: Status changed to STATUS_DISPUTED
        GenVM->>AIJury: adjudicate_appeal(escrow_id)
        AIJury-->>GenVM: Final Verdict: APPEAL_UPHELD_APPROVED
        GenVM->>Contractor: 100% Escrow + Bond Resolution
    end
```

---

## ⚙️ 3. State Machine Transitions

```mermaid
stateDiagram-v2
    [*] --> STATUS_ESCROW_OPEN: create_pqc_escrow (Client deposits GEN)
    
    STATUS_ESCROW_OPEN --> STATUS_DELIVERABLE_SUBMITTED: submit_pqc_deliverable (Cryptographer submits keypair & SHA-256)
    STATUS_ESCROW_OPEN --> STATUS_EXPIRED_RECLAIMED: cancel_or_reclaim (Past deadline)

    STATUS_DELIVERABLE_SUBMITTED --> STATUS_UNRESOLVED: Adjudication fails (Fetch 404, Hash Mismatch, Canary Error)
    STATUS_DELIVERABLE_SUBMITTED --> STATUS_AWAITING_PAYOUT: Adjudication succeeds (Valid JSON, Canary Verified)

    STATUS_UNRESOLVED --> STATUS_DELIVERABLE_SUBMITTED: Retry submit_pqc_deliverable
    STATUS_UNRESOLVED --> STATUS_AWAITING_PAYOUT: Retry adjudicate_pqc_compliance
    STATUS_UNRESOLVED --> STATUS_EXPIRED_RECLAIMED: cancel_or_reclaim (Past deadline)

    STATUS_AWAITING_PAYOUT --> STATUS_DISPUTED: appeal_verdict (Within 24 blocks + 10% Bond + Accredited URL)
    STATUS_AWAITING_PAYOUT --> STATUS_SETTLED_APPROVED: finalize_settlement (Cooling-off expired & Verdict == APPROVED)
    STATUS_AWAITING_PAYOUT --> STATUS_SETTLED_PARTIAL: finalize_settlement (Cooling-off expired & Verdict == PARTIAL)
    STATUS_AWAITING_PAYOUT --> STATUS_SETTLED_REJECTED: finalize_settlement (Cooling-off expired & Verdict == REJECTED)

    STATUS_DISPUTED --> STATUS_SETTLED_APPROVED: adjudicate_appeal (APPEAL_UPHELD_APPROVED)
    STATUS_DISPUTED --> STATUS_SETTLED_PARTIAL: adjudicate_appeal (APPEAL_UPHELD_PARTIAL)
    STATUS_DISPUTED --> STATUS_SETTLED_REJECTED: adjudicate_appeal (APPEAL_UPHELD_REJECTED)
    STATUS_DISPUTED --> STATUS_AWAITING_PAYOUT: adjudicate_appeal (APPEAL_DISMISSED -> Revert to Original Verdict)

    STATUS_SETTLED_APPROVED --> [*]
    STATUS_SETTLED_PARTIAL --> [*]
    STATUS_SETTLED_REJECTED --> [*]
    STATUS_EXPIRED_RECLAIMED --> [*]
```

---

## 🔒 4. Key Architectural Invariants

1. **Deterministic Consensus with Natural Language Agreement:**
   Validators in GenVM do not compare byte-for-byte LLM explanations; instead, the consensus predicate checks:
   $$\text{leader.verdict} == \text{validator.verdict} \quad \land \quad \text{canary} == \text{CANARY\_AGENT\_QUANTUM\_GUARD\_V1}$$
2. **Double-Spend & Reentrancy Prevention:**
   Prior to any external fund transfer, the contract zeroes out the escrow and bond amounts:
   ```python
   escrow_val = e.escrow_amount
   e.escrow_amount = bigint(0) # Checks-Effects-Interactions
   self._safe_transfer(recipient, escrow_val)
   ```
3. **Pull-Payment Recovery Buffer:**
   If a direct native transfer to a smart contract recipient encounters an execution error, the funds are safely buffered into `self.claimable_balances[recipient]`, claimable anytime via `claim_payout()`.
