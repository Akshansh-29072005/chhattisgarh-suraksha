// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReportRegistry {
    struct Report {
        string issueType;
        string description;
        string severity;
        string keywords;
        string location; // lat,lon or address as string
        string photoHash; // IPFS or hash reference if needed
        uint256 timestamp;
        string additionalData;
    }

    Report[] public reports;

    event ReportSubmitted(
        uint256 indexed reportId,
        string issueType,
        string description,
        string severity,
        string keywords,
        string location,
        string photoHash,
        uint256 timestamp,
        string additionalData
    );

    function submitReport(
        string memory issueType,
        string memory description,
        string memory severity,
        string memory keywords,
        string memory location,
        string memory photoHash,
        string memory additionalData
    ) public {
        reports.push(Report({
            issueType: issueType,
            description: description,
            severity: severity,
            keywords: keywords,
            location: location,
            photoHash: photoHash,
            timestamp: block.timestamp,
            additionalData: additionalData
        }));
        emit ReportSubmitted(
            reports.length - 1,
            issueType,
            description,
            severity,
            keywords,
            location,
            photoHash,
            block.timestamp,
            additionalData
        );
    }

    function getReport(uint256 reportId) public view returns (Report memory) {
        require(reportId < reports.length, "Invalid reportId");
        return reports[reportId];
    }

    function getReportsCount() public view returns (uint256) {
        return reports.length;
    }

    function getAllReports() public view returns (Report[] memory) {
        return reports;
    }
}
