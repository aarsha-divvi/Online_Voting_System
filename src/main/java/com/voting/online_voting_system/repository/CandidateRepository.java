package com.voting.online_voting_system.repository;

import com.voting.online_voting_system.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CandidateRepository
        extends JpaRepository<Candidate, Long> {

    /*
     * Get all candidates belonging
     * to an election.
     */
    List<Candidate> findByElectionId(
            Long electionId
    );
}