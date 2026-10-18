import pytest
import json
import hashlib
import os
import sys

# Ensure contracts directory is reachable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "contracts")))


# ---------------------------------------------------------------------------
# Simulated GenLayer Environment for robust local pytest execution
# ---------------------------------------------------------------------------
class SimulatedAddress:
    def __init__(self, hex_addr: str):
        self.as_hex = hex_addr.lower()

    def __str__(self):
        return self.as_hex

    def __eq__(self, other):
        return str(self).lower() == str(other).lower()


class MockTransferContract:
    def __init__(self, address):
        self.address = str(address)
        self.transfers = []

    def emit_transfer(self, value):
        self.transfers.append({"to": self.address, "value": value})
        return True


class MockReturn:
    def __init__(self, calldata):
        self.calldata = calldata


class MockMessage:
    def __init__(self, sender_address="0x1111111111111111111111111111111111111111", value=0):
        self.sender_address = sender_address
        self.value = value

    @property
    def sender(self):
        return self.sender_address

    @sender.setter
    def sender(self, val):
        self.sender_address = val


class MockNondetWeb:
    def __init__(self):
        self.mock_responses = {}
        self.default_response = "NIST FIPS 203: ML-KEM-768 parameters verified. Public Key length: 1184 bytes. Modulus q=3329. Category 3 security met."

    def render(self, url, mode="text"):
        if url in self.mock_responses:
            return self.mock_responses[url]
        return self.default_response


class MockNondet:
    def __init__(self):
        self.web = MockNondetWeb()
        self.llm_response = {
            "canary": "CANARY_AGENT_QUANTUM_GUARD_V1",
            "verdict": "PQC_COMPLIANT_APPROVED",
            "confidence": 98,
            "compliance_score": 96,
            "entropy_assurance_score": 95,
            "reason": "Lattice dimension n=256 and modulus q=3329 match NIST FIPS 203 standards without structural flaw."
        }

    def exec_prompt(self, prompt, response_format="json"):
        return self.llm_response


class MockVM:
    class Return:
        def __init__(self, calldata):
            self.calldata = calldata

    def run_nondet(self, leader_fn, validator_fn):
        leader_res = leader_fn()
        valid = validator_fn(self.Return(leader_res))
        assert valid, "Validator function failed on leader result"
        return leader_res


class MockGenLayerEnv:
    def __init__(self):
        self.message = MockMessage()
        self.nondet = MockNondet()
        self.vm = MockVM()
        self.contracts = {}
        self.message_raw = {"datetime": "2026-10-18T12:00:00Z"}

    def get_contract_at(self, address):
        addr_str = str(address).lower()
        if addr_str not in self.contracts:
            self.contracts[addr_str] = MockTransferContract(addr_str)
        return self.contracts[addr_str]


def setup_gl_mock():
    import types
    mock_env = MockGenLayerEnv()

    gl_module = types.ModuleType("genlayer")

    class ContractStorageBase:
        def __new__(cls, *args, **kwargs):
            instance = super().__new__(cls)
            instance.escrows = {}
            instance.escrow_ids = []
            instance.claimable_balances = {}
            return instance

    gl_module.Address = SimulatedAddress
    gl_module.bigint = lambda x: int(x)
    gl_module.u8 = lambda x: int(x)
    gl_module.u32 = lambda x: int(x)
    gl_module.u64 = lambda x: int(x)
    gl_module.u256 = lambda x: int(x)
    gl_module.TreeMap = dict
    gl_module.DynArray = list
    gl_module.allow_storage = lambda cls: cls
    gl_module.Contract = ContractStorageBase

    # Decorators
    class PublicDecorator:
        def view(self, fn): return fn
        def write(self, fn): return fn
        class WriteClass:
            def __call__(self, fn): return fn
            def payable(self, fn): return fn
        write = WriteClass()

    mock_public = PublicDecorator()
    mock_env.Contract = ContractStorageBase
    mock_env.public = mock_public
    gl_module.gl = mock_env

    sys.modules["genlayer"] = gl_module
    if "contract" in sys.modules:
        del sys.modules["contract"]

    return mock_env


