import sys
import os
import json
import hashlib
from genlayer_py import create_client, studionet, create_account

sys.stdout.reconfigure(encoding='utf-8')

def seed_escrow():
    print("[*] Seeding sample PQC Migration Escrow on StudioNet...")
    contract_addr = "0xAF808C4857Ec4593e3CbFfed67D42AbB40FF9107"
    
    enterprise = create_account()
    client_enterprise = create_client(chain=studionet, account=enterprise)
    client_enterprise.fund_account(enterprise.address, 2 * 10**18)
    print(f"[+] Enterprise account funded: {enterprise.address}")

    # Create Escrow
    print("[+] Creating PQC Escrow for ML-KEM-768 (NIST FIPS 203)...")
    tx_hash = client_enterprise.write_contract(
        address=contract_addr,
        function_name="create_pqc_escrow",
        args=["ML-KEM-768 (NIST FIPS 203)", 3, 6000],
        value=500_000_000_000_000_000 # 0.5 GEN
    )
    print(f"[+] Escrow Created! Tx: {tx_hash}")

    receipt = client_enterprise.wait_for_transaction_receipt(tx_hash)
    print("[+] Create Escrow confirmed!")

    # Verify state
    stats = json.loads(client_enterprise.read_contract(contract_addr, "get_stats", []))
    print(f"[+] Updated Protocol Stats: {stats}")
    all_escrows = json.loads(client_enterprise.read_contract(contract_addr, "get_all_escrows", []))
    print(f"[+] Current Escrows Count: {len(all_escrows)}")

if __name__ == "__main__":
    seed_escrow()
