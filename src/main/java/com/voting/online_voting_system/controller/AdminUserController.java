package com.voting.online_voting_system.controller;

import com.voting.online_voting_system.model.User;
import com.voting.online_voting_system.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(
            UserService userService) {

        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<?> createAdmin(
            @RequestBody User user) {

        try {

            User savedUser =
                    userService.createAdminUser(user);

            savedUser.setPassword(null);

            return ResponseEntity.ok(savedUser);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to create administrator."
                    );
        }
    }
}