# ---------------------------------------------------------------------------
# UNIT TESTS: Full Coverage for AgentQuantumGuard PQC Escrow Protocol
# ---------------------------------------------------------------------------

def test_pqc_compliant_approved_full_payout_lifecycle():
    """Proves that a verified NIST FIPS 203 compliant ML-KEM-768 package releases 100% escrow to cryptographer."""
    mock_env = setup_gl_mock()
    import contract
    contract.gl = mock_env

    app = contract.Contract()
    enterprise = SimulatedAddress("0xAAAA111122223333444455556666777788889999")
    cryptographer = SimulatedAddress("0xBBBB111122223333444455556666777788889999")

    # Step 1: Enterprise locks 2 GEN for ML-KEM-768 migration
    mock_env.message.sender_address = enterprise
    escrow_amount = 2_000_000_000_000_000_000  # 2 GEN
    mock_env.message.value = escrow_amount

    escrow_id = app.create_pqc_escrow("ML-KEM-768 (NIST FIPS 203)", 3, 6000)
    assert escrow_id == "1"
    assert app.total_migration_locked == escrow_amount

    # Step 2: Cryptographer submits deliverable with SHA-256 hash commitment
    mock_env.message.sender_address = cryptographer
    spec_text = "NIST_FIPS_203: ML-KEM-768 parameters verified. Public Key length: 1184 bytes. Modulus q=3329. Category 3 security met."
    spec_hash = hashlib.sha256(spec_text.encode("utf-8")).hexdigest()
    spec_url = "https://csrc.nist.gov/publications/detail/fips/203/final"

    app.submit_pqc_deliverable(escrow_id, spec_url, spec_hash)

    e_data = json.loads(app.get_escrow(escrow_id))
    assert e_data["status"] == 1  # STATUS_DELIVERABLE_SUBMITTED
    assert e_data["cryptographer"] == str(cryptographer).lower()

    # Step 3: Mock AI Review Board -> 96% compliance, Category 3 Met
    mock_env.nondet.web.mock_responses[spec_url] = spec_text
    mock_env.nondet.llm_response = {
        "canary": "CANARY_AGENT_QUANTUM_GUARD_V1",
        "verdict": "PQC_COMPLIANT_APPROVED",
        "confidence": 98,
        "compliance_score": 96,
        "entropy_assurance_score": 95,
        "reason": "Lattice dimension n=256 and modulus q=3329 match NIST FIPS 203 standards without structural flaw."
    }

    mock_env.message.sender_address = enterprise
    app.adjudicate_pqc_compliance(escrow_id)

    e_data = json.loads(app.get_escrow(escrow_id))
    assert e_data["status"] == 2  # STATUS_AWAITING_PAYOUT
    assert e_data["verdict"] == "PQC_COMPLIANT_APPROVED"
    assert e_data["compliance_score"] == 96

    # Step 4: Advance past 24-block (~72s) cooling window and finalize settlement
    # Fast forward consensus time by 80 seconds
    mock_env.message_raw = {"datetime": "2026-10-18T12:01:20Z"}
    app.finalize_settlement(escrow_id)

    e_settled = json.loads(app.get_escrow(escrow_id))
    assert e_settled["status"] == 3  # STATUS_SETTLED_APPROVED
    assert app.total_migration_locked == 0
    assert app.total_audits_settled == 1


