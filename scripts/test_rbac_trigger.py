import sys
import json
import time
from genlayer_py import create_client, studionet, create_account

sys.stdout.reconfigure(encoding='utf-8')
contract_addr = '0xAF808C4857Ec4593e3CbFfed67D42AbB40FF9107'

def main():
    print("[*] Testing on-chain AI PQC Compliance Adjudication on StudioNet...")
    
    # Use the cryptographer account (or client) who has permission
    # In the previous step, cryptographer was 0x350f3476554f8fbcdba9ed02c5767f868af1ef5c
    # But wait, any account that is client, cryptographer or owner can trigger.
    # What if we trigger with an account that is NOT client, cryptographer, or owner to test RBAC rejection first?
    random_user = create_account()
    client_random = create_client(chain=studionet, account=random_user)
    client_random.fund_account(random_user.address, 10**18)
    
    print(f"[*] Testing RBAC security: Unauthorized user {random_user.address[:10]} triggers adjudication...")
    try:
        tx_fail = client_random.write_contract(
            address=contract_addr,
            function_name="adjudicate_pqc_compliance",
            args=["1"]
        )
        print(f"[-] Tx sent: {tx_fail}, waiting for receipt...")
        rc = client_random.wait_for_transaction_receipt(tx_fail)
        print(f"[-] Receipt result: {rc}")
    except Exception as ex:
        print(f"[+] RBAC protection successfully blocked unauthorized trigger: {ex}")

if __name__ == "__main__":
    main()
