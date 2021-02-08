const Hub = artifacts.require("Hub");
const AddressStorageLib = artifacts.require("AddressStorageLib");
const TransactionLib = artifacts.require("TransactionLib");

module.exports = async function(deployer) {
  deployer.deploy(AddressStorageLib);
  deployer.deploy(TransactionLib);
  deployer.link(AddressStorageLib, Hub);
  deployer.link(TransactionLib, Hub);
  await deployer.deploy(Hub);
};