def test_pqc_partial_compliance_lifecycle():
    """Proves that a lower security level deliverable triggers 40% payout and 60% refund."""
    mock_env = setup_gl_mock()
    import contract
    contract.gl = mock_env

    app = contract.Contract()
    enterprise = SimulatedAddress("0xAAAA111122223333444455556666777788889999")
    cryptographer = SimulatedAddress("0xBBBB111122223333444455556666777788889999")

    mock_env.message.sender_address = enterprise
    escrow_amount = 1_000_000_000_000_000_000  # 1 GEN
    mock_env.message.value = escrow_amount

    escrow_id = app.create_pqc_escrow("ML-DSA-87 (NIST FIPS 204)", 5, 6000)

    mock_env.message.sender_address = cryptographer
    spec_text = "NIST_FIPS_204: Provided ML-DSA-44 (Category 1) instead of contracted Category 5."
    spec_hash = hashlib.sha256(spec_text.encode("utf-8")).hexdigest()
    spec_url = "https://openquantumsafe.org/benchmarks/mldsa44.txt"

    app.submit_pqc_deliverable(escrow_id, spec_url, spec_hash)

    mock_env.nondet.web.mock_responses[spec_url] = spec_text
    mock_env.nondet.llm_response = {
        "canary": "CANARY_AGENT_QUANTUM_GUARD_V1",
        "verdict": "PQC_PARTIAL_COMPLIANCE",
        "confidence": 90,
        "compliance_score": 68,
        "entropy_assurance_score": 75,
        "reason": "Deliverable satisfies Category 1 but falls short of contracted Category 5."
    }

    mock_env.message.sender_address = enterprise
    app.adjudicate_pqc_compliance(escrow_id)

    e_data = json.loads(app.get_escrow(escrow_id))
    assert e_data["status"] == 2  # STATUS_AWAITING_PAYOUT
    assert e_data["verdict"] == "PQC_PARTIAL_COMPLIANCE"

    # Fast forward past cooling off and finalize
    mock_env.message_raw = {"datetime": "2026-10-18T12:01:30Z"}
    app.finalize_settlement(escrow_id)

    e_settled = json.loads(app.get_escrow(escrow_id))
    assert e_settled["status"] == 4  # STATUS_SETTLED_PARTIAL


def test_pqc_insecure_rejected_lifecycle():
    """Proves that weak or non-standard lattice parameters trigger 100% refund rejection."""
    mock_env = setup_gl_mock()
    import contract
    contract.gl = mock_env

    app = contract.Contract()
    enterprise = SimulatedAddress("0xAAAA111122223333444455556666777788889999")
    cryptographer = SimulatedAddress("0xBBBB111122223333444455556666777788889999")

    mock_env.message.sender_address = enterprise
    escrow_amount = 1_000_000_000_000_000_000
    mock_env.message.value = escrow_amount

    escrow_id = app.create_pqc_escrow("ML-KEM-1024", 5, 6000)

    mock_env.message.sender_address = cryptographer
    spec_text = "Backdoored lattice matrix with non-standard ring modulus q=2048."
    spec_hash = hashlib.sha256(spec_text.encode("utf-8")).hexdigest()
    spec_url = "https://eprint.iacr.org/2026/001.txt"

    app.submit_pqc_deliverable(escrow_id, spec_url, spec_hash)

    mock_env.nondet.web.mock_responses[spec_url] = spec_text
    mock_env.nondet.llm_response = {
        "canary": "CANARY_AGENT_QUANTUM_GUARD_V1",
        "verdict": "PQC_INSECURE_REJECTED",
        "confidence": 99,
        "compliance_score": 20,
        "entropy_assurance_score": 10,
        "reason": "Modulus q=2048 is non-standard and vulnerable to lattice reduction attacks."
    }

    mock_env.message.sender_address = enterprise
    app.adjudicate_pqc_compliance(escrow_id)

    e_data = json.loads(app.get_escrow(escrow_id))
    assert e_data["verdict"] == "PQC_INSECURE_REJECTED"

    mock_env.message_raw = {"datetime": "2026-10-18T12:01:30Z"}
    app.finalize_settlement(escrow_id)

    e_settled = json.loads(app.get_escrow(escrow_id))
    assert e_settled["status"] == 5  # STATUS_SETTLED_REJECTED


