package com.voting.online_voting_system.service;

import com.voting.online_voting_system.model.Candidate;
import com.voting.online_voting_system.model.User;
import com.voting.online_voting_system.model.Vote;
import com.voting.online_voting_system.repository.CandidateRepository;
import com.voting.online_voting_system.repository.UserRepository;
import com.voting.online_voting_system.repository.VoteRepository;
import com.voting.online_voting_system.security.JwtService;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
public class VoteService {

    private final VoteRepository voteRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final CandidateRepository candidateRepository;

    public VoteService(
            VoteRepository voteRepository,
            UserRepository userRepository,
            JwtService jwtService,
            CandidateRepository candidateRepository) {

        this.voteRepository = voteRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.candidateRepository = candidateRepository;
    }

    public Vote castVote(
            Vote vote,
            String authorizationHeader) {

        if (authorizationHeader == null ||
                !authorizationHeader.startsWith("Bearer ")) {

            throw new RuntimeException(
                    "Missing or invalid Authorization token"
            );
        }

        String token =
                authorizationHeader.substring(7);

        String voterId;

        try {

            voterId =
                    jwtService.extractVoterId(token);

            if (voterId == null ||
                    !jwtService.isTokenValid(
                            token,
                            voterId
                    )) {

                throw new RuntimeException(
                        "Invalid or expired token"
                );
            }

        } catch (Exception e) {

            throw new RuntimeException(
                    "Invalid or expired token"
            );
        }

        User user =
                userRepository
                        .findByVoterId(voterId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                ));

        if (!"VOTER".equalsIgnoreCase(
                user.getRole()
        )) {

            throw new RuntimeException(
                    "Administrators cannot vote"
            );
        }

        if (vote == null) {

            throw new RuntimeException(
                    "Vote data is required"
            );
        }

        if (vote.getCandidate() == null ||
                vote.getCandidate().getId() == null) {

            throw new RuntimeException(
                    "Candidate is required"
            );
        }

        Long candidateId =
                vote.getCandidate().getId();

        Candidate candidate =
                candidateRepository
                        .findById(candidateId)
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

        Long electionId =
                candidate.getElection().getId();

        if (!candidate.getElection().isActive()) {

            throw new RuntimeException(
                    "Voting is closed for this election"
            );
        }

        boolean alreadyVoted =
                voteRepository
                        .existsByUser_IdAndElection_Id(
                                user.getId(),
                                electionId
                        );

        if (alreadyVoted) {

            throw new RuntimeException(
                    "You have already voted in this election"
            );
        }

        vote.setUser(user);
        vote.setCandidate(candidate);
        vote.setElection(candidate.getElection());

        try {

            return voteRepository.save(vote);

        } catch (DataIntegrityViolationException e) {

            throw new RuntimeException(
                    "You have already voted in this election"
            );
        }
    }

    public boolean hasAlreadyVoted(
            Long electionId,
            String authorizationHeader) {

        if (authorizationHeader == null ||
                !authorizationHeader.startsWith("Bearer ")) {

            throw new RuntimeException(
                    "Missing or invalid Authorization token"
            );
        }

        if (electionId == null) {

            throw new RuntimeException(
                    "Election ID is required"
            );
        }

        String token =
                authorizationHeader.substring(7);

        String voterId;

        try {

            voterId =
                    jwtService.extractVoterId(token);

            if (voterId == null ||
                    !jwtService.isTokenValid(
                            token,
                            voterId
                    )) {

                throw new RuntimeException(
                        "Invalid or expired token"
                );
            }

        } catch (Exception e) {

            throw new RuntimeException(
                    "Invalid or expired token"
            );
        }

        User user =
                userRepository
                        .findByVoterId(voterId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                ));

        return voteRepository
                .existsByUser_IdAndElection_Id(
                        user.getId(),
                        electionId
                );
    }
}