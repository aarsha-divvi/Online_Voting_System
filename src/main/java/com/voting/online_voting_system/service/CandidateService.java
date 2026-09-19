package com.voting.online_voting_system.service;

import com.voting.online_voting_system.model.Candidate;
import com.voting.online_voting_system.model.Election;
import com.voting.online_voting_system.repository.CandidateRepository;
import com.voting.online_voting_system.repository.ElectionRepository;
import com.voting.online_voting_system.repository.VoteRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final ElectionRepository electionRepository;
    private final VoteRepository voteRepository;

    public CandidateService(
            CandidateRepository candidateRepository,
            ElectionRepository electionRepository,
            VoteRepository voteRepository) {

        this.candidateRepository = candidateRepository;
        this.electionRepository = electionRepository;
        this.voteRepository = voteRepository;
    }

    public Candidate createCandidate(
            String name,
            String party,
            Long electionId) {

        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException(
                    "Candidate name is required"
            );
        }

        if (party == null || party.trim().isEmpty()) {
            throw new RuntimeException(
                    "Party is required"
            );
        }

        if (electionId == null) {
            throw new RuntimeException(
                    "Election is required"
            );
        }

        Election election =
                electionRepository.findById(electionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Election not found"
                                ));

        if (election.isActive()) {
            throw new RuntimeException(
                    "Cannot add candidates while the election is active"
            );
        }

        long existingVotes =
                voteRepository.countByCandidate_Election_Id(
                        electionId
                );

        if (existingVotes > 0) {
            throw new RuntimeException(
                    "Cannot modify a completed election"
            );
        }

        Candidate candidate = new Candidate();

        candidate.setName(name.trim());
        candidate.setParty(party.trim());
        candidate.setElection(election);

        return candidateRepository.save(candidate);
    }

    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    public List<Candidate> getCandidatesByElection(
            Long electionId) {

        if (electionId == null) {
            throw new RuntimeException(
                    "Election ID is required"
            );
        }

        return candidateRepository.findByElectionId(
                electionId
        );
    }

    public Candidate updateCandidate(
            Long id,
            String name,
            String party) {

        if (id == null) {
            throw new RuntimeException(
                    "Candidate ID is required"
            );
        }

        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException(
                    "Candidate name is required"
            );
        }

        if (party == null || party.trim().isEmpty()) {
            throw new RuntimeException(
                    "Party is required"
            );
        }

        Candidate candidate =
                candidateRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Candidate not found"
                                ));

        if (candidate.getElection() == null ||
                candidate.getElection().getId() == null) {

            throw new RuntimeException(
                    "Candidate is not assigned to an election"
            );
        }

        Election election =
                candidate.getElection();

        if (election.isActive()) {
            throw new RuntimeException(
                    "Cannot modify candidates while the election is active"
            );
        }

        long voteCount =
                voteRepository.countByCandidate_Id(
                        candidate.getId()
                );

        if (voteCount > 0) {
            throw new RuntimeException(
                    "Cannot modify a candidate after votes have been recorded"
            );
        }

        long electionVoteCount =
                voteRepository.countByCandidate_Election_Id(
                        election.getId()
                );

        if (electionVoteCount > 0) {
            throw new RuntimeException(
                    "Cannot modify a completed election"
            );
        }

        candidate.setName(name.trim());
        candidate.setParty(party.trim());

        return candidateRepository.save(candidate);
    }

    @Transactional
    public void deleteCandidate(Long id) {

        if (id == null) {
            throw new RuntimeException(
                    "Candidate ID is required"
            );
        }

        Candidate candidate =
                candidateRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Candidate not found"
                                ));

        if (candidate.getElection() == null ||
                candidate.getElection().getId() == null) {

            throw new RuntimeException(
                    "Candidate is not assigned to an election"
            );
        }

        Election election =
                candidate.getElection();

        if (election.isActive()) {
            throw new RuntimeException(
                    "Cannot delete candidates while the election is active"
            );
        }

        long voteCount =
                voteRepository.countByCandidate_Id(
                        candidate.getId()
                );

        if (voteCount > 0) {
            throw new RuntimeException(
                    "Cannot delete a candidate after votes have been recorded"
            );
        }

        long electionVoteCount =
                voteRepository.countByCandidate_Election_Id(
                        election.getId()
                );

        if (electionVoteCount > 0) {
            throw new RuntimeException(
                    "Cannot modify a completed election"
            );
        }

        candidateRepository.delete(candidate);
    }
}