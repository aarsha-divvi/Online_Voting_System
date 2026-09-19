package com.voting.online_voting_system.controller;

import com.voting.online_voting_system.model.Election;
import com.voting.online_voting_system.service.ElectionService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/elections")
public class ElectionController {

    private final ElectionService electionService;

    public ElectionController(
            ElectionService electionService) {
        this.electionService = electionService;
    }

    @PostMapping("/admin")
    public ResponseEntity<?> createElection(
            @RequestBody Election election) {

        try {

            if (election == null) {
                return ResponseEntity.badRequest()
                        .body(
                                "Election details are required."
                        );
            }

            if (election.getTitle() == null ||
                    election.getTitle()
                            .trim()
                            .isEmpty()) {

                return ResponseEntity.badRequest()
                        .body(
                                "Election title is required."
                        );
            }

            if (election.getDescription() == null ||
                    election.getDescription()
                            .trim()
                            .isEmpty()) {

                return ResponseEntity.badRequest()
                        .body(
                                "Election description is required."
                        );
            }

            election.setTitle(
                    election.getTitle().trim()
            );

            election.setDescription(
                    election.getDescription().trim()
            );

            Election savedElection =
                    electionService.createElection(
                            election
                    );

            return ResponseEntity.ok(
                    savedElection
            );

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest()
                    .body(
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to create election."
                    );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body(
                            "Server error while creating election."
                    );
        }
    }

    @GetMapping
    public ResponseEntity<List<Election>> getAllElections() {

        return ResponseEntity.ok(
                electionService.getAllElections()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getElectionById(
            @PathVariable Long id) {

        try {

            return ResponseEntity.ok(
                    electionService.getElectionById(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity.notFound()
                    .build();
        }
    }

    @PutMapping("/admin/{id}/activate")
    public ResponseEntity<?> activateElection(
            @PathVariable Long id) {

        try {

            Election election =
                    electionService.activateElection(id);

            return ResponseEntity.ok(
                    election
            );

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest()
                    .body(
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to activate election."
                    );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body(
                            "Server error while activating election."
                    );
        }
    }

    @PutMapping("/admin/{id}/deactivate")
    public ResponseEntity<?> deactivateElection(
            @PathVariable Long id) {

        try {

            Election election =
                    electionService.deactivateElection(id);

            return ResponseEntity.ok(
                    election
            );

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest()
                    .body(
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to deactivate election."
                    );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body(
                            "Server error while deactivating election."
                    );
        }
    }
    @GetMapping("/admin/dashboard")
    public ResponseEntity<?> getDashboardElections() {

        try {

            return ResponseEntity.ok(
                    electionService.getDashboardElections()
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to load dashboard elections."
                    );
        }
    }
    @GetMapping("/admin/history")
    public ResponseEntity<?> getElectionHistory() {

        try {

            return ResponseEntity.ok(
                    electionService.getElectionHistory()
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to load election history."
                    );
        }
    }
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteElection(
            @PathVariable Long id) {

        try {

            electionService.deleteElection(id);

            return ResponseEntity.ok(
                    "Election deleted successfully."
            );

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest()
                    .body(
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to delete election."
                    );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body(
                            "Server error while deleting election."
                    );
        }
    }
}