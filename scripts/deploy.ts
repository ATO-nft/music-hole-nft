import { ethers } from "hardhat";
const hre = require("hardhat");
const color = require("cli-color")
import fs from 'fs';

async function main() {

  const name = "Music Hole";
  const symbol = "MH";
  const metadataContent = fs.readFileSync(__dirname + "/metatest.json", {encoding:'utf8', flag:'r'}); // https://codebeautify.org/jsonminifier
  const royalties = 10 * 100; // 10% resale rights
  const price:any = ethers.utils.parseEther('1') ; // https://bobbyhadz.com/blog/typescript-type-has-no-properties-in-common-with-type

  // const MusicHole = await ethers.getContractFactory("MusicHole");
  // const mh = await MusicHole.deploy(name, symbol, metadataContent, royalties, price);
  // await mh.deployed();

  // var msg = color.xterm(39).bgXterm(128);
  // console.log("NFT contract deployed. ✅", msg(mh.address))

  // const addr = "0x0F7CF76d81b9d6984dd43b25cD14253cAB48783d"

  // Etherscan verification
  // await mh.deployTransaction.wait(6)
  await hre.run("verify:verify", { network: "goerli", address: addr, constructorArguments: [name, symbol, metadataContent, royalties, price], });
  console.log("Etherscan verification done. ✅")
  
  console.log("Source code: https://goerli.etherscan.io/address/" + mh.address + "#code")
  console.log("https://ato.network/Goerli/" + mh.address + "/1")
  //console.log("OpenSea URL: " + "https://testnets.opensea.io/asset/goerli/" + ato.address + "/1")
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
});