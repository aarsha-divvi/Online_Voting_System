package com.voting.online_voting_system.model;

public class ResultResponse {

    private Long candidateId;
    private String candidateName;
    private String party;
    private long voteCount;

    public ResultResponse() {
    }

    public ResultResponse(
            Long candidateId,
            String candidateName,
            String party,
            long voteCount) {

        this.candidateId = candidateId;
        this.candidateName = candidateName;
        this.party = party;
        this.voteCount = voteCount;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public String getParty() {
        return party;
    }

    public long getVoteCount() {
        return voteCount;
    }
}