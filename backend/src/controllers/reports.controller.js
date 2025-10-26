import * as blockchain from '../services/blockchain.service.js';

export async function submitReport(req, res) {
  try {
    const { issueType, description, severity, keywords, location, photoHash, additionalData } = req.body;
    if (!issueType || !description || !location || !severity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const txHash = await blockchain.submitReportToChain({
      issueType,
      description,
      severity,
      keywords: keywords || '',
      location,
      photoHash: photoHash || '',
      additionalData: additionalData || ''
    });
    res.json({ success: true, txHash });
  } catch (err) {
    console.error('Failed to submit report:', err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
}

export async function getAllReports(req, res) {
  try {
    const reports = await blockchain.getAllReportsFromChain();
    res.json({ success: true, data: reports });
  } catch (err) {
    console.error('Failed to fetch reports:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
}
