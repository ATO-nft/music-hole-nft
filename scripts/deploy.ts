import { ethers } from "hardhat";
const hre = require("hardhat");
const color = require("cli-color")

async function main() {

  console.log("Deployment started...")

  const name = "Thistle";
  const symbol = "THISTLE";
  const metadataContent = "https://bafybeidskqwky4c4rl4ncrcoe3qeybuyrspg5qvfyj3tevh6ceeo3cpayq.ipfs.w3s.link/metatest.json"
  const royalties = 10 * 100; // 10% resale rights
  const price:any = ethers.utils.parseEther('0.042') ; // https://bobbyhadz.com/blog/typescript-type-has-no-properties-in-common-with-type
  const max:number = 10000;

  const MusicHole = await ethers.getContractFactory("MusicHole");
  const mh = await MusicHole.deploy(name, symbol, metadataContent, royalties, price, max);
  await mh.deployed();

  var msg = color.xterm(39).bgXterm(128);
  console.log("NFT contract deployed. ✅", msg(mh.address))

  // Etherscan verification
  // await mh.deployTransaction.wait(6)
  // console.log("Verification started...")
  // await hre.run("verify:verify", { network: "goerli", address: mh.address, constructorArguments: [name, symbol, metadataContent, royalties, price, max], });
  console.log("Etherscan verification done. ✅")
  
  console.log("Source code: https://goerli.etherscan.io/address/" + mh.address + "#code")
  console.log("https://ato.network/Goerli/" + mh.address + "/1")
  console.log("OpenSea URL: " + "https://testnets.opensea.io/asset/goerli/" + mh.address + "/1")
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
});