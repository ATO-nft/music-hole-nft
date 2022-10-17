// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import './ERC2981ContractWideRoyalties.sol';
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/// @title Music Hole NFT contract
contract MusicHole is ERC721, ERC721URIStorage, ERC721Burnable, Ownable, ERC2981ContractWideRoyalties {

	using Counters for Counters.Counter;
	Counters.Counter private _tokenIdCounter;

	uint256 public price;
	string public uri;

	/// @notice constructor
	/// @param _name name of ERC-721 token
	/// @param _symbol symbol of ERC-721 token
	/// @param _uri metadata of NFT when redeeemable
	/// @param _royalties resale rights percentage (using 2 decimals: 10000 = 100%, 150 = 1.5%, 0 = 0%)
	/// @param _price price per mint
	constructor(
		string memory _name,
		string memory _symbol,
		string memory _uri,
		uint256 _royalties,
		uint _price
	)
	ERC721(_name, _symbol)
	{
		uri = _uri;
		_setRoyalties(owner(), _royalties);
		setPrice(_price);
	}

	function totalSupply()
		public
		view
		returns (uint256)
	{
		return _tokenIdCounter.current();
	}

	/// @notice mint NFT
	function mint()
		payable
		public
	{
		require(msg.value == price, "MSG_VALUE_DOES_NOT_MATCH_PRICE");
		_tokenIdCounter.increment();
		_safeMint(msg.sender, _tokenIdCounter.current());
		_setTokenURI(_tokenIdCounter.current(), uri);
	}

	/// @notice only owner can mint without paying
	function adminMint()
		payable
		public
		onlyOwner
	{
		_tokenIdCounter.increment();
		_safeMint(msg.sender, _tokenIdCounter.current());
		_setTokenURI(_tokenIdCounter.current(), uri);
	}

	/// @notice mint NFT
	function setPrice(uint _price)
		payable
		public
		onlyOwner
	{
		price = _price;
	}

	function _beforeTokenTransfer(address from, address to, uint256 tokenId)
		internal
		override(ERC721)
	{
		super._beforeTokenTransfer(from, to, tokenId);
	}

	function _afterTokenTransfer(address from, address to, uint256 tokenId)
		internal
		override(ERC721)
	{
		super._afterTokenTransfer(from, to, tokenId);
	}

	function burn(uint256 tokenId) public override {
		require(_exists(tokenId), "Redeem query for nonexistent token");
		require(ownerOf(tokenId) == msg.sender, "You are not the owner of this token");
		_burn(tokenId);
	}

	function _burn(uint256 tokenId)
		internal
		override(ERC721, ERC721URIStorage)
	{
		super._burn(tokenId);
	}

	function tokenURI(uint256 tokenId)
		public
		view
		override(ERC721, ERC721URIStorage)
		returns (string memory)
	{
		return super.tokenURI(tokenId);
	}

	function supportsInterface(bytes4 interfaceId)
		public
		view
		override(ERC721, ERC2981ContractWideRoyalties)
		returns (bool)
	{
		return super.supportsInterface(interfaceId);
	}
}
