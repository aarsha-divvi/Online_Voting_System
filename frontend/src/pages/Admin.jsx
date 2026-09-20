import React, { useState } from "react";
import API_URL from "../config/api";
import { useNavigate } from "react-router-dom";

import LanguageSelector from "../Components/LanguageSelector";

import {
    getLanguage,
    getTranslation
} from "../i18n";

import "../styles/login.css";

function Admin() {

    const navigate = useNavigate();

    const [language, setLanguage] =
        useState(getLanguage());

    const [voterId, setVoterId] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const t = (
        key,
        fallback = ""
    ) => {
        return (
            getTranslation(
                language,
                key
            ) ||
            fallback
        );
    };

    const changeLanguage = (
        value
    ) => {
        setLanguage(value);

        localStorage.setItem(
            "language",
            value
        );

        setError("");
    };

    const handleLogin = async (
        event
    ) => {

        event.preventDefault();

        setError("");

        if (!voterId.trim()) {

            setError(
                t(
                    "voterIdRequired",
                    "Please enter your Voter ID."
                )
            );

            return;
        }

        if (!password) {

            setError(
                t(
                    "passwordRequired",
                    "Please enter your password."
                )
            );

            return;
        }

        setLoading(true);

        try {

            const response =
                await fetch(
                    `${API_URL}/api/users/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            voterId:
                                voterId.trim(),

                            password:
                            password

                        })
                    }
                );

            const responseText =
                await response.text();

            let data;

            try {

                data =
                    responseText
                        ? JSON.parse(
                            responseText
                        )
                        : null;

            } catch {

                data =
                    responseText;
            }

            if (!response.ok) {

                setError(
                    typeof data === "string"
                        ? data
                        : t(
                            "loginFailed",
                            "Invalid Voter ID or password."
                        )
                );

                return;
            }

            if (!data?.token) {

                setError(
                    t(
                        "invalidServerResponse",
                        "Invalid response from server."
                    )
                );

                return;
            }

            const userRole =
                data.role
                    ? String(
                        data.role
                    )
                        .trim()
                        .toUpperCase()
                    : "";

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "role",
                userRole
            );

            localStorage.setItem(
                "voterId",
                data.voterId ||
                voterId.trim()
            );

            if (
                userRole === "ADMIN"
            ) {

                navigate(
                    "/admin",
                    {
                        replace: true
                    }
                );

            } else {

                navigate(
                    "/dashboard",
                    {
                        replace: true
                    }
                );
            }

        } catch (err) {

            console.error(
                "Login error:",
                err
            );

            setError(
                t(
                    "serverError",
                    "Unable to connect to the server."
                )
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="login-page">

            <div className="login-background">
            </div>

            <div className="language-area">

                <LanguageSelector
                    language={
                        language
                    }
                    onChange={
                        changeLanguage
                    }
                />

            </div>

            <div className="real-login-card">

                <div className="real-login-header">

                    <div>

                        <div className="login-label">

                            {t(
                                "voterPortal",
                                "VOTER PORTAL"
                            )}

                        </div>

                        <h1>

                            {t(
                                "welcome",
                                "Welcome"
                            )}

                        </h1>

                        <p>

                            {t(
                                "signInDescription",
                                "Sign in to access your election dashboard."
                            )}

                        </p>

                    </div>

                    <div className="login-arrow">
                        →
                    </div>

                </div>

                {error && (

                    <div className="login-error">

                        <span>
                            !
                        </span>

                        <div>
                            {error}
                        </div>

                    </div>

                )}

                <form
                    onSubmit={
                        handleLogin
                    }
                    className="real-login-form"
                >

                    <div className="real-input-group">

                        <label
                            className="login-field-label"
                        >

                            {t(
                                "voterId",
                                "Voter ID"
                            )}

                        </label>

                        <div className="real-input">

                            <span className="input-symbol">
                                ID
                            </span>

                            <input
                                type="text"
                                value={
                                    voterId
                                }
                                onChange={(
                                    event
                                ) =>
                                    setVoterId(
                                        event.target.value
                                    )
                                }
                                placeholder={t(
                                    "voterIdPlaceholder",
                                    "Enter your Voter ID"
                                )}
                                autoComplete="username"
                            />

                        </div>

                    </div>

                    <div className="real-input-group">

                        <label
                            className="login-field-label"
                        >

                            {t(
                                "password",
                                "Password"
                            )}

                        </label>

                        <div className="real-input">

                            <span className="input-symbol">
                                •••
                            </span>

                            <input
                                type="password"
                                value={
                                    password
                                }
                                onChange={(
                                    event
                                ) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                placeholder={t(
                                    "passwordPlaceholder",
                                    "Enter your password"
                                )}
                                autoComplete="current-password"
                            />

                        </div>

                    </div>

                    <div className="security-message">

                        <div className="security-check">
                            ✓
                        </div>

                        <div>

                            <strong>

                                {t(
                                    "secureSignIn",
                                    "Secure sign in"
                                )}

                            </strong>

                            <span>

                                {t(
                                    "credentialsProtected",
                                    "Your credentials are protected."
                                )}

                            </span>

                        </div>

                    </div>

                    <button
                        type="submit"
                        className="real-signin-button"
                        disabled={
                            loading
                        }
                    >

                        {loading ? (

                            <>

                                <span
                                    className="login-loader"
                                >
                                </span>

                                {t(
                                    "signingIn",
                                    "Signing in..."
                                )}

                            </>

                        ) : (

                            <>

                                {t(
                                    "signInSecurely",
                                    "Sign in securely"
                                )}

                                <span>
                                    →
                                </span>

                            </>

                        )}

                    </button>

                </form>

                <div className="real-register">

                    <span>

                        {t(
                            "noAccount",
                            "Don't have a voter account?"
                        )}

                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/register"
                            )
                        }
                    >

                        {t(
                            "register",
                            "Register as a voter"
                        )}

                        <span>
                            ↗
                        </span>

                    </button>

                </div>

                <div className="real-card-footer">

                    <span>
                        VOTE2026
                    </span>

                    <span>
                        •
                    </span>

                    <span>

                        {t(
                            "digitalElectionPlatform",
                            "DIGITAL ELECTION PLATFORM"
                        )}

                    </span>

                </div>

            </div>

        </div>
    );
}

export default Admin;