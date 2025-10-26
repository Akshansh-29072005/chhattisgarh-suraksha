# Blockchain-Based Anonymous Reporting System

## Quick Start

1. Start the Hardhat node (local blockchain):
```bash
cd backend/blockchain
npx hardhat node --config hardhat.config.cjs
```

2. In a new terminal, start the backend:
```bash
cd backend
npm run dev
```

3. In another terminal, start the frontend:
```bash
cd frontend
npm run dev
```

## Features

- **Anonymous Reports**: Submit reports without revealing identity
- **Blockchain Storage**: All reports are stored immutably on-chain
- **Map Integration**: View reports and alerts on an interactive map
- **Multiple Categories**: Support for environmental, safety, and other issues
- **Real-time Updates**: See new reports as they come in

## How it Works

1. **Submitting Reports**:
   - Go to the Citizen Reporting page
   - Fill in the report details
   - Submit anonymously (no identity stored)
   - Report is saved on blockchain

2. **Viewing Reports**:
   - Check the Environmental Dashboard
   - Use the interactive map
   - Filter by severity and type
   - Click markers for details

3. **Security**:
   - Reports are immutable once submitted
   - No personal data is stored
   - Backend acts as proxy to blockchain
   - All data is public and verifiable

## Development

- Smart Contract: `/backend/blockchain/contracts/ReportRegistry.sol`
- Backend Service: `/backend/src/services/blockchain.service.js`
- Frontend Integration: `/frontend/src/utils/report.js`

## Notes

- The system uses a local Hardhat node for development
- For production, deploy to a private blockchain or layer-2 solution
- Photos/files are referenced by hash only (actual storage would be on IPFS)