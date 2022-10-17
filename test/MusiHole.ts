import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Music Hole NFT Contract", function () {

  async function deployContractsFixture() {

    // Create signers
    const [issuer, acquirer] = await ethers.getSigners();

    const name = "Music Hole";
    const symbol = "MH";
    const uri = "bafybeif5ik6adva4tijjvqdfcgwx24v5gwpoothduxbucotsvzjcx4lroq/metatada.json";
    const royalties = 8 * 100; // 8% resale rights
    const price:any = ethers.utils.parseEther('1') ; // https://bobbyhadz.com/blog/typescript-type-has-no-properties-in-common-with-type

    // Create instance of Ato.sol
    const MusicHole = await ethers.getContractFactory("MusicHole");
    const mh = await MusicHole.deploy(name, symbol, uri, royalties, price);
    await mh.deployed();
    return { issuer, acquirer, mh, name, symbol, uri, royalties, price };
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
    it("Should match uri", async function () {
      const { mh, acquirer, uri, price } = await loadFixture(deployContractsFixture);
      await mh.connect(acquirer).mint( {value: price});
      expect(await mh.tokenURI(1)).to.equal(uri);
    });
    it("Should revert if not contract owner", async function () {
      const { mh, acquirer } = await loadFixture(deployContractsFixture);
      expect(mh.connect(acquirer).adminMint()).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("Should set price", async function () {
      const { mh, issuer, acquirer, price } = await loadFixture(deployContractsFixture);
      const newPrice:any = ethers.utils.parseEther('2')
      await mh.connect(issuer).setPrice(newPrice);
      expect(await mh.price()).to.be.equal("2000000000000000000");
      expect(mh.connect(acquirer).setPrice()).to.be.reverted;
    });
  });

  describe("Transfers", function () {
    it("Should transfer the NFT", async function () {
      const { mh, issuer, acquirer, price } = await loadFixture(deployContractsFixture);
      await mh.connect(acquirer).mint( {value: price});
      await mh.connect(acquirer).transferFrom(acquirer.address, issuer.address, 1)
      expect(await mh.ownerOf(1)).to.equal(issuer.address);
    });
  });
});
