package com.voting.online_voting_system.repository;

import com.voting.online_voting_system.model.Election;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ElectionRepository
        extends JpaRepository<Election, Long> {
}