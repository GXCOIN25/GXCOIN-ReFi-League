// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title AirdropDistributor
 * @dev Distributes ERC20 tokens via merkle tree-based claims
 * Supports multiple campaigns with different tokens and allocations
 */
contract AirdropDistributor is Ownable, ReentrancyGuard {
    struct Campaign {
        bytes32 merkleRoot;
        IERC20 token;
        uint256 totalAllocation;
        uint256 claimed;
        uint256 startTime;
        uint256 endTime;
        bool active;
    }
    
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;
    uint256 public campaignCount;
    
    event CampaignCreated(uint256 indexed campaignId, address indexed token, uint256 allocation);
    event TokensClaimed(uint256 indexed campaignId, address indexed user, uint256 amount);
    event CampaignUpdated(uint256 indexed campaignId, bool active);
    
    constructor() {}
    
    /**
     * @dev Create a new airdrop campaign
     */
    function createCampaign(
        bytes32 _merkleRoot,
        address _token,
        uint256 _totalAllocation,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyOwner returns (uint256) {
        require(_token != address(0), "Invalid token");
        require(_totalAllocation > 0, "Invalid allocation");
        require(_endTime > _startTime, "Invalid time range");
        
        uint256 campaignId = campaignCount++;
        campaigns[campaignId] = Campaign({
            merkleRoot: _merkleRoot,
            token: IERC20(_token),
            totalAllocation: _totalAllocation,
            claimed: 0,
            startTime: _startTime,
            endTime: _endTime,
            active: true
        });
        
        emit CampaignCreated(campaignId, _token, _totalAllocation);
        return campaignId;
    }
    
    /**
     * @dev Claim airdrop tokens using merkle proof
     */
    function claim(
        uint256 _campaignId,
        uint256 _amount,
        bytes32[] calldata _merkleProof
    ) external nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        
        require(campaign.active, "Campaign not active");
        require(block.timestamp >= campaign.startTime, "Campaign not started");
        require(block.timestamp <= campaign.endTime, "Campaign ended");
        require(!hasClaimed[_campaignId][msg.sender], "Already claimed");
        require(campaign.claimed + _amount <= campaign.totalAllocation, "Exceeds allocation");
        
        // Verify merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, _amount));
        require(
            MerkleProof.verify(_merkleProof, campaign.merkleRoot, leaf),
            "Invalid proof"
        );
        
        // Mark as claimed and transfer tokens
        hasClaimed[_campaignId][msg.sender] = true;
        campaign.claimed += _amount;
        
        require(
            campaign.token.transfer(msg.sender, _amount),
            "Transfer failed"
        );
        
        emit TokensClaimed(_campaignId, msg.sender, _amount);
    }
    
    /**
     * @dev Update campaign status
     */
    function updateCampaign(uint256 _campaignId, bool _active) external onlyOwner {
        campaigns[_campaignId].active = _active;
        emit CampaignUpdated(_campaignId, _active);
    }
    
    /**
     * @dev Withdraw unclaimed tokens after campaign ends
     */
    function withdrawUnclaimed(uint256 _campaignId) external onlyOwner {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp > campaign.endTime, "Campaign still active");
        
        uint256 unclaimed = campaign.totalAllocation - campaign.claimed;
        require(unclaimed > 0, "No unclaimed tokens");
        
        campaign.totalAllocation = campaign.claimed;
        require(
            campaign.token.transfer(owner(), unclaimed),
            "Transfer failed"
        );
    }
}