def test_pqc_fetch_failure_produces_unresolved_state():
    """Proves that an unreachable spec document triggers STATUS_UNRESOLVED and prevents premature settlement."""
    mock_env = setup_gl_mock()
    import contract
    contract.gl = mock_env

    app = contract.Contract()
    enterprise = SimulatedAddress("0xAAAA111122223333444455556666777788889999")
    cryptographer = SimulatedAddress("0xBBBB111122223333444455556666777788889999")

    mock_env.message.sender_address = enterprise
    mock_env.message.value = 1_000_000_000_000_000_000
    escrow_id = app.create_pqc_escrow("ML-DSA-65", 3, 6000)

    mock_env.message.sender_address = cryptographer
    dummy_hash = "a" * 64
    app.submit_pqc_deliverable(escrow_id, "https://csrc.nist.gov/missing_spec.txt", dummy_hash)

    # Empty response simulates 404/network failure
    mock_env.nondet.web.mock_responses["https://csrc.nist.gov/missing_spec.txt"] = ""

    mock_env.message.sender_address = enterprise
    app.adjudicate_pqc_compliance(escrow_id)

    e_data = json.loads(app.get_escrow(escrow_id))
    assert e_data["status"] == 8  # STATUS_UNRESOLVED
    assert "UNRESOLVED_FETCH_FAILED" in e_data["verdict"]

    # Finalize settlement must be rejected
    with pytest.raises(Exception) as exc_info:
        app.finalize_settlement(escrow_id)
    assert "Cannot settle escrow in an unresolved error state" in str(exc_info.value)


def test_pqc_commitment_hash_mismatch():
    """Proves that tampered deliverable text failing SHA-256 integrity triggers STATUS_UNRESOLVED."""
    mock_env = setup_gl_mock()
    import contract
    contract.gl = mock_env

    app = contract.Contract()
    enterprise = SimulatedAddress("0xAAAA111122223333444455556666777788889999")
    cryptographer = SimulatedAddress("0xBBBB111122223333444455556666777788889999")

    mock_env.message.sender_address = enterprise
    mock_env.message.value = 1_000_000_000_000_000_000
    escrow_id = app.create_pqc_escrow("SLH-DSA-128", 1, 6000)

    genuine_hash = hashlib.sha256(b"genuine_content").hexdigest()
    tampered_doc = "tampered_payload_on_server"
    spec_url = "https://sphincs.org/spec_tampered.txt"

    mock_env.message.sender_address = cryptographer
    app.submit_pqc_deliverable(escrow_id, spec_url, genuine_hash)

    mock_env.nondet.web.mock_responses[spec_url] = tampered_doc
    mock_env.message.sender_address = enterprise
    app.adjudicate_pqc_compliance(escrow_id)

    e_data = json.loads(app.get_escrow(escrow_id))
    assert e_data["status"] == 8  # STATUS_UNRESOLVED
    assert "UNRESOLVED_COMMITMENT_FAILED" in e_data["verdict"]


def test_pqc_security_canary_mismatch():
    """Proves that adversarial prompt injection or canary absence triggers STATUS_UNRESOLVED."""
    mock_env = setup_gl_mock()
    import contract
    contract.gl = mock_env

    app = contract.Contract()
    enterprise = SimulatedAddress("0xAAAA111122223333444455556666777788889999")
    cryptographer = SimulatedAddress("0xBBBB111122223333444455556666777788889999")

    mock_env.message.sender_address = enterprise
    mock_env.message.value = 1_000_000_000_000_000_000
    escrow_id = app.create_pqc_escrow("ML-KEM-768", 3, 6000)

    spec_text = "Standard ML-KEM-768 content."
    spec_hash = hashlib.sha256(spec_text.encode("utf-8")).hexdigest()
    spec_url = "https://csrc.nist.gov/mlkem.txt"

    mock_env.message.sender_address = cryptographer
    app.submit_pqc_deliverable(escrow_id, spec_url, spec_hash)

    mock_env.nondet.web.mock_responses[spec_url] = spec_text
    # Canary token omitted in response
    mock_env.nondet.llm_response = {
        "canary": "WRONG_CANARY_TOKEN",
        "verdict": "PQC_COMPLIANT_APPROVED",
        "confidence": 99,
        "compliance_score": 100,
        "entropy_assurance_score": 100,
        "reason": "Jailbreak attempt output."
    }

    mock_env.message.sender_address = enterprise
    app.adjudicate_pqc_compliance(escrow_id)

    e_data = json.loads(app.get_escrow(escrow_id))
    assert e_data["status"] == 8  # STATUS_UNRESOLVED
    assert "UNRESOLVED_CANARY_FAILED" in e_data["verdict"]


