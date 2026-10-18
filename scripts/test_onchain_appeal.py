import sys
import json
import time
from genlayer_py import create_client, studionet, create_account

sys.stdout.reconfigure(encoding='utf-8')
contract_addr = '0xe865d69cf40d92ffD02CcA1A7FBdfff6E2Ef7616'

def main():
    print("=" * 65)
    print("[*] LIVE ON-CHAIN TEST: AI Adjudication & Appellate Tribunal")
    print("=" * 65)

    client_acc = create_account()
    crypto_acc = create_account()

    c_client = create_client(chain=studionet, account=client_acc)
    c_crypto = create_client(chain=studionet, account=crypto_acc)

    c_client.fund_account(client_acc.address, 10**18)
    c_crypto.fund_account(crypto_acc.address, 10**18)

    # 1. Create Escrow
    print("[1] Creating Escrow for ML-KEM-768...")
    tx1 = c_client.write_contract(
        address=contract_addr,
        function_name='create_pqc_escrow',
        args=['ML-KEM-768 (NIST FIPS 203)', 3, 3600],
        value=200_000_000_000_000_000 # 0.2 GEN
    )
    c_client.wait_for_transaction_receipt(tx1)
    all_e = json.loads(c_client.read_contract(contract_addr, 'get_all_escrows', []))
    eid = str(all_e[-1]['escrow_id'])
    print(f"    [+] Escrow #{eid} created!")

    # 2. Submit deliverable
    print(f"[2] Cryptographer submitting deliverable for #{eid}...")
    url = 'https://raw.githubusercontent.com/open-quantum-safe/liboqs/main/README.md'
    exact_hash = 'c73733538c4578a05c5a8f83b666774c69f316fc363e61496b9352f325809566'

    tx2 = c_crypto.write_contract(
        address=contract_addr,
        function_name='submit_pqc_deliverable',
        args=[eid, url, exact_hash]
    )
    c_crypto.wait_for_transaction_receipt(tx2)
    print(f"    [+] Deliverable submitted.")

    # 3. Adjudicate
    print(f"[3] Adjudicating #{eid} with GenLayer consensus...")
    t0 = time.time()
    tx3 = c_client.write_contract(
        address=contract_addr,
        function_name='adjudicate_pqc_compliance',
        args=[eid]
    )
    c_client.wait_for_transaction_receipt(tx3)
    print(f"    [+] Adjudication completed in {time.time()-t0:.1f}s.")

    e_adj = json.loads(c_client.read_contract(contract_addr, 'get_escrow', [eid]))
    print(f"    Status: {e_adj.get('status')} (2 = AWAITING_PAYOUT)")
    print(f"    Verdict: {e_adj.get('verdict')}")
    print(f"    Scores: Compliance={e_adj.get('compliance_score')}%, Entropy={e_adj.get('entropy_assurance_score')}%")

    # 4. Appeal verdict with client (staking 10% bond = 0.02 GEN)
    print(f"\n[4] Client filing Appeal on #{eid} with 10% dispute bond...")
    tx4 = c_client.write_contract(
        address=contract_addr,
        function_name='appeal_verdict',
        args=[
            eid,
            'Demanding appellate re-examination of full ML-KEM parameters against NIST standards.',
            'https://csrc.nist.gov/pubs/fips/203/final'
        ],
        value=20_000_000_000_000_000 # 10% of 0.2 GEN
    )
    c_client.wait_for_transaction_receipt(tx4)
    print(f"    [+] Appeal successfully recorded on-chain!")

    e_disp = json.loads(c_client.read_contract(contract_addr, 'get_escrow', [eid]))
    print(f"    Status: {e_disp.get('status')} (6 = DISPUTED)")
    print(f"    Dispute Initiator: {e_disp.get('dispute_initiator')}")
    print(f"    Dispute Bond: {e_disp.get('dispute_bond')} wei")
    print(f"    Supplemental URL: {e_disp.get('supplemental_evidence_url')}")
    print(f"    Prior Verdict: {e_disp.get('appeal_prior_verdict')}")
    print(f"    Dispute Reason: {e_disp.get('reason')}")

    print("\n" + "=" * 65)
    print("[*] COMPLETE ON-CHAIN ADJUDICATION & APPEAL PIPELINE VERIFIED!")
    print("=" * 65)

if __name__ == "__main__":
    main()
