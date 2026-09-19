package com.voting.online_voting_system.model;

public class LoginRequest {

    private String voterId;
    private String password;

    public LoginRequest() {
    }

    public String getVoterId() {
        return voterId;
    }

    public void setVoterId(String voterId) {
        this.voterId = voterId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}