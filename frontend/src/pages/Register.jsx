import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import "../styles/Register.css";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        department: "",
        year: "",
        voterId: "",
        password: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
        setSuccess("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.fullName.trim()) {
            setError("Please enter your full name.");
            return;
        }

        if (!formData.email.trim()) {
            setError("Please enter your email.");
            return;
        }

        if (!formData.department.trim()) {
            setError("Please enter your department.");
            return;
        }

        if (!formData.year) {
            setError("Please select your year.");
            return;
        }

        if (!formData.voterId.trim()) {
            setError("Please enter your Voter ID.");
            return;
        }

        if (!formData.password) {
            setError("Please create a password.");
            return;
        }

        if (formData.password.length < 6) {
            setError(
                "Password must contain at least 6 characters."
            );
            return;
        }

        if (!formData.confirmPassword) {
            setError(
                "Please confirm your password."
            );
            return;
        }

        if (
            formData.password !==
            formData.confirmPassword
        ) {
            setError(
                "Passwords do not match."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/users/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        fullName:
                            formData.fullName.trim(),
                        email:
                            formData.email.trim(),
                        department:
                            formData.department.trim(),
                        year:
                            Number(formData.year),
                        voterId:
                            formData.voterId.trim(),
                        password:
                        formData.password
                    })
                }
            );

            const text =
                await response.text();

            let data;

            try {
                data = JSON.parse(text);
            } catch {
                data = text;
            }

            if (!response.ok) {
                setError(
                    typeof data === "string"
                        ? data
                        : "Registration failed. Please try again."
                );

                return;
            }

            setSuccess(
                "Registration successful! Redirecting to login..."
            );

            setFormData({
                fullName: "",
                email: "",
                department: "",
                year: "",
                voterId: "",
                password: "",
                confirmPassword: ""
            });

            setTimeout(() => {
                navigate("/");
            }, 1500);
        } catch (error) {
            console.error(error);

            setError(
                "Unable to connect to the server."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-background">
                <div className="background-vote-sign">
                    <span>
                        YOUR
                    </span>

                    <strong>
                        VOTE
                    </strong>

                    <span>
                        MATTERS
                    </span>
                </div>

                <div className="background-queue">
                    <div className="person person-one">
                        <div className="person-head"></div>
                        <div className="person-body"></div>
                        <div className="person-legs"></div>
                    </div>

                    <div className="person person-two">
                        <div className="person-head"></div>
                        <div className="person-body"></div>
                        <div className="person-legs"></div>
                    </div>

                    <div className="person person-three">
                        <div className="person-head"></div>
                        <div className="person-body"></div>
                        <div className="person-legs"></div>
                    </div>

                    <div className="person person-four">
                        <div className="person-head"></div>
                        <div className="person-body"></div>
                        <div className="person-legs"></div>
                    </div>

                    <div className="person person-five">
                        <div className="person-head"></div>
                        <div className="person-body"></div>
                        <div className="person-legs"></div>
                    </div>

                    <div className="person person-six">
                        <div className="person-head"></div>
                        <div className="person-body"></div>
                        <div className="person-legs"></div>
                    </div>

                    <div className="person person-seven">
                        <div className="person-head"></div>
                        <div className="person-body"></div>
                        <div className="person-legs"></div>
                    </div>
                </div>

                <div className="background-booth">
                    <div className="booth-top">
                        VOTING
                    </div>

                    <div className="booth-check">
                        ✓
                    </div>

                    <div className="booth-text">
                        CAST<br />
                        YOUR<br />
                        VOTE
                    </div>
                </div>
            </div>

            <header className="register-header">
                <div
                    className="register-logo"
                    onClick={() => navigate("/")}
                >
                    <div className="register-logo-mark">
                        V
                    </div>

                    <div className="register-logo-text">
                        <strong>
                            VOTE<span>2026</span>
                        </strong>

                        <small>
                            ONLINE ELECTION SYSTEM
                        </small>
                    </div>
                </div>

                <button
                    type="button"
                    className="back-login-button"
                    onClick={() => navigate("/")}
                >
                    ← Back to Login
                </button>
            </header>

            <main className="register-main">
                <section className="register-info">
                    <span className="register-label">
                        VOTER REGISTRATION
                    </span>

                    <h1>
                        Create your
                        <br />
                        <span>
                            voter account.
                        </span>
                    </h1>

                    <p>
                        Register securely to participate in
                        online elections and make your voice count.
                    </p>

                    <div className="registration-points">
                        <div className="registration-point">
                            <div>
                                01
                            </div>

                            <span>
                                Complete your voter information
                            </span>
                        </div>

                        <div className="registration-point">
                            <div>
                                02
                            </div>

                            <span>
                                Create your secure login credentials
                            </span>
                        </div>

                        <div className="registration-point">
                            <div>
                                03
                            </div>

                            <span>
                                Sign in and participate in elections
                            </span>
                        </div>
                    </div>
                </section>

                <section className="register-card">
                    <div className="register-card-header">
                        <span>
                            NEW VOTER
                        </span>

                        <h2>
                            Register
                        </h2>

                        <p>
                            Enter your details to create your account.
                        </p>
                    </div>

                    {error && (
                        <div className="register-message register-error">
                            <span>
                                !
                            </span>

                            <p>
                                {error}
                            </p>
                        </div>
                    )}

                    {success && (
                        <div className="register-message register-success">
                            <span>
                                ✓
                            </span>

                            <p>
                                {success}
                            </p>
                        </div>
                    )}

                    <form
                        className="register-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="register-field">
                            <label htmlFor="fullName">
                                Full Name
                            </label>

                            <input
                                id="fullName"
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                autoComplete="name"
                            />
                        </div>

                        <div className="register-field">
                            <label htmlFor="email">
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                autoComplete="email"
                            />
                        </div>

                        <div className="register-field">
                            <label htmlFor="department">
                                Department
                            </label>

                            <input
                                id="department"
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                placeholder="Enter your department"
                            />
                        </div>

                        <div className="register-field">
                            <label htmlFor="year">
                                Year
                            </label>

                            <select
                                id="year"
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Select your year
                                </option>

                                <option value="1">
                                    1st Year
                                </option>

                                <option value="2">
                                    2nd Year
                                </option>

                                <option value="3">
                                    3rd Year
                                </option>

                                <option value="4">
                                    4th Year
                                </option>
                            </select>
                        </div>

                        <div className="register-field">
                            <label htmlFor="voterId">
                                Voter ID
                            </label>

                            <input
                                id="voterId"
                                type="text"
                                name="voterId"
                                value={formData.voterId}
                                onChange={handleChange}
                                placeholder="Enter your voter ID"
                                autoComplete="username"
                            />
                        </div>

                        <div className="register-field">
                            <label htmlFor="password">
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="register-field">
                            <label htmlFor="confirmPassword">
                                Confirm Password
                            </label>

                            <input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="register-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating account..."
                                : "Register"}

                            {!loading && (
                                <span>
                                    →
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="register-login-link">
                        <span>
                            Already have an account?
                        </span>

                        <button
                            type="button"
                            onClick={() => navigate("/")}
                        >
                            Sign in
                        </button>
                    </div>
                </section>
            </main>

            <footer className="register-footer">
                <span>
                    © 2026 Online Voting System
                </span>

                <span>
                    Democracy begins with participation.
                </span>
            </footer>
        </div>
    );
}

export default Register;