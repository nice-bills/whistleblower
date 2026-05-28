import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { ConfidentialWhistleblower, ConfidentialWhistleblower__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  owner: HardhatEthersSigner;
  submitter: HardhatEthersSigner;
  investigator: HardhatEthersSigner;
  outsider: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory(
    "ConfidentialWhistleblower",
  )) as ConfidentialWhistleblower__factory;
  const contract = (await factory.deploy()) as ConfidentialWhistleblower;
  const address = await contract.getAddress();
  return { contract, address };
}

describe("ConfidentialWhistleblower", function () {
  let signers: Signers;
  let contract: ConfidentialWhistleblower;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      owner: ethSigners[0],
      submitter: ethSigners[1],
      investigator: ethSigners[2],
      outsider: ethSigners[3],
    };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn("Tests require FHEVM mock (local hardhat network)");
      this.skip();
    }

    ({ contract, address: contractAddress } = await deployFixture());
    await (await contract.connect(signers.owner).grantInvestigator(signers.investigator.address)).wait();
  });

  it("stores public CID and allows investigator to decrypt metadata", async function () {
    const documentCid = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
    const reporterAddress = signers.submitter.address;
    const riskTier = 4;

    const encrypted = await fhevm
      .createEncryptedInput(contractAddress, signers.submitter.address)
      .addAddress(reporterAddress)
      .add32(riskTier)
      .encrypt();

    const tx = await contract
      .connect(signers.submitter)
      .submit(documentCid, encrypted.handles[0], encrypted.handles[1], encrypted.inputProof);
    await tx.wait();

    expect(await contract.submissionCount()).to.eq(1n);
    expect(await contract.getDocumentCid(0n)).to.eq(documentCid);

    await (
      await contract
        .connect(signers.owner)
        .shareSubmissionWithInvestigator(0n, signers.investigator.address)
    ).wait();

    const encReporter = await contract.getEncryptedReporter(0n);
    const encRisk = await contract.getEncryptedRiskTier(0n);

    const clearReporter = await fhevm.userDecryptEaddress(
      encReporter,
      contractAddress,
      signers.investigator,
    );
    const clearRisk = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encRisk,
      contractAddress,
      signers.investigator,
    );

    expect(clearReporter.toLowerCase()).to.eq(reporterAddress.toLowerCase());
    expect(clearRisk).to.eq(riskTier);

    await expect(
      fhevm.userDecryptEaddress(encReporter, contractAddress, signers.outsider),
    ).to.be.rejected;
  });
});
