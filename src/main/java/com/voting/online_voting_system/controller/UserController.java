package com.voting.online_voting_system.controller;

import com.voting.online_voting_system.model.LoginRequest;
import com.voting.online_voting_system.model.LoginResponse;
import com.voting.online_voting_system.model.User;
import com.voting.online_voting_system.security.JwtService;
import com.voting.online_voting_system.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    public UserController(
            UserService userService,
            JwtService jwtService) {

        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody User user) {

        try {

            User savedUser =
                    userService.registerUser(user);

            /*
             * Never return the stored password hash
             * to the frontend.
             */
            savedUser.setPassword(null);

            return ResponseEntity.ok(savedUser);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Registration failed"
                    );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest loginRequest) {

        try {

            if (loginRequest == null) {

                return ResponseEntity
                        .status(401)
                        .body(
                                "Invalid voter ID or password"
                        );
            }

            User user =
                    userService.loginUser(
                            loginRequest.getVoterId(),
                            loginRequest.getPassword()
                    );

            String token =
                    jwtService.generateToken(
                            user.getVoterId(),
                            user.getRole()
                    );

            LoginResponse response =
                    new LoginResponse(
                            token,
                            user.getRole(),
                            user.getVoterId()
                    );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            /*
             * Do not reveal whether the voter ID
             * or password was incorrect.
             */
            return ResponseEntity
                    .status(401)
                    .body(
                            "Invalid voter ID or password"
                    );
        }
    }
}