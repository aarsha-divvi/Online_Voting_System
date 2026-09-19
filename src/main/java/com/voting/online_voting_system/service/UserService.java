package com.voting.online_voting_system.service;

import com.voting.online_voting_system.model.User;
import com.voting.online_voting_system.repository.UserRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }


    /*
     * =========================================================
     * NORMAL VOTER REGISTRATION
     * =========================================================
     */

    public User registerUser(User user) {

        if (user == null) {
            throw new RuntimeException(
                    "Registration details are required."
            );
        }

        if (user.getFullName() == null ||
                user.getFullName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Full name is required."
            );
        }

        if (user.getEmail() == null ||
                user.getEmail().trim().isEmpty()) {

            throw new RuntimeException(
                    "Email is required."
            );
        }

        if (user.getVoterId() == null ||
                user.getVoterId().trim().isEmpty()) {

            throw new RuntimeException(
                    "Voter ID is required."
            );
        }

        if (user.getPassword() == null ||
                user.getPassword().isEmpty()) {

            throw new RuntimeException(
                    "Password is required."
            );
        }


        String email =
                user.getEmail()
                        .trim()
                        .toLowerCase();

        String voterId =
                user.getVoterId()
                        .trim();


        /*
         * Check duplicate email
         */

        if (userRepository
                .findByEmail(email)
                .isPresent()) {

            throw new RuntimeException(
                    "Email already registered. Please use another email."
            );
        }


        /*
         * Check duplicate voter ID
         */

        if (userRepository
                .findByVoterId(voterId)
                .isPresent()) {

            throw new RuntimeException(
                    "Voter ID already registered. Please use another Voter ID."
            );
        }


        /*
         * Clean values
         */

        user.setFullName(
                user.getFullName().trim()
        );

        user.setEmail(email);

        user.setVoterId(voterId);


        /*
         * PUBLIC REGISTRATION = VOTER
         *
         * A user cannot create an admin account
         * through the public registration page.
         */

        user.setRole("VOTER");


        /*
         * Encrypt password
         */

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );


        try {

            return userRepository.save(user);

        } catch (DataIntegrityViolationException e) {

            String databaseMessage =
                    e.getMostSpecificCause() != null
                            ? e.getMostSpecificCause()
                            .getMessage()
                            : "";

            if (databaseMessage != null &&
                    databaseMessage
                            .toLowerCase()
                            .contains("email")) {

                throw new RuntimeException(
                        "Email already registered. Please use another email."
                );
            }

            if (databaseMessage != null &&
                    databaseMessage
                            .toLowerCase()
                            .contains("voter")) {

                throw new RuntimeException(
                        "Voter ID already registered. Please use another Voter ID."
                );
            }

            throw new RuntimeException(
                    "Registration could not be completed."
            );
        }
    }


    /*
     * =========================================================
     * VOTER / ADMIN LOGIN
     * =========================================================
     */

    public User loginUser(
            String voterId,
            String password) {

        if (voterId == null ||
                voterId.trim().isEmpty()) {

            throw new RuntimeException(
                    "Invalid voter ID or password"
            );
        }

        if (password == null ||
                password.isEmpty()) {

            throw new RuntimeException(
                    "Invalid voter ID or password"
            );
        }


        String cleanVoterId =
                voterId.trim();


        User user =
                userRepository
                        .findByVoterId(cleanVoterId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid voter ID or password"
                                ));


        if (user.getPassword() == null ||
                user.getPassword().isBlank()) {

            throw new RuntimeException(
                    "Invalid voter ID or password"
            );
        }


        boolean passwordMatches =
                passwordEncoder.matches(
                        password,
                        user.getPassword()
                );


        if (!passwordMatches) {

            throw new RuntimeException(
                    "Invalid voter ID or password"
            );
        }


        return user;
    }


    /*
     * =========================================================
     * CREATE NEW ADMIN
     *
     * This method is called only from the
     * admin-only endpoint.
     * =========================================================
     */

    public User createAdminUser(User user) {

        if (user == null) {

            throw new RuntimeException(
                    "Administrator details are required."
            );
        }

        if (user.getFullName() == null ||
                user.getFullName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Full name is required."
            );
        }

        if (user.getEmail() == null ||
                user.getEmail().trim().isEmpty()) {

            throw new RuntimeException(
                    "Email is required."
            );
        }

        if (user.getVoterId() == null ||
                user.getVoterId().trim().isEmpty()) {

            throw new RuntimeException(
                    "Admin ID is required."
            );
        }

        if (user.getPassword() == null ||
                user.getPassword().isEmpty()) {

            throw new RuntimeException(
                    "Password is required."
            );
        }


        String email =
                user.getEmail()
                        .trim()
                        .toLowerCase();

        String adminId =
                user.getVoterId()
                        .trim();


        /*
         * Check duplicate email
         */

        if (userRepository
                .findByEmail(email)
                .isPresent()) {

            throw new RuntimeException(
                    "Email already registered. Please use another email."
            );
        }


        /*
         * Check duplicate admin ID
         */

        if (userRepository
                .findByVoterId(adminId)
                .isPresent()) {

            throw new RuntimeException(
                    "Admin ID already registered. Please use another ID."
            );
        }


        user.setFullName(
                user.getFullName().trim()
        );

        user.setEmail(email);

        user.setVoterId(adminId);


        /*
         * IMPORTANT:
         *
         * Ignore any role sent by the frontend.
         * This method always creates ADMIN.
         */

        user.setRole("ADMIN");


        /*
         * Encrypt admin password
         */

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );


        try {

            return userRepository.save(user);

        } catch (DataIntegrityViolationException e) {

            throw new RuntimeException(
                    "Administrator could not be created. Email or Admin ID may already exist."
            );
        }
    }
}