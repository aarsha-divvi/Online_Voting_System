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
public class ElectionService {

    private final ElectionRepository electionRepository;
    private final CandidateRepository candidateRepository;
    private final VoteRepository voteRepository;

    public ElectionService(
            ElectionRepository electionRepository,
            CandidateRepository candidateRepository,
            VoteRepository voteRepository
    ) {
        this.electionRepository = electionRepository;
        this.candidateRepository = candidateRepository;
        this.voteRepository = voteRepository;
    }

    /*
     * ==========================================
     * CREATE ELECTION
     * ==========================================
     */

    public Election createElection(Election election) {

        if (election == null) {
            throw new RuntimeException(
                    "Election data is required"
            );
        }

        if (
                election.getTitle() == null ||
                        election.getTitle().trim().isEmpty()
        ) {
            throw new RuntimeException(
                    "Election title is required"
            );
        }

        if (
                election.getDescription() == null ||
                        election.getDescription().trim().isEmpty()
        ) {
            throw new RuntimeException(
                    "Election description is required"
            );
        }

        election.setTitle(
                election.getTitle().trim()
        );

        election.setDescription(
                election.getDescription().trim()
        );

        /*
         * Newly created elections are inactive.
         */
        election.setActive(false);

        return electionRepository.save(election);
    }

    /*
     * ==========================================
     * GET ALL ELECTIONS
     * ==========================================
     */

    public List<Election> getAllElections() {

        return electionRepository.findAll();
    }

    /*
     * ==========================================
     * GET ELECTION BY ID
     * ==========================================
     */

    public Election getElectionById(Long id) {

        if (id == null) {
            throw new RuntimeException(
                    "Election ID is required"
            );
        }

        return electionRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Election not found"
                        )
                );
    }

    /*
     * ==========================================
     * DELETE ELECTION
     * ==========================================
     *
     * Rules:
     *
     * 1. Active election cannot be deleted.
     *
     * 2. Inactive election with votes
     *    cannot be deleted.
     *
     * 3. Inactive election with zero votes
     *    can be deleted.
     *
     * Candidates are deleted first.
     */

    @Transactional
    public void deleteElection(Long electionId) {

        if (electionId == null) {

            throw new RuntimeException(
                    "Election ID is required"
            );
        }

        /*
         * Find election.
         */

        Election election =
                electionRepository.findById(electionId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Election not found."
                                )
                        );

        /*
         * Active elections cannot be deleted.
         */

        if (election.isActive()) {

            throw new RuntimeException(
                    "Active elections cannot be deleted. " +
                            "Deactivate the election first."
            );
        }

        /*
         * Count votes belonging to this election.
         *
         * Vote -> Candidate -> Election -> id
         */

        long voteCount =
                voteRepository
                        .countByCandidate_Election_Id(
                                electionId
                        );

        /*
         * Do not delete elections
         * that already contain votes.
         */

        if (voteCount > 0) {

            throw new RuntimeException(
                    "This election cannot be deleted because " +
                            "votes have already been recorded."
            );
        }

        /*
         * Find all candidates belonging
         * to this election.
         */

        List<Candidate> candidates =
                candidateRepository.findByElectionId(
                        electionId
                );

        /*
         * Delete candidates first.
         */

        if (
                candidates != null &&
                        !candidates.isEmpty()
        ) {

            candidateRepository.deleteAll(
                    candidates
            );

            candidateRepository.flush();
        }

        /*
         * Delete election.
         */

        electionRepository.delete(
                election
        );

        electionRepository.flush();
    }

    /*
     * ==========================================
     * ACTIVATE ELECTION
     * ==========================================
     */

    public Election activateElection(Long id) {

        if (id == null) {

            throw new RuntimeException(
                    "Election ID is required"
            );
        }

        Election election =
                electionRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Election not found"
                                )
                        );

        /*
         * Check current status.
         */

        if (election.isActive()) {

            throw new RuntimeException(
                    "Election is already active"
            );
        }

        /*
         * Once an election has votes,
         * it cannot be activated again.
         */

        long existingVotes =
                voteRepository
                        .countByCandidate_Election_Id(
                                id
                        );

        if (existingVotes > 0) {

            throw new RuntimeException(
                    "Cannot reactivate a completed election"
            );
        }

        /*
         * Election must have candidates.
         */

        long candidateCount =
                candidateRepository
                        .findByElectionId(id)
                        .size();

        if (candidateCount == 0) {

            throw new RuntimeException(
                    "Cannot activate election without candidates"
            );
        }

        /*
         * Only one election may be active
         * at a time.
         */

        List<Election> elections =
                electionRepository.findAll();

        boolean anotherActiveElection =
                elections.stream()
                        .anyMatch(
                                existing ->
                                        existing.isActive()
                                                &&
                                                !existing
                                                        .getId()
                                                        .equals(id)
                        );

        if (anotherActiveElection) {

            throw new RuntimeException(
                    "Another election is already active. " +
                            "Deactivate it before starting a new election."
            );
        }

        /*
         * Activate election.
         */

        election.setActive(true);

        return electionRepository.save(
                election
        );
    }

    /*
     * ==========================================
     * DEACTIVATE ELECTION
     * ==========================================
     */
    public List<Election> getDashboardElections() {

        List<Election> allElections =
                electionRepository.findAll();

        return allElections.stream()
                .filter(election -> {

                    // Active elections stay on dashboard
                    if (election.isActive()) {
                        return true;
                    }

                    // Inactive elections with no votes
                    // are still drafts and stay on dashboard
                    long voteCount =
                            voteRepository
                                    .countByCandidate_Election_Id(
                                            election.getId()
                                    );

                    return voteCount == 0;
                })
                .toList();
    }
    public List<Election> getElectionHistory() {

        List<Election> allElections =
                electionRepository.findAll();

        return allElections.stream()
                .filter(election -> {

                    // Only inactive elections can be completed
                    if (election.isActive()) {
                        return false;
                    }

                    long voteCount =
                            voteRepository
                                    .countByCandidate_Election_Id(
                                            election.getId()
                                    );

                    // Inactive + votes = completed
                    return voteCount > 0;
                })
                .toList();
    }
    public Election deactivateElection(Long id) {

        if (id == null) {

            throw new RuntimeException(
                    "Election ID is required"
            );
        }

        Election election =
                electionRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Election not found"
                                )
                        );

        /*
         * Check current status.
         */

        if (!election.isActive()) {

            throw new RuntimeException(
                    "Election is already inactive"
            );
        }

        /*
         * Deactivate election.
         */

        election.setActive(false);

        return electionRepository.save(
                election
        );
    }
}