package com.voting.online_voting_system.security;

import com.voting.online_voting_system.model.User;
import com.voting.online_voting_system.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository) {

        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authorizationHeader =
                request.getHeader("Authorization");

        if (authorizationHeader == null ||
                !authorizationHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        String token =
                authorizationHeader.substring(7);

        try {

            String voterId =
                    jwtService.extractVoterId(token);

            if (voterId == null ||
                    voterId.isBlank()) {

                filterChain.doFilter(request, response);
                return;
            }

            if (!jwtService.isTokenValid(
                    token,
                    voterId)) {

                filterChain.doFilter(request, response);
                return;
            }

            User user =
                    userRepository
                            .findByVoterId(voterId)
                            .orElse(null);

            if (user == null) {

                filterChain.doFilter(request, response);
                return;
            }

            String role = user.getRole();

            if (role == null ||
                    role.isBlank()) {

                role = "VOTER";
            }

            role = role.trim().toUpperCase();

            String authority;

            if (role.startsWith("ROLE_")) {
                authority = role;
            } else {
                authority = "ROLE_" + role;
            }

            System.out.println(
                    "JWT AUTH - voterId: " +
                            voterId
            );

            System.out.println(
                    "JWT AUTH - database role: " +
                            user.getRole()
            );

            System.out.println(
                    "JWT AUTH - authority: " +
                            authority
            );

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            voterId,
                            null,
                            List.of(
                                    new SimpleGrantedAuthority(
                                            authority
                                    )
                            )
                    );

            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request)
            );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(
                            authentication
                    );

        } catch (Exception e) {

            e.printStackTrace();

            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}