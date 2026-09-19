package com.voting.online_voting_system.controller;

import com.voting.online_voting_system.model.Vote;
import com.voting.online_voting_system.service.VoteService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/votes")
public class VoteController {

    private final VoteService voteService;

    public VoteController(VoteService voteService) {
        this.voteService = voteService;
    }

    @PostMapping
    public ResponseEntity<?> castVote(
            @RequestBody Vote vote,
            @RequestHeader(
                    value = "Authorization",
                    required = false
            )
            String authorizationHeader) {

        try {

            voteService.castVote(
                    vote,
                    authorizationHeader
            );

            return ResponseEntity.ok(
                    "Vote cast successfully"
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("/status/{electionId}")
    public ResponseEntity<?> getVoteStatus(
            @PathVariable Long electionId,
            @RequestHeader(
                    value = "Authorization",
                    required = false
            )
            String authorizationHeader) {

        try {

            boolean alreadyVoted =
                    voteService.hasAlreadyVoted(
                            electionId,
                            authorizationHeader
                    );

            return ResponseEntity.ok(alreadyVoted);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}