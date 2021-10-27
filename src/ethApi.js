import { createAlchemyWeb3 } from "@alch/alchemy-web3";

import v1 from "./contracts/v1.json";
import v2 from "./contracts/v2.json";

const alchemyKey = "wss://polygon-mainnet.g.alchemy.com/v2/fhZux9rES-s4VyU-G58IdvfbeqeXYcor";

export const web3 = createAlchemyWeb3(alchemyKey);

export const connectWallet = async () => {
  if (!window.ethereum) {
    return {
      success: false,
      address: "",
      error: "no-wallet",
    };
  }

  try {
    const addressArray = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    return {
      success: true,
      address: addressArray[0],
    };
  } catch (err) {
    return {
      success: false,
      address: "",
      error: "no-address",
      errorMessage: err,
    };
  }
};

export const getCurrentWalletConnected = async () => {
  if (!window.ethereum) {
    return {
      success: false,
      address: "",
      error: "no-wallet",
    };
  }

  try {
    const addressArray = await window.ethereum.request({
      method: "eth_accounts",
    });

    if (addressArray.length > 0) {
      return {
        success: true,
        address: addressArray[0],
      };
    }

    return {
      success: false,
      address: "",
      error: "not-connected",
    };
  } catch (err) {
    return {
      success: false,
      address: "",
      status: err.message,
    };
  }
};

export const transfer = async (from, to, tokenId, contractAddress, version) => {
  if (!window.ethereum || from === "") {
    return {
      success: false,
      error: "not-connected",
    };
  }

  const contractABI = version === 1 ? v1.abi : v2.abi;

  const contract = new web3.eth.Contract(
    contractABI,
    contractAddress
  );

  const transactionParameters = {
    to: contractAddress,
    from: from,
    data: contract.methods.transferFrom(from, to, tokenId).encodeABI(),
  };

  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

    return {
      success: true,
      txHash
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