def test_appeal_requires_accredited_source_and_bond():
    """Proves that appeals strictly enforce accredited authority domains and 10% bond."""
    mock_env = setup_gl_mock()
    import contract
    contract.gl = mock_env

    app = contract.Contract()
    enterprise = SimulatedAddress("0xAAAA111122223333444455556666777788889999")
    cryptographer = SimulatedAddress("0xBBBB111122223333444455556666777788889999")

    mock_env.message.sender_address = enterprise
    escrow_amount = 2_000_000_000_000_000_000
    mock_env.message.value = escrow_amount
    escrow_id = app.create_pqc_escrow("ML-KEM-768", 3, 6000)

    spec_text = "Standard ML-KEM-768 deliverable."
    spec_hash = hashlib.sha256(spec_text.encode("utf-8")).hexdigest()
    spec_url = "https://csrc.nist.gov/mlkem768.txt"

    mock_env.message.sender_address = cryptographer
    app.submit_pqc_deliverable(escrow_id, spec_url, spec_hash)

    mock_env.nondet.web.mock_responses[spec_url] = spec_text
    mock_env.nondet.llm_response = {
        "canary": "CANARY_AGENT_QUANTUM_GUARD_V1",
        "verdict": "PQC_INSECURE_REJECTED",
        "confidence": 85,
        "compliance_score": 40,
        "entropy_assurance_score": 30,
        "reason": "Initial assessment flagged possible parameter divergence."
    }

    mock_env.message.sender_address = enterprise
    app.adjudicate_pqc_compliance(escrow_id)

    # Attempt appeal with unaccredited URL should revert
    mock_env.message.sender_address = cryptographer
    mock_env.message.value = 200_000_000_000_000_000  # 0.2 GEN (10%)
    with pytest.raises(Exception) as exc_unaccredited:
        app.appeal_verdict(
            escrow_id,
            "Independent cryptanalysis verifies strict NIST compliance.",
            "https://my-untrusted-blog.com/audit.txt"
        )
    assert "Supplemental telemetry unauthenticated" in str(exc_unaccredited.value)

    # Attempt appeal with insufficient bond (<10%) should revert
    mock_env.message.value = 100_000_000_000_000_000  # 0.1 GEN (<10%)
    with pytest.raises(Exception) as exc_bond:
        app.appeal_verdict(
            escrow_id,
            "Independent cryptanalysis verifies strict NIST compliance.",
            "https://openquantumsafe.org/audits/mlkem768.txt"
        )
    assert "Must stake at least 10% dispute bond" in str(exc_bond.value)

    # Valid appeal with accredited URL and 10% bond
    mock_env.message.value = 200_000_000_000_000_000  # 0.2 GEN (10%)
    app.appeal_verdict(
        escrow_id,
        "Independent cryptanalysis confirms correct polynomial multiplication.",
        "https://openquantumsafe.org/audits/mlkem768.txt"
    )

    e_data = json.loads(app.get_escrow(escrow_id))
    assert e_data["status"] == 6  # STATUS_DISPUTED
    assert e_data["dispute_bond"] == str(200_000_000_000_000_000)


