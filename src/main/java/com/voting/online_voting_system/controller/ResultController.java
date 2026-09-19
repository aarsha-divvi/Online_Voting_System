package com.voting.online_voting_system.controller;

import com.voting.online_voting_system.model.ResultResponse;
import com.voting.online_voting_system.service.ResultService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
public class ResultController {

    private final ResultService resultService;

    public ResultController(
            ResultService resultService) {

        this.resultService = resultService;
    }

    @GetMapping("/election/{electionId}")
    public ResponseEntity<?> getResults(
            @PathVariable Long electionId) {

        try {

            List<ResultResponse> results =
                    resultService.getResults(
                            electionId
                    );

            return ResponseEntity.ok(results);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}