// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title BattlePass
 * @dev NFT-based Battle Pass system with levels and rewards
 * Premium passes unlock exclusive rewards
 */
contract BattlePass is ERC721, Ownable {
    using Counters for Counters.Counter;
    
    struct Pass {
        uint256 seasonId;
        uint256 level;
        uint256 xp;
        bool isPremium;
        uint256 purchasedAt;
    }
    
    struct Season {
        uint256 startTime;
        uint256 endTime;
        uint256 maxLevel;
        uint256 xpPerLevel;
        bool active;
    }
    
    Counters.Counter private _tokenIds;
    mapping(uint256 => Pass) public passes;
    mapping(uint256 => Season) public seasons;
    mapping(address => mapping(uint256 => uint256)) public userSeasonPass;
    uint256 public currentSeasonId;
    
    event PassMinted(address indexed user, uint256 indexed tokenId, uint256 seasonId);
    event PassUpgraded(uint256 indexed tokenId, bool premium);
    event XPAdded(uint256 indexed tokenId, uint256 xp, uint256 newLevel);
    event SeasonCreated(uint256 indexed seasonId, uint256 startTime, uint256 endTime);
    
    constructor() ERC721("GXCOIN Battle Pass", "GXBP") {}
    
    /**
     * @dev Create a new season
     */
    function createSeason(
        uint256 _startTime,
        uint256 _endTime,
        uint256 _maxLevel,
        uint256 _xpPerLevel
    ) external onlyOwner {
        require(_endTime > _startTime, "Invalid time range");
        require(_maxLevel > 0, "Invalid max level");
        
        currentSeasonId++;
        seasons[currentSeasonId] = Season({
            startTime: _startTime,
            endTime: _endTime,
            maxLevel: _maxLevel,
            xpPerLevel: _xpPerLevel,
            active: true
        });
        
        emit SeasonCreated(currentSeasonId, _startTime, _endTime);
    }
    
    /**
     * @dev Mint free Battle Pass for user
     */
    function mintPass(address _user, uint256 _seasonId) external onlyOwner returns (uint256) {
        require(seasons[_seasonId].active, "Season not active");
        require(userSeasonPass[_user][_seasonId] == 0, "Pass already exists");
        
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        
        _safeMint(_user, tokenId);
        
        passes[tokenId] = Pass({
            seasonId: _seasonId,
            level: 1,
            xp: 0,
            isPremium: false,
            purchasedAt: block.timestamp
        });
        
        userSeasonPass[_user][_seasonId] = tokenId;
        
        emit PassMinted(_user, tokenId, _seasonId);
        return tokenId;
    }
    
    /**
     * @dev Upgrade pass to premium
     */
    function upgradeToPremium(uint256 _tokenId) external {
        require(ownerOf(_tokenId) == msg.sender, "Not pass owner");
        require(!passes[_tokenId].isPremium, "Already premium");
        
        passes[_tokenId].isPremium = true;
        
        emit PassUpgraded(_tokenId, true);
    }
    
    /**
     * @dev Add XP to pass and level up if threshold reached
     */
    function addXP(uint256 _tokenId, uint256 _xp) external onlyOwner {
        Pass storage pass = passes[_tokenId];
        Season storage season = seasons[pass.seasonId];
        
        pass.xp += _xp;
        
        // Calculate new level
        uint256 newLevel = 1 + (pass.xp / season.xpPerLevel);
        if (newLevel > season.maxLevel) {
            newLevel = season.maxLevel;
        }
        
        if (newLevel > pass.level) {
            pass.level = newLevel;
        }
        
        emit XPAdded(_tokenId, _xp, pass.level);
    }
    
    /**
     * @dev Get pass details
     */
    function getPass(uint256 _tokenId) external view returns (
        uint256 seasonId,
        uint256 level,
        uint256 xp,
        bool isPremium
    ) {
        Pass memory pass = passes[_tokenId];
        return (pass.seasonId, pass.level, pass.xp, pass.isPremium);
    }
}
