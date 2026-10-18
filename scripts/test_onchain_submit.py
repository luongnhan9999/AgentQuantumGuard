import sys
import json
from genlayer_py import create_client, studionet, create_account

sys.stdout.reconfigure(encoding='utf-8')
contract_addr = '0xe865d69cf40d92ffD02CcA1A7FBdfff6E2Ef7616'

def main():
    crypto_acc = create_account()
    client = create_client(chain=studionet, account=crypto_acc)
    client.fund_account(crypto_acc.address, 10**18)
    print(f"[+] Cryptographer account created: {crypto_acc.address}")

    url = "https://raw.githubusercontent.com/open-quantum-safe/liboqs/main/README.md"
    sha = "77630d3c02ad51c3e6de39244cb6dc0e7aa8356088abd77adc7d03511bcdd808"

    print("[+] Submitting PQC deliverable for Escrow #1...")
    tx = client.write_contract(
        address=contract_addr,
        function_name="submit_pqc_deliverable",
        args=["1", url, sha]
    )
    print(f"[+] Deliverable submitted! Tx: {tx}")
    rc = client.wait_for_transaction_receipt(tx)
    print(f"[+] Transaction mined! Status: {rc}")

    e1 = json.loads(client.read_contract(contract_addr, "get_escrow", ["1"]))
    print(f"[+] Escrow #1 status: {e1.get('status')} (1 = DELIVERABLE_SUBMITTED)")
    print(f"[+] Deliverable URL: {e1.get('spec_document_url')}")
    print(f"[+] Cryptographer: {e1.get('cryptographer')}")

if __name__ == "__main__":
    main()
