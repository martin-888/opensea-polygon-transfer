import { useState, useEffect } from 'react';
import { connectWallet, getCurrentWalletConnected, transfer, web3 } from './ethApi';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [tokenID, setTokenID] = useState(0);
  const [contractAddress, setContractAddress] = useState("");
  const [address, setAddress] = useState("");
  const [myAddress, setMyAddress] = useState("");
  const [txHash, setTxHash] = useState("");
  const [version, setVersion] = useState(2);

  useEffect(() => {
    connectWallet().then((resp) => setMyAddress(resp.address))
  }, []);

  useEffect(() => {
    (async () => {
      const {address, error, success} = await getCurrentWalletConnected();
      setMyAddress(address)

      if (!success || error) {
        console.log(error, success);
      }

      if (address === "") {
        const response = await connectWallet();
        setMyAddress(response.address);

        if (!response.success || response.error) {
          console.log(response.error, response.success);
        }
      }

      addWalletListener();
    })();
  }, []);

  const addWalletListener = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length > 0) {
          setMyAddress(accounts[0]);
        } else {
          setMyAddress("");
          console.log("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      console.log("You must install Metamask, a virtual Ethereum wallet, in your browser.");
    }
  }

  const submit = async () => {
    if (!myAddress || !contractAddress.trim().length || !address.trim().length) {
      alert("All fields are mandatory.")
      return;
    }

    if (!web3.utils.isAddress(contractAddress)) {
      alert("Contract address is not valid.")
      return;
    }

    if (!web3.utils.isAddress(myAddress)) {
      alert("Your wallet address is not valid.")
      return;
    }

    if (!web3.utils.isAddress(address)) {
      alert("New owner's address is not valid.")
      return;
    }

    setLoading(true);

    const { txHash, error, success } = await transfer(myAddress, address, tokenID, contractAddress, version);

    console.log("Transaction: ", txHash, error, success);

    setLoading(false);

    if (!success) {
      alert(error);
      return;
    }

    setTxHash(txHash);
  }

  return (
    <div className="App">
      <h1>OpenSea Polygon NFT transfer</h1>
      {!window.ethereum && <h2>Please install MetaMask.</h2>}
      <img src="address.png" height="250" />
      <div>
        <h3>Contract Version</h3>
        <select name="version" onChange={event => setVersion(event.target.value)} value={version}>
          <option value="1">1</option>
          <option value="2">2 (Latest)</option>
        </select>
        <h3>Token ID</h3>
        <input
          type="number"
          name="tokenID"
          min={0}
          value={tokenID}
          onChange={event => setTokenID(Number.parseInt(event.target.value, 10) || 0)}
        />
        <h3>Contract Address</h3>
        <input
          type="text"
          name="contractAddress"
          value={contractAddress}
          onChange={event => setContractAddress(event.target.value)}
          placeholder="0x..."
        />
        <h3>Your Wallet Address<br />(which you use on OpenSea and owns this "Token ID")</h3>
        <input
          type="text"
          name="myAddress"
          value={myAddress}
          disabled
        />
        <h3>New Owner's Wallet Address</h3>
        <input
          type="text"
          name="address"
          value={address}
          onChange={event => setAddress(event.target.value)}
          placeholder="0x..."
        />
        <br />
        {loading && <h3>Transferring...</h3>}
        {txHash && <h3><a href={`https://polygonscan.com/tx/${txHash}`} target="_blank">Open Transaction</a></h3>}
        <button onClick={submit}>Transfer</button>
      </div>
    </div>
  );
}

export default App;
