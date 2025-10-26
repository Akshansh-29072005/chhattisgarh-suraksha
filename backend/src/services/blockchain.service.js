import { ethers } from "ethers";
import fs from "fs";
import path from "path";

const CONTRACT_NAME = "ReportRegistry";
const ARTIFACTS_PATH = path.resolve(
  process.cwd(),
  "blockchain/artifacts/contracts/ReportRegistry.sol/ReportRegistry.json"
);

let contract;
let provider;
let signer;

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

    // Load contract ABI and bytecode
    try {
      const artifactPath = path.resolve(process.cwd(), 'blockchain/artifacts/contracts/ReportRegistry.sol/ReportRegistry.json');
      console.log('Looking for contract at:', artifactPath);
      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

      // Deploy contract
      const factory = new ethers.ContractFactory(
        artifact.abi,
        artifact.bytecode,
        signer
      );
      
      contract = await factory.deploy();
      const receipt = await contract.deploymentTransaction().wait();
      console.log('Contract deployed at:', receipt.contractAddress);
      
      return receipt.contractAddress;
    } catch (e) {
      console.error('Contract deployment error:', e);
      throw e;
    }
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
