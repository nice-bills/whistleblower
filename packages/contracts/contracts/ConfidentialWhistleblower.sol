// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint32, eaddress, externalEaddress, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Confidential Whistleblower
/// @notice Public document CID with FHE-encrypted submitter metadata and investigator-selective decryption.
/// @dev Builder Track — Zama Developer Program Season 3.
contract ConfidentialWhistleblower is ZamaEthereumConfig {
    struct Submission {
        string documentCid;
        uint64 submittedAt;
        eaddress encryptedReporter;
        euint32 encryptedRiskTier;
    }

    address public owner;
    uint256 public submissionCount;

    mapping(uint256 => Submission) private _submissions;
    mapping(address => bool) public investigators;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event InvestigatorGranted(address indexed investigator);
    event InvestigatorRevoked(address indexed investigator);
    event SubmissionCreated(
        uint256 indexed submissionId,
        string documentCid,
        uint64 submittedAt,
        address indexed submitter
    );
    event DecryptionShared(uint256 indexed submissionId, address indexed investigator);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        investigators[msg.sender] = true;
        emit InvestigatorGranted(msg.sender);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        address previous = owner;
        owner = newOwner;
        emit OwnershipTransferred(previous, newOwner);
    }

    function grantInvestigator(address investigator) external onlyOwner {
        require(investigator != address(0), "Zero address");
        investigators[investigator] = true;
        emit InvestigatorGranted(investigator);
    }

    function revokeInvestigator(address investigator) external onlyOwner {
        investigators[investigator] = false;
        emit InvestigatorRevoked(investigator);
    }

    /// @notice Submit a public document CID with encrypted reporter identity and risk tier (1–5).
    /// @param documentCid IPFS (or other) content identifier — public
    /// @param encryptedReporter Client-encrypted address (may equal msg.sender or a pseudonym wallet)
    /// @param encryptedRiskTier Client-encrypted severity tier
    /// @param inputProof FHE input proof from Relayer SDK / Hardhat plugin
    function submit(
        string calldata documentCid,
        externalEaddress encryptedReporter,
        externalEuint32 encryptedRiskTier,
        bytes calldata inputProof
    ) external returns (uint256 submissionId) {
        require(bytes(documentCid).length > 0, "Empty CID");

        eaddress reporter = FHE.fromExternal(encryptedReporter, inputProof);
        euint32 riskTier = FHE.fromExternal(encryptedRiskTier, inputProof);

        submissionId = submissionCount;
        submissionCount += 1;

        _submissions[submissionId] = Submission({
            documentCid: documentCid,
            submittedAt: uint64(block.timestamp),
            encryptedReporter: reporter,
            encryptedRiskTier: riskTier
        });

        FHE.allowThis(reporter);
        FHE.allow(reporter, msg.sender);
        FHE.allowThis(riskTier);
        FHE.allow(riskTier, msg.sender);

        emit SubmissionCreated(submissionId, documentCid, uint64(block.timestamp), msg.sender);
    }

    /// @notice Allow an investigator to user-decrypt encrypted fields for a submission.
    function shareSubmissionWithInvestigator(uint256 submissionId, address investigator) external onlyOwner {
        require(investigators[investigator], "Not investigator");
        require(submissionId < submissionCount, "Invalid submission");

        Submission storage s = _submissions[submissionId];
        FHE.allow(s.encryptedReporter, investigator);
        FHE.allow(s.encryptedRiskTier, investigator);

        emit DecryptionShared(submissionId, investigator);
    }

    function getDocumentCid(uint256 submissionId) external view returns (string memory) {
        require(submissionId < submissionCount, "Invalid submission");
        return _submissions[submissionId].documentCid;
    }

    function getSubmittedAt(uint256 submissionId) external view returns (uint64) {
        require(submissionId < submissionCount, "Invalid submission");
        return _submissions[submissionId].submittedAt;
    }

    function getEncryptedReporter(uint256 submissionId) external view returns (eaddress) {
        require(submissionId < submissionCount, "Invalid submission");
        return _submissions[submissionId].encryptedReporter;
    }

    function getEncryptedRiskTier(uint256 submissionId) external view returns (euint32) {
        require(submissionId < submissionCount, "Invalid submission");
        return _submissions[submissionId].encryptedRiskTier;
    }
}
