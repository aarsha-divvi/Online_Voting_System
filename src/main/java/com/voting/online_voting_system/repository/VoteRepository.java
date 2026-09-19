package com.voting.online_voting_system.repository;

import com.voting.online_voting_system.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoteRepository
        extends JpaRepository<Vote, Long> {

    long countByCandidate_Election_Id(
            Long electionId
    );

    long countByCandidate_Id(
            Long candidateId
    );

    boolean existsByUser_IdAndElection_Id(
            Long userId,
            Long electionId
    );
}