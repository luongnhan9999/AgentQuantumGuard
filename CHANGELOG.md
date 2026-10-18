# Changelog

All notable changes, architectural milestones, and consensus upgrades to the **AgentQuantumGuard** protocol are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), adhering to GenLayer Builder Program Milestone Contribution Standards.

---

## [1.3.0] - Milestone 4: Production Enterprise Terminal & Live StudioNet Deployment
### Added
- **Full-Stack Decentralized Application (`frontend/`)**:
  - React 18, Vite, TypeScript, and TailwindCSS design system: "Post-Quantum Cryptography Terminal".
  - Quantum Obsidian & Deep Indigo theme (`#070913`) with elevated dark slate surfaces (`#0F1424`) and neural cyan / quantum violet accents.
  - Interactive NIST Compliance meter and Entropy Assurance visual gauges.
  - Comprehensive modal interfaces:
    - `CreateEscrowModal.tsx`: Enterprise deposit portal supporting ML-KEM, ML-DSA, and SLH-DSA suites.
    - `SubmitDeliverableModal.tsx`: Cryptographer portal with in-browser SHA-256 payload generator.
    - `PQCInspectorModal.tsx`: Comprehensive AI magistrate mathematical audit breakdown and commitment fingerprint verification.
    - `AppealModal.tsx`: 24-block (~72s) dispute portal requiring 10% staked bond with accredited URL enforcement.
    - `PullPayoutButton.tsx`: Pull-payment claims interface.
- **On-Chain Deployment on GenLayer StudioNet**:
  - Authoritative Contract Address: `0xAF808C4857Ec4593e3CbFfed67D42AbB40FF9107`
  - Network: Chain ID 61999 / Hex `0xF22F`
  - Live production deployment on Vercel.

---

## [1.2.0] - Milestone 3: On-Chain Appellate Court & Staked Dispute Governance
### Added
- **Supreme Appellate Cryptographic Tribunal**:
  - `appeal_verdict(escrow_id, dispute_reason, supplemental_audit_url)`:
    - Allows client or cryptographer to contest AI jury verdicts within 24 blocks (~72s).
    - Requires staking a mandatory 10% dispute bond (`required_bond = escrow_amount * 10 // 100`).
    - Validates supplemental evidence strictly against `ACCREDITED_PQC_SOURCES` (`csrc.nist.gov`, `openquantumsafe.org`, `eprint.iacr.org`, etc.).
  - `adjudicate_appeal(escrow_id)`:
    - Independent non-deterministic consensus re-evaluation using bound supplemental cryptanalysis data.
    - Multi-outcome settlement distribution:
      - `APPEAL_UPHELD_APPROVED`: Overturns to 100% payout to cryptographer and refunds bond to appellant.
      - `APPEAL_UPHELD_PARTIAL`: Overturns to 40% payout, 60% refund, and refunds bond to appellant.
      - `APPEAL_UPHELD_REJECTED`: Overturns to 100% refund to client and settles bond appropriately.
      - `APPEAL_DISMISSED`: Upholds original verdict and forfeits 10% bond to the counterparty as economic penalty.

---

## [1.1.0] - Milestone 2: Multi-Criteria NIST Standards Matrix & Entropy Scoring
### Added
- **NIST FIPS Cryptographic Evaluation Rubric**:
  - Automated mathematical validation for:
    - NIST FIPS 203 (ML-KEM): Verifies lattice polynomial dimension $n=256$, ring modulus $q=3329$, and public key lengths (768: 1184 bytes, 1024: 1568 bytes).
    - NIST FIPS 204 (ML-DSA): Verifies Dilithium matrix dimensions and modulus $q=8380417$.
    - NIST FIPS 205 (SLH-DSA): Verifies SPHINCS+ parameter sets.
  - Dual scoring engine:
    - **NIST Compliance Score (0-100%)**: Structural alignment with official FIPS specifications.
    - **Entropy & Weak-Parameter Assurance Score (0-100%)**: Weak-lattice parameter and backdoor resistance analysis.
  - Multi-tiered verdict resolution:
    - `PQC_COMPLIANT_APPROVED`: $\ge 85\%$ compliance $\rightarrow$ 100% payout.
    - `PQC_PARTIAL_COMPLIANCE`: $60-84\%$ compliance $\rightarrow$ 40% payout, 60% refund.
    - `PQC_INSECURE_REJECTED`: $< 60\%$ or non-standard modulus $\rightarrow$ 0% payout, 100% refund.

---

## [1.0.0] - Milestone 1: Core Protocol & AI Consensus + Full Lifecycle Security Hardening
### Added
- **Core Intelligent Contract (`contracts/contract.py`)**:
  - `py-genlayer` pragma with GenVM state storage (`TreeMap[str, PQCEscrow]`).
  - Web render telemetry via `gl.nondet.web.render`.
  - Non-deterministic consensus via `gl.vm.run_nondet(leader_fn, validator_fn)`.
  - Dynamic canary defense (`CANARY_AGENT_QUANTUM_GUARD_V1`) to prevent prompt injection.
  - SHA-256 deliverable content commitment verification.
  - Fail-safe non-settling state (`STATUS_UNRESOLVED`).
  - Pull-payment withdrawal mechanism (`claim_payout`).
  - 24-block (~72 second) cooling-off challenge window (`finalize_settlement`).
- **Comprehensive Pytest Suite (`tests/test_agentquantumguard.py`)**:
  - 10 automated test suites covering all lifecycle paths, edge cases, and failure modes.
