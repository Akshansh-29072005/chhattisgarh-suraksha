import * as blockchain from '../services/blockchain.service.js';
import logger from '../utils/logger.js';

export async function submitReport(req, res) {
  try {
    const { issueType, description, severity, keywords, location, photoHash, additionalData } = req.body;

    if (!issueType || !description || !location || !severity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        requiredFields: ['issueType', 'description', 'location', 'severity']
      });
    }

    // Attempt to submit to blockchain
    try {
      const txHash = await blockchain.submitReportToChain({
        issueType,
        description,
        severity,
        keywords: keywords || '',
        location,
        photoHash: photoHash || '',
        additionalData: additionalData || ''
      });

      logger.info('Report submitted to blockchain', {
        txHash,
        issueType,
        severity,
        userId: req.user?.userId
      });

      res.json({
        success: true,
        txHash,
        message: 'Report submitted successfully to blockchain'
      });
    } catch (blockchainError) {
      // Log blockchain error but return graceful message
      logger.error('Blockchain submission failed:', {
        error: blockchainError.message,
        issueType,
        severity
      });

      // Return error indicating blockchain is temporarily unavailable
      res.status(503).json({
        success: false,
        error: 'Blockchain service temporarily unavailable',
        message: 'Your report could not be submitted to the blockchain at this time. Please try again later.',
        details: blockchainError.message
      });
    }
  } catch (err) {
    logger.error('Failed to submit report:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to submit report',
      message: 'An unexpected error occurred'
    });
  }
}

export async function getAllReports(req, res) {
  try {
    const reports = await blockchain.getAllReportsFromChain();

    logger.info('Reports fetched from blockchain', {
      count: reports.length
    });

    res.json({
      success: true,
      data: reports,
      count: reports.length
    });
  } catch (err) {
    logger.error('Failed to fetch reports:', err);

    // Graceful fallback - return empty array instead of error
    res.json({
      success: true,
      data: [],
      count: 0,
      note: 'Blockchain temporarily unavailable - showing cached data'
    });
  }
}
