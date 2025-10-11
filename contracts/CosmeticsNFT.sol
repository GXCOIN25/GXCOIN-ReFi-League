// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title CosmeticsNFT
 * @dev ERC1155 contract for cosmetic items (skins, avatars, badges, etc.)
 * Supports limited edition items and rarity tiers
 */
contract CosmeticsNFT is ERC1155, Ownable {
    using Strings for uint256;
    
    struct Item {
        string name;
        string category;
        uint8 rarity;
        uint256 maxSupply;
        uint256 currentSupply;
        bool isLimitedEdition;
        string heroId;
    }
    
    mapping(uint256 => Item) public items;
    uint256 public itemCount;
    
    event ItemCreated(uint256 indexed itemId, string name, string category, uint8 rarity);
    event ItemMinted(address indexed user, uint256 indexed itemId, uint256 amount);
    
    constructor() ERC1155("https://api.gxcoin.world/cosmetics/{id}.json") {}
    
    /**
     * @dev Create a new cosmetic item
     */
    function createItem(
        string memory _name,
        string memory _category,
        uint8 _rarity,
        uint256 _maxSupply,
        bool _isLimitedEdition,
        string memory _heroId
    ) external onlyOwner returns (uint256) {
        require(bytes(_name).length > 0, "Invalid name");
        require(_rarity >= 1 && _rarity <= 4, "Invalid rarity");
        
        uint256 itemId = itemCount++;
        
        items[itemId] = Item({
            name: _name,
            category: _category,
            rarity: _rarity,
            maxSupply: _maxSupply,
            currentSupply: 0,
            isLimitedEdition: _isLimitedEdition,
            heroId: _heroId
        });
        
        emit ItemCreated(itemId, _name, _category, _rarity);
        return itemId;
    }
    
    /**
     * @dev Mint cosmetic item to user
     */
    function mintItem(
        address _to,
        uint256 _itemId,
        uint256 _amount
    ) external onlyOwner {
        Item storage item = items[_itemId];
        
        if (item.maxSupply > 0) {
            require(
                item.currentSupply + _amount <= item.maxSupply,
                "Exceeds max supply"
            );
        }
        
        item.currentSupply += _amount;
        _mint(_to, _itemId, _amount, "");
        
        emit ItemMinted(_to, _itemId, _amount);
    }
    
    /**
     * @dev Batch mint multiple items
     */
    function mintBatch(
        address _to,
        uint256[] memory _itemIds,
        uint256[] memory _amounts
    ) external onlyOwner {
        require(_itemIds.length == _amounts.length, "Length mismatch");
        
        for (uint256 i = 0; i < _itemIds.length; i++) {
            Item storage item = items[_itemIds[i]];
            
            if (item.maxSupply > 0) {
                require(
                    item.currentSupply + _amounts[i] <= item.maxSupply,
                    "Exceeds max supply"
                );
            }
            
            item.currentSupply += _amounts[i];
        }
        
        _mintBatch(_to, _itemIds, _amounts, "");
    }
    
    /**
     * @dev Set URI for metadata
     */
    function setURI(string memory _newuri) external onlyOwner {
        _setURI(_newuri);
    }
    
    /**
     * @dev Get item details
     */
    function getItem(uint256 _itemId) external view returns (
        string memory name,
        string memory category,
        uint8 rarity,
        uint256 maxSupply,
        uint256 currentSupply,
        bool isLimitedEdition
    ) {
        Item memory item = items[_itemId];
        return (
            item.name,
            item.category,
            item.rarity,
            item.maxSupply,
            item.currentSupply,
            item.isLimitedEdition
        );
    }
}
