// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Voting {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    address public official;
    uint256 public candidatesCount;
    mapping(uint256 => Candidate) public candidates;
    mapping(address => bool) public hasVoted;

    constructor() {
        official = msg.sender;
        // Pre-populate with our standard candidates automatically so it's ready out-of-the-box!
        addCandidate("Alice");
        addCandidate("Bob");
    }

    function addCandidate(string memory _name) public {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function vote(uint256 _candidateId) public {
        require(!hasVoted[msg.sender], "You have already voted.");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID.");

        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;
    }
}
