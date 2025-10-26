import { ethers } from "ethers";
import fs from "fs";
import path from "path";

const CONTRACT_NAME = "ReportRegistry";
const ARTIFACTS_PATH = path.resolve(
  process.cwd(),
  "blockchain/artifacts/contracts/ReportRegistry.sol/ReportRegistry.json"
);
const PERSISTENCE_PATH = path.resolve(process.cwd(), 'blockchain/.contract-address.json');

let contract;
let provider;
let signer;

export { contract }; // Export contract for health checks

export async function initBlockchain() {
  try {
    // Connect to local Hardhat node
    provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Wait for provider to be ready
    await provider.ready;

    // Get signer (first account)
    const network = await provider.getNetwork();
    console.log('Connected to network:', network.chainId);

    const accounts = await provider.listAccounts();
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts available');
    }

    signer = await provider.getSigner(accounts[0].address);
    console.log('Using account:', await signer.getAddress());

    // Load contract ABI
    const artifactPath = path.resolve(process.cwd(), 'blockchain/artifacts/contracts/ReportRegistry.sol/ReportRegistry.json');
    console.log('Looking for contract at:', artifactPath);
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // Check for existing contract deployment
    const forceRedeploy = process.env.FORCE_BLOCKCHAIN_REDEPLOY === 'true';
    let contractAddress;

    if (fs.existsSync(PERSISTENCE_PATH) && !forceRedeploy) {
      // Load existing contract
      try {
        const persistedData = JSON.parse(fs.readFileSync(PERSISTENCE_PATH, 'utf8'));
        contractAddress = persistedData.contractAddress;

        // Verify contract exists at this address
        const code = await provider.getCode(contractAddress);
        if (code === '0x') {
          console.log('⚠️  Contract not found at persisted address, redeploying...');
          throw new Error('Contract not found at address');
        }

        contract = new ethers.Contract(contractAddress, artifact.abi, signer);
        console.log(`✅ Loaded existing contract from: ${contractAddress}`);
        console.log(`   Deployed at: ${persistedData.deployedAt}`);

        return contractAddress;
      } catch (error) {
        console.log('Failed to load existing contract, redeploying...', error.message);
        // Fall through to deployment
      }
    }

    // Deploy new contract
    console.log('Deploying new contract...');
    const factory = new ethers.ContractFactory(
      artifact.abi,
      artifact.bytecode,
      signer
    );

    contract = await factory.deploy();
    const receipt = await contract.deploymentTransaction().wait();
    contractAddress = receipt.contractAddress;

    // Save contract address for persistence
    const persistenceData = {
      contractAddress: contractAddress,
      deployedAt: new Date().toISOString(),
      network: 'hardhat-local',
      chainId: Number(network.chainId)
    };

    // Ensure blockchain directory exists
    const blockchainDir = path.resolve(process.cwd(), 'blockchain');
    if (!fs.existsSync(blockchainDir)) {
      fs.mkdirSync(blockchainDir, { recursive: true });
    }

    fs.writeFileSync(PERSISTENCE_PATH, JSON.stringify(persistenceData, null, 2));
    console.log('✅ Contract deployed at:', contractAddress);
    console.log('📄 Contract address saved to:', PERSISTENCE_PATH);

    return contractAddress;
  } catch (e) {
    console.error('Blockchain initialization error:', e);
    throw e;
  }
}

export function getContract() {
  if (!contract) throw new Error("Blockchain not initialized");
  return contract;
}

export async function submitReportToChain({
  issueType,
  description,
  severity,
  keywords,
  location,
  photoHash = "",
  additionalData = ""
}) {
  if (!contract) throw new Error("Blockchain not initialized");
  const tx = await contract.submitReport(
    issueType,
    description,
    severity,
    keywords,
    location,
    photoHash,
    additionalData
  );
  await tx.wait();
  return tx.hash;
}

export async function getAllReportsFromChain() {
  if (!contract) throw new Error("Blockchain not initialized");
  const count = await contract.getReportsCount();
  const reports = [];
  for (let i = 0; i < count; i++) {
    const r = await contract.getReport(i);
    reports.push({
      issueType: r.issueType,
      description: r.description,
      severity: r.severity,
      keywords: r.keywords,
      location: r.location,
      photoHash: r.photoHash,
      timestamp: Number(r.timestamp),
      additionalData: r.additionalData
    });
  }
  return reports;
}
