package com.voting.online_voting_system.repository;

import com.voting.online_voting_system.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResultRepository extends JpaRepository<Vote, Long> {

    List<Vote> findByCandidateElectionId(Long electionId);
}