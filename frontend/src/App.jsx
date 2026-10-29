import { useState, useEffect } from "react";
import { ethers } from "ethers";

// 1. PASTE YOUR DEPLOYED CONTRACT ADDRESS HERE
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const CONTRACT_ABI = [
  "function vote(uint256 _candidateId) public",
  "function candidatesCount() public view returns (uint256)",
  "function candidates(uint256) public view returns (uint256 id, string name, uint256 voteCount)",
  "function hasVoted(address) public view returns (bool)"
];

function App() {
  const [account, setAccount] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [votedStatus, setVotedStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  async function connectWallet() {
    if (!window.ethereum) return alert("Please install MetaMask!");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      await loadBallotData(accounts[0]);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadBallotData(userAddress) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const hasVoted = await contract.hasVoted(userAddress);
      setVotedStatus(hasVoted);

      const count = await contract.candidatesCount();
      const loadedCandidates = [];
      for (let i = 1; i <= Number(count); i++) {
        const c = await contract.candidates(i);
        loadedCandidates.push({ id: Number(c[0]), name: c[1], votes: Number(c[2]) });
      }
      setCandidates(loadedCandidates);
    } catch (err) {
      console.error(err);
    }
  }

  async function castVote(id) {
    if (!account) return;
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.vote(id);
      await tx.wait();
      
      alert("Vote securely recorded on-chain!");
      await loadBallotData(account);
    } catch (err) {
      alert(err.reason || "Transaction failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: "#0f172a", color: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", background: "#1e293b", padding: "2rem", borderRadius: "1rem" }}>
        <h1 style={{ color: "#38bdf8" }}>Secure Citizen Ballot</h1>
        {!account ? (
          <button onClick={connectWallet} style={{ padding: "0.75rem 1.5rem", background: "#0284c7", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "bold" }}>
            Connect Wallet
          </button>
        ) : (
          <p style={{ color: "#4ade80" }}>Connected Wallet: {account.substring(0,6)}...{account.substring(38)}</p>
        )}

        <h2 style={{ marginTop: "2rem" }}>Candidates</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
          {candidates.map((c) => (
            <div key={c.id} style={{ background: "#334155", padding: "1.5rem", borderRadius: "0.75rem" }}>
              <h3>{c.name}</h3>
              <p>Votes: {c.votes}</p>
              <button disabled={votedStatus || loading || !account} onClick={() => castVote(c.id)} style={{ marginTop: "1rem", width: "100%", padding: "0.5rem", background: votedStatus ? "#475569" : "#10b981", color: "white", border: "none", borderRadius: "0.25rem", cursor: "pointer" }}>
                {votedStatus ? "Ballot Locked" : "Cast Vote"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
