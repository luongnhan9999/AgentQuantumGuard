import sys
import json
import time
from genlayer_py import create_client, studionet, create_account

sys.stdout.reconfigure(encoding='utf-8')
contract_addr = '0xe865d69cf40d92ffD02CcA1A7FBdfff6E2Ef7616'

def main():
    print("=" * 60)
    print("[*] LIVE ON-CHAIN TEST: AI PQC Compliance Adjudication on StudioNet")
    print("=" * 60)

    # 1. We need an account that has permission (Client, Cryptographer, or Owner)
    # Let's create a new full-cycle Escrow where we control both Client and Cryptographer:
    client_acc = create_account()
    crypto_acc = create_account()
    
    c_client = create_client(chain=studionet, account=client_acc)
    c_crypto = create_client(chain=studionet, account=crypto_acc)
    
    print("[1] Funding Client and Cryptographer accounts...")
    c_client.fund_account(client_acc.address, 10**18)
    c_crypto.fund_account(crypto_acc.address, 10**18)
    print(f"    Client: {client_acc.address}")
    print(f"    Cryptographer: {crypto_acc.address}")

    # 2. Client creates Escrow
    print("\n[2] Client creates new PQC Escrow for ML-KEM-768 (Category 3)...")
    tx_create = c_client.write_contract(
        address=contract_addr,
        function_name="create_pqc_escrow",
        args=["ML-KEM-768 (NIST FIPS 203)", 3, 3600],
        value=200_000_000_000_000_000 # 0.2 GEN
    )
    print(f"    Create Tx: {tx_create}")
    c_client.wait_for_transaction_receipt(tx_create)
    
    # Query latest escrow
    all_escrows = json.loads(c_client.read_contract(contract_addr, "get_all_escrows", []))
    new_escrow = all_escrows[-1]
    new_id = str(new_escrow["escrow_id"])
    print(f"    [+] Created Escrow ID: #{new_id}")
    print(f"    Status: {new_escrow['status']} (OPEN)")

    # 3. Cryptographer submits deliverable
    print(f"\n[3] Cryptographer submits NIST PQC migration deliverable for #{new_id}...")
    url = "https://raw.githubusercontent.com/open-quantum-safe/liboqs/main/README.md"
    sha = "77630d3c02ad51c3e6de39244cb6dc0e7aa8356088abd77adc7d03511bcdd808"
    tx_sub = c_crypto.write_contract(
        address=contract_addr,
        function_name="submit_pqc_deliverable",
        args=[new_id, url, sha]
    )
    print(f"    Submit Tx: {tx_sub}")
    c_crypto.wait_for_transaction_receipt(tx_sub)
    
    e_sub = json.loads(c_crypto.read_contract(contract_addr, "get_escrow", [new_id]))
    print(f"    [+] Escrow #{new_id} status: {e_sub['status']} (DELIVERABLE_SUBMITTED)")
    print(f"    Spec URL: {e_sub['spec_document_url']}")
    print(f"    Spec SHA-256: {e_sub['spec_evidence_hash']}")

    # 4. Trigger AI Adjudication (adjudicate_pqc_compliance)
    print(f"\n[4] Triggering On-Chain AI PQC Compliance Adjudication for #{new_id}...")
    print("    GenLayer Consensus Validators (LLM Jury) will evaluate against NIST FIPS 203...")
    t0 = time.time()
    tx_adj = c_client.write_contract(
        address=contract_addr,
        function_name="adjudicate_pqc_compliance",
        args=[new_id]
    )
    print(f"    Adjudication Tx: {tx_adj}")
    receipt = c_client.wait_for_transaction_receipt(tx_adj)
    elapsed = time.time() - t0
    print(f"    [+] Adjudication Consensus Reached in {elapsed:.1f}s!")

    # 5. Inspect final adjudicated escrow state
    print(f"\n[5] Inspecting Adjudicated Escrow #{new_id} State...")
    e_final = json.loads(c_client.read_contract(contract_addr, "get_escrow", [new_id]))
    print(f"    Status: {e_final['status']} (2=AWAITING_PAYOUT, 8=UNRESOLVED)")
    print(f"    Verdict: {e_final['verdict']}")
    print(f"    Original Verdict: {e_final['original_verdict']}")
    print(f"    Compliance Score: {e_final['compliance_score']}%")
    print(f"    Entropy Assurance Score: {e_final['entropy_assurance_score']}%")
    print(f"    Confidence: {e_final['confidence']}%")
    print(f"    Tribunal Reason: {e_final['reason']}")
    print(f"    Audit Completed Time: {e_final['audit_completed_time']}")

    print("\n" + "=" * 60)
    print("[*] ON-CHAIN AI ADJUDICATION TEST COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    main()
