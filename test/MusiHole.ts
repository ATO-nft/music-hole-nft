import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import fs from 'fs';

describe("Music Hole NFT Contract", function () {

  async function deployContractsFixture() {

    // Create signers
    const [issuer, acquirer] = await ethers.getSigners();

    const name = "Music Hole";
    const symbol = "MH";
    const metadataContent = fs.readFileSync(__dirname + "/metadata.json", {encoding:'utf8', flag:'r'}); // https://codebeautify.org/jsonminifier
    const royalties = 10 * 100; // 10% resale rights
    const price:any = ethers.utils.parseEther('1') ; // https://bobbyhadz.com/blog/typescript-type-has-no-properties-in-common-with-type
    const max:any = 10;

    // Create instance of Ato.sol
    const MusicHole = await ethers.getContractFactory("MusicHole");
    const mh = await MusicHole.deploy(name, symbol, metadataContent, royalties, price, max);
    await mh.deployed();
    return { issuer, acquirer, mh, name, symbol, royalties, price, metadataContent, max };
  }

  describe("Deployment", function () {
    it("Should deploy MusicHole.sol", async function () {
      const { mh, issuer } = await loadFixture(deployContractsFixture);
      expect(await mh.owner()).to.equal(issuer.address);
    });
    it("Should match royalties", async function () {
      const { mh, royalties } = await loadFixture(deployContractsFixture);
      expect((await mh.royaltyInfo(0, 10000))[1]).to.equal(royalties);
    });
    it("Should match metadata content", async function () {
      const { mh, acquirer, price, metadataContent } = await loadFixture(deployContractsFixture);
      await mh.connect(acquirer).mint( {value: price});
      expect(await mh.tokenURI(1)).to.equal(metadataContent);
    });
    it("Should revert if not contract owner", async function () {
      const { mh, acquirer } = await loadFixture(deployContractsFixture);
      expect(mh.connect(acquirer).adminMint(2)).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("Should revert if direct send", async function () {
      const { mh, acquirer } = await loadFixture(deployContractsFixture);
      expect(acquirer.sendTransaction({to:mh.address, value:ethers.utils.parseEther('1')})).to.be.revertedWith('CANNOT_DIRECTLY_SEND_ANY_VALUE');
      expect(acquirer.sendTransaction({to:mh.address, value:ethers.utils.parseEther('1'), data: "message in a bottle"})).to.be.revertedWith('CANNOT_DIRECTLY_SEND_ANY_DATA');
    });
  });

  describe("Transfers", function () {
    it("Should transfer the NFT", async function () {
      const { mh, issuer, acquirer, price } = await loadFixture(deployContractsFixture);
      await mh.connect(acquirer).mint( {value: price});
      await mh.connect(acquirer).transferFrom(acquirer.address, issuer.address, 1)
      expect(await mh.ownerOf(1)).to.equal(issuer.address);
    });
    it("Should set price", async function () {
      const { mh, issuer, acquirer, price } = await loadFixture(deployContractsFixture);
      const newPrice:any = ethers.utils.parseEther('2')
      await mh.connect(issuer).setPrice(newPrice);
      expect(await mh.price()).to.be.equal("2000000000000000000");
      expect(mh.connect(acquirer).setPrice(ethers.utils.parseEther('0.0001'))).to.be.reverted;
    });
    it("Should receive ETH", async function () {
      const { mh, issuer, acquirer, price } = await loadFixture(deployContractsFixture);
      const acquirerBal:any = await ethers.provider.getBalance(acquirer.address);
      const issuerBal:any = await ethers.provider.getBalance(issuer.address);
      await mh.connect(acquirer).mint( {value: price});
      expect(await ethers.provider.getBalance(acquirer.address)).to.lte(BigInt(acquirerBal) - BigInt(price));
      expect(await ethers.provider.getBalance(issuer.address)).to.be.equal(BigInt(issuerBal) + BigInt(price));
    });
    it("Should let issuer mint 2 NFTs", async function () {
      const { mh, issuer, price } = await loadFixture(deployContractsFixture);
      await mh.connect(issuer).adminMint(2);
      expect(await mh.balanceOf(issuer.address)).to.be.equal(2);
      expect(mh.connect(issuer).adminMint(2)).to.be.revertedWith('CANNOT_SEND_ANY_VALUE');
    });
    it("Should revert when reach id #9999", async function () {
      const { mh, issuer, acquirer, price, max } = await loadFixture(deployContractsFixture);
      await mh.connect(acquirer).mint( {value: price});
      await mh.connect(issuer).adminMint(max-2);
      expect(await mh.balanceOf(issuer.address)).to.be.equal(max-2);
      expect( mh.connect(issuer).adminMint(1)).to.be.revertedWith('CANNOT_MINT_MORE_THAN_MAX');
      expect( mh.connect(acquirer).mint({value: price})).to.be.revertedWith('CANNOT_MINT_MORE_THAN_MAX');
    });
  });
});
