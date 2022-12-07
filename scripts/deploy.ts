import { ethers } from "hardhat";
const hre = require("hardhat");
const color = require("cli-color")

async function main() {

  console.log("Deployment started...")

  const name = "Music Hole (2022)";
  const symbol = "MH";
  const metadataContent = "https://bafybeih7wfm7pln466yqfy3zct3n4d2kpfqzj5qkua5vck7rhvd4y5ncvy.ipfs.w3s.link/metadata.json"
  const royalties = 10 * 100; // 10% resale rights
  const price:any = ethers.utils.parseEther('0.042') ; // https://bobbyhadz.com/blog/typescript-type-has-no-properties-in-common-with-type
  const max:number = 10000;

  const MusicHole = await ethers.getContractFactory("MusicHole");
  const mh = await MusicHole.deploy(name, symbol, metadataContent, royalties, price, max);
  await mh.deployed();

  var msg = color.xterm(39).bgXterm(128);
  console.log("NFT contract deployed. ✅", msg(mh.address))

  console.log("Source code: https://etherscan.io/address/" + mh.address + "#code")
  console.log("https://ato.network/Ethereum/" + mh.address + "/1")
  console.log("OpenSea URL: " + "https://opensea.io/asset/ethereum/" + mh.address + "/1")

  // Etherscan verification
  await mh.deployTransaction.wait(6)
  console.log("Verification started...")
  await hre.run("verify:verify", { network: "ethereum", address: mh.address, constructorArguments: [name, symbol, metadataContent, royalties, price, max], });
  console.log("Etherscan verification done. ✅")
  
 
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
});