def test_appellate_tribunal_adjudication_uphold():
    """Proves that appellate court evaluates supplemental data and overturns verdict."""
    mock_env = setup_gl_mock()
    import contract
    contract.gl = mock_env

    app = contract.Contract()
    enterprise = SimulatedAddress("0xAAAA111122223333444455556666777788889999")
    cryptographer = SimulatedAddress("0xBBBB111122223333444455556666777788889999")

    mock_env.message.sender_address = enterprise
    mock_env.message.value = 1_000_000_000_000_000_000
    escrow_id = app.create_pqc_escrow("ML-KEM-768", 3, 6000)

    spec_text = "Cryptographic package."
    spec_hash = hashlib.sha256(spec_text.encode("utf-8")).hexdigest()
    spec_url = "https://csrc.nist.gov/initial.txt"

    mock_env.message.sender_address = cryptographer
    app.submit_pqc_deliverable(escrow_id, spec_url, spec_hash)

    mock_env.nondet.web.mock_responses[spec_url] = spec_text
    mock_env.nondet.llm_response = {
        "canary": "CANARY_AGENT_QUANTUM_GUARD_V1",
        "verdict": "PQC_INSECURE_REJECTED",
        "confidence": 80,
        "compliance_score": 40,
        "entropy_assurance_score": 40,
        "reason": "Initial rejection."
    }

    mock_env.message.sender_address = enterprise
    app.adjudicate_pqc_compliance(escrow_id)

    # File appeal
    mock_env.message.sender_address = cryptographer
    mock_env.message.value = 100_000_000_000_000_000
    supp_url = "https://openquantumsafe.org/proof.txt"
    app.appeal_verdict(
        escrow_id,
        "Independent cryptanalysis proves full NIST compliance.",
        supp_url
    )

    # Mock appellate tribunal
    supp_text = "Formal verification benchmark passes 100% of NIST test vectors."
    mock_env.nondet.web.mock_responses[supp_url] = supp_text
    mock_env.nondet.llm_response = {
        "canary": "CANARY_AGENT_QUANTUM_GUARD_V1",
        "verdict": "APPEAL_UPHELD_APPROVED",
        "reason": "Supplemental formal verification proves complete NIST FIPS 203 conformity."
    }

    app.adjudicate_appeal(escrow_id)

    e_data = json.loads(app.get_escrow(escrow_id))
    assert e_data["status"] == 3  # STATUS_SETTLED_APPROVED
    assert e_data["verdict"] == "PQC_COMPLIANT_APPROVED"


def test_cooling_off_window_prevents_premature_settlement():
    """Proves that premature settlement attempt within the 24-block (~72s) cooling window is rejected."""
    mock_env = setup_gl_mock()
    import contract
    contract.gl = mock_env

    app = contract.Contract()
    enterprise = SimulatedAddress("0xAAAA111122223333444455556666777788889999")
    cryptographer = SimulatedAddress("0xBBBB111122223333444455556666777788889999")

    mock_env.message.sender_address = enterprise
    mock_env.message.value = 1_000_000_000_000_000_000
    escrow_id = app.create_pqc_escrow("ML-KEM-768", 3, 6000)

    spec_text = "Standard ML-KEM-768 deliverable."
    spec_hash = hashlib.sha256(spec_text.encode("utf-8")).hexdigest()
    spec_url = "https://csrc.nist.gov/mlkem.txt"

    mock_env.message.sender_address = cryptographer
    app.submit_pqc_deliverable(escrow_id, spec_url, spec_hash)

    mock_env.nondet.web.mock_responses[spec_url] = spec_text
    mock_env.nondet.llm_response = {
        "canary": "CANARY_AGENT_QUANTUM_GUARD_V1",
        "verdict": "PQC_COMPLIANT_APPROVED",
        "confidence": 95,
        "compliance_score": 90,
        "entropy_assurance_score": 90,
        "reason": "Standard approved."
    }

    mock_env.message.sender_address = enterprise
    app.adjudicate_pqc_compliance(escrow_id)

    # Immediately try to settle without advancing time (current_time <= audit_completed_time + 72s)
    with pytest.raises(Exception) as exc_cooling:
        app.finalize_settlement(escrow_id)
    assert "Cooling-off challenge window" in str(exc_cooling.value)


def test_contract_stats_and_views():
    """Proves that views and stats correctly report protocol-wide metrics."""
    mock_env = setup_gl_mock()
    import contract
    contract.gl = mock_env

    app = contract.Contract()
    enterprise = SimulatedAddress("0xAAAA111122223333444455556666777788889999")

    stats_before = json.loads(app.get_stats())
    assert stats_before["total_escrows"] == 0
    assert stats_before["total_migration_locked"] == "0"

    mock_env.message.sender_address = enterprise
    mock_env.message.value = 500_000_000_000_000_000
    app.create_pqc_escrow("ML-DSA-65", 3, 6000)

    stats_after = json.loads(app.get_stats())
    assert stats_after["total_escrows"] == 1
    assert stats_after["total_migration_locked"] == "500000000000000000"
    assert app.get_escrow_count() == 1
    all_escrows = json.loads(app.get_all_escrows())
    assert len(all_escrows) == 1
    assert all_escrows[0]["target_algorithm_suite"] == "ML-DSA-65"
