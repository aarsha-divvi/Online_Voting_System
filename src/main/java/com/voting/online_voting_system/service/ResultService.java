package com.voting.online_voting_system.service;

import com.voting.online_voting_system.model.Candidate;
import com.voting.online_voting_system.model.Election;
import com.voting.online_voting_system.model.ResultResponse;
import com.voting.online_voting_system.repository.CandidateRepository;
import com.voting.online_voting_system.repository.ElectionRepository;
import com.voting.online_voting_system.repository.VoteRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ResultService {

    private final CandidateRepository candidateRepository;
    private final ElectionRepository electionRepository;
    private final VoteRepository voteRepository;

    public ResultService(
            CandidateRepository candidateRepository,
            ElectionRepository electionRepository,
            VoteRepository voteRepository) {

        this.candidateRepository = candidateRepository;
        this.electionRepository = electionRepository;
        this.voteRepository = voteRepository;
    }

    public List<ResultResponse> getResults(
            Long electionId) {

        if (electionId == null) {
            throw new RuntimeException(
                    "Election ID is required"
            );
        }

        Election election =
                electionRepository.findById(electionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Election not found"
                                ));

        List<Candidate> candidates =
                candidateRepository.findByElectionId(
                        electionId
                );

        List<ResultResponse> results =
                new ArrayList<>();

        for (Candidate candidate : candidates) {

            long voteCount =
                    voteRepository.countByCandidate_Id(
                            candidate.getId()
                    );

            results.add(
                    new ResultResponse(
                            candidate.getId(),
                            candidate.getName(),
                            candidate.getParty(),
                            voteCount
                    )
            );
        }

        return results;
    }
}