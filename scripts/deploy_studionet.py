import sys
import os
import json
from genlayer_py import create_client, studionet, create_account
from genlayer_py.types.transactions import TransactionStatus

# Ensure UTF-8 output on Windows
sys.stdout.reconfigure(encoding='utf-8')

def deploy_contract():
    print("=" * 70)
    print("🚀 DEPLOYING AGENT QUANTUM GUARD TO GENLAYER STUDIONET (CHAIN ID: 61999)")
    print("=" * 70)

    deployer = create_account()
    print(f"[+] Ephemeral Deployer Address: {deployer.address}")

    client = create_client(chain=studionet, account=deployer)
    print("[+] Funding deployer account with 5 GEN on StudioNet...")
    try:
        client.fund_account(deployer.address, 5 * 10**18)
        print("[+] Deployer account successfully funded with 5 GEN.")
    except Exception as e:
        print(f"[!] Warning: Funding returned: {e}")

    contract_path = os.path.join(os.path.dirname(__file__), "..", "contracts", "contract.py")
    with open(contract_path, "r", encoding="utf-8") as f:
        contract_code = f.read()

    print(f"[+] Loaded Intelligent Contract from {contract_path} ({len(contract_code)} bytes)")
    print("[+] Submitting deployment transaction to StudioNet...")

    tx_hash = client.deploy_contract(code=contract_code)
    print(f"[+] Deployment Transaction Hash: {tx_hash}")
    print("[*] Waiting for transaction consensus on StudioNet...")

    receipt = client.wait_for_transaction_receipt(
        tx_hash,
        status=TransactionStatus.ACCEPTED,
        retries=60,
        interval=3000
    )

    contract_addr = (
        receipt.get("contract_address")
        or (receipt.get("data") and receipt["data"].get("contract_address"))
        or receipt.get("recipient_address")
        or receipt.get("to")
    )

    print("\n" + "=" * 70)
    print(f"🎉 CONTRACT DEPLOYED SUCCESSFULLY TO GENLAYER STUDIONET!")
    print(f"📍 Contract Address: {contract_addr}")
    print(f"🔗 Explorer: https://explorer-studio.genlayer.com/address/{contract_addr}")
    print("=" * 70 + "\n")

    # Record deployment metadata
    deployment_info = {
        "network": "studionet",
        "chainId": 61999,
        "chainIdHex": "0xF22F",
        "rpcUrl": "https://studio.genlayer.com/api",
        "contractAddress": contract_addr,
        "deployerAddress": deployer.address,
        "txHash": tx_hash,
    }

    deployment_file = os.path.join(os.path.dirname(__file__), "..", "deployment.json")
    with open(deployment_file, "w", encoding="utf-8") as f:
        json.dump(deployment_info, f, indent=2)
    print(f"[+] Saved deployment metadata to {deployment_file}")

    return contract_addr

if __name__ == "__main__":
    deploy_contract()
