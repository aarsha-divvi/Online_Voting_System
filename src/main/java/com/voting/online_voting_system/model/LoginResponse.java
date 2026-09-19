package com.voting.online_voting_system.model;

public class LoginResponse {

    private String token;
    private String role;
    private String voterId;

    public LoginResponse() {
    }

    public LoginResponse(String token, String role, String voterId) {
        this.token = token;
        this.role = role;
        this.voterId = voterId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getVoterId() {
        return voterId;
    }

    public void setVoterId(String voterId) {
        this.voterId = voterId;
    }
}