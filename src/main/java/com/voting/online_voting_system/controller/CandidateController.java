package com.voting.online_voting_system.controller;

import com.voting.online_voting_system.model.Candidate;
import com.voting.online_voting_system.service.CandidateService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(
            CandidateService candidateService) {

        this.candidateService = candidateService;
    }

    // =========================================================
    // CREATE CANDIDATE
    // =========================================================

    @PostMapping("/admin")
    public ResponseEntity<?> createCandidate(
            @RequestBody Candidate candidate) {

        try {

            if (candidate == null) {
                return ResponseEntity
                        .badRequest()
                        .body("Candidate details are required.");
            }

            if (candidate.getName() == null ||
                    candidate.getName().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Candidate name is required.");
            }

            if (candidate.getParty() == null ||
                    candidate.getParty().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Party name is required.");
            }

            if (candidate.getElection() == null ||
                    candidate.getElection().getId() == null) {

                return ResponseEntity
                        .badRequest()
                        .body("Election is required.");
            }

            Long electionId =
                    candidate.getElection().getId();

            Candidate savedCandidate =
                    candidateService.createCandidate(
                            candidate.getName().trim(),
                            candidate.getParty().trim(),
                            electionId
                    );

            return ResponseEntity.ok(savedCandidate);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to create candidate."
                    );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Server error while creating candidate."
                    );
        }
    }


    // =========================================================
    // GET ALL CANDIDATES
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Candidate>> getAllCandidates() {

        return ResponseEntity.ok(
                candidateService.getAllCandidates()
        );
    }


    // =========================================================
    // GET CANDIDATES BY ELECTION
    // =========================================================

    @GetMapping("/election/{electionId}")
    public ResponseEntity<List<Candidate>>
    getCandidatesByElection(
            @PathVariable Long electionId) {

        return ResponseEntity.ok(
                candidateService
                        .getCandidatesByElection(electionId)
        );
    }


    // =========================================================
    // UPDATE CANDIDATE
    // =========================================================

    @PutMapping("/admin/{id}")
    public ResponseEntity<?> updateCandidate(
            @PathVariable Long id,
            @RequestBody Candidate candidate) {

        try {

            if (candidate == null) {
                return ResponseEntity
                        .badRequest()
                        .body("Candidate details are required.");
            }

            if (candidate.getName() == null ||
                    candidate.getName().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Candidate name is required.");
            }

            if (candidate.getParty() == null ||
                    candidate.getParty().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Party name is required.");
            }

            Candidate updatedCandidate =
                    candidateService.updateCandidate(
                            id,
                            candidate.getName().trim(),
                            candidate.getParty().trim()
                    );

            return ResponseEntity.ok(updatedCandidate);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to update candidate."
                    );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Server error while updating candidate."
                    );
        }
    }


    // =========================================================
    // DELETE CANDIDATE
    // =========================================================

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteCandidate(
            @PathVariable Long id) {

        try {

            candidateService.deleteCandidate(id);

            return ResponseEntity.ok(
                    "Candidate deleted successfully."
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to delete candidate."
                    );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Server error while deleting candidate."
                    );
        }
    }
}