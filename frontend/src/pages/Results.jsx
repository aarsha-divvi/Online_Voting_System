import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/results.css";

function Results() {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const [elections, setElections] =
        useState([]);

    const [selectedElection, setSelectedElection] =
        useState("");

    const [results, setResults] =
        useState([]);

    const [loadingElections, setLoadingElections] =
        useState(true);

    const [loadingResults, setLoadingResults] =
        useState(false);

    const [error, setError] =
        useState("");

    const [lastUpdated, setLastUpdated] =
        useState(null);

    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }

        loadElections();
    }, []);

    const loadElections = async () => {
        try {
            setLoadingElections(true);
            setError("");

            const response = await fetch(
                "http://localhost:8080/api/elections",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
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
                throw new Error(
                    typeof data === "string"
                        ? data
                        : "Unable to load elections."
                );
            }

            const electionList =
                Array.isArray(data)
                    ? data
                    : [];

            setElections(
                electionList
            );

            const activeElection =
                electionList.find(
                    election =>
                        election.active === true
                );

            if (activeElection) {
                const id =
                    String(activeElection.id);

                setSelectedElection(id);

                await loadResults(
                    activeElection.id
                );
            } else if (
                electionList.length > 0
            ) {
                const first =
                    electionList[0];

                const id =
                    String(first.id);

                setSelectedElection(id);

                await loadResults(
                    first.id
                );
            }
        } catch (error) {
            console.error(error);

            setError(
                error.message ||
                "Unable to load elections."
            );
        } finally {
            setLoadingElections(false);
        }
    };

    const loadResults = async (
        electionId
    ) => {
        if (!electionId) {
            setResults([]);
            return;
        }

        try {
            setLoadingResults(true);
            setError("");

            const response = await fetch(
                `http://localhost:8080/api/results/election/${electionId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
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
                throw new Error(
                    typeof data === "string"
                        ? data
                        : "Unable to load results."
                );
            }

            const sortedResults =
                Array.isArray(data)
                    ? [...data].sort(
                        (a, b) =>
                            Number(
                                b.voteCount || 0
                            ) -
                            Number(
                                a.voteCount || 0
                            )
                    )
                    : [];

            setResults(
                sortedResults
            );

            setLastUpdated(
                new Date()
            );
        } catch (error) {
            console.error(error);

            setError(
                error.message ||
                "Unable to load results."
            );

            setResults([]);
        } finally {
            setLoadingResults(false);
        }
    };

    const handleElectionChange = (
        event
    ) => {
        const electionId =
            event.target.value;

        setSelectedElection(
            electionId
        );

        loadResults(
            electionId
        );
    };

    const refreshResults = () => {
        if (!selectedElection) {
            return;
        }

        loadResults(
            selectedElection
        );
    };

    const logout = () => {
        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "role"
        );

        localStorage.removeItem(
            "voterId"
        );

        navigate("/");
    };

    const currentElection =
        elections.find(
            election =>
                String(election.id) ===
                String(selectedElection)
        );

    const totalVotes =
        results.reduce(
            (total, result) =>
                total +
                Number(
                    result.voteCount || 0
                ),
            0
        );

    const highestVotes =
        results.length > 0
            ? Math.max(
                ...results.map(
                    result =>
                        Number(
                            result.voteCount || 0
                        )
                )
            )
            : 0;

    const leaders =
        totalVotes > 0
            ? results.filter(
                result =>
                    Number(
                        result.voteCount || 0
                    ) === highestVotes
            )
            : [];

    const leaderNames =
        leaders
            .map(
                result =>
                    result.candidateName
            )
            .join(" & ");

    return (
        <div className="results-page">
            <div className="results-background-shape shape-one"></div>

            <div className="results-background-shape shape-two"></div>

            <header className="results-header">
                <div
                    className="results-brand"
                    onClick={() =>
                        role === "ADMIN"
                            ? navigate("/admin")
                            : navigate("/dashboard")
                    }
                >
                    <div className="results-logo">
                        V
                    </div>

                    <div className="results-brand-text">
                        <strong>
                            VOTE<span>2026</span>
                        </strong>

                        <small>
                            ONLINE ELECTION SYSTEM
                        </small>
                    </div>
                </div>

                <nav className="results-nav">
                    {role === "ADMIN" ? (
                        <button
                            onClick={() =>
                                navigate("/admin")
                            }
                        >
                            Admin Dashboard
                        </button>
                    ) : (
                        <button
                            onClick={() =>
                                navigate("/dashboard")
                            }
                        >
                            Dashboard
                        </button>
                    )}

                    <button
                        className="results-nav-active"
                    >
                        Results
                    </button>

                    <button
                        className="results-logout"
                        onClick={logout}
                    >
                        Logout
                    </button>
                </nav>
            </header>

            <main className="results-content">
                <section className="results-hero">
                    <div>
                        <span className="hero-label">
                            ELECTION CONTROL CENTER
                        </span>

                        <h1>
                            Election
                            <br />
                            <strong>Results.</strong>
                        </h1>

                        <p>
                            Monitor live voting activity and
                            review final election outcomes
                            from one professional dashboard.
                        </p>
                    </div>

                    <div className="results-hero-card">
                        <div className="hero-card-icon">
                            ✓
                        </div>

                        <span>
                            SECURE RESULTS
                        </span>

                        <strong>
                            Transparent
                        </strong>

                        <small>
                            Vote counts are calculated directly
                            from recorded ballots.
                        </small>
                    </div>
                </section>

                <section className="results-control-card">
                    <div className="control-left">
                        <span>
                            SELECT ELECTION
                        </span>

                        <strong>
                            {currentElection?.title ||
                                "Choose an election"}
                        </strong>
                    </div>

                    <div className="control-right">
                        <select
                            value={
                                selectedElection
                            }
                            onChange={
                                handleElectionChange
                            }
                        >
                            <option value="">
                                -- Select Election --
                            </option>

                            {elections.map(
                                election => (
                                    <option
                                        key={
                                            election.id
                                        }
                                        value={
                                            election.id
                                        }
                                    >
                                        {
                                            election.title
                                        }
                                        {election.active
                                            ? " — ACTIVE"
                                            : ""}
                                    </option>
                                )
                            )}
                        </select>

                        <button
                            className="refresh-button"
                            onClick={
                                refreshResults
                            }
                            disabled={
                                loadingResults ||
                                !selectedElection
                            }
                        >
                            ↻ Refresh
                        </button>
                    </div>
                </section>

                {error && (
                    <div className="results-error">
                        <strong>
                            Unable to load results
                        </strong>

                        <span>
                            {error}
                        </span>
                    </div>
                )}

                {selectedElection && (
                    <>
                        <section className="results-status">
                            <div>
                                <span>
                                    SELECTED ELECTION
                                </span>

                                <strong>
                                    {
                                        currentElection?.title
                                        || "Election"
                                    }
                                </strong>
                            </div>

                            <div className="status-right">
                                {currentElection?.active ? (
                                    <div className="live-badge">
                                        <span className="live-dot"></span>
                                        LIVE VOTING
                                    </div>
                                ) : (
                                    <div className="final-badge">
                                        FINAL RESULTS
                                    </div>
                                )}

                                {lastUpdated && (
                                    <small>
                                        Updated{" "}
                                        {lastUpdated.toLocaleTimeString()}
                                    </small>
                                )}
                            </div>
                        </section>

                        {loadingResults ? (
                            <section className="results-loading-card">
                                <div className="loading-spinner"></div>

                                <strong>
                                    Loading election results...
                                </strong>

                                <span>
                                    Please wait while the latest
                                    vote counts are retrieved.
                                </span>
                            </section>
                        ) : (
                            <>
                                <section className="summary-grid">
                                    <div className="summary-card">
                                        <div className="summary-icon blue">
                                            #
                                        </div>

                                        <div>
                                            <span>
                                                TOTAL VOTES
                                            </span>

                                            <strong>
                                                {totalVotes}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="summary-card">
                                        <div className="summary-icon green">
                                            ✓
                                        </div>

                                        <div>
                                            <span>
                                                CANDIDATES
                                            </span>

                                            <strong>
                                                {results.length}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="summary-card">
                                        <div className="summary-icon purple">
                                            ★
                                        </div>

                                        <div>
                                            <span>
                                                CURRENT LEADER
                                            </span>

                                            <strong>
                                                {totalVotes > 0
                                                    ? leaderNames
                                                    : "No votes"}
                                            </strong>
                                        </div>
                                    </div>
                                </section>

                                {totalVotes > 0 && (
                                    <section className="leader-card">
                                        <div className="leader-trophy">
                                            ★
                                        </div>

                                        <div className="leader-info">
                                            <span>
                                                {leaders.length > 1
                                                    ? "CURRENT TIE"
                                                    : currentElection?.active
                                                        ? "CURRENT LEADER"
                                                        : "WINNER"}
                                            </span>

                                            <h2>
                                                {leaderNames}
                                            </h2>

                                            <p>
                                                {
                                                    leaders
                                                        .map(
                                                            result =>
                                                                result.party
                                                        )
                                                        .join(" • ")
                                                }
                                            </p>
                                        </div>

                                        <div className="leader-votes">
                                            <strong>
                                                {highestVotes}
                                            </strong>

                                            <span>
                                                votes
                                            </span>
                                        </div>
                                    </section>
                                )}

                                {totalVotes === 0 && (
                                    <section className="no-votes-card">
                                        <div className="no-votes-symbol">
                                            0
                                        </div>

                                        <div>
                                            <span>
                                                NO BALLOTS RECORDED
                                            </span>

                                            <h2>
                                                Voting results are empty
                                            </h2>

                                            <p>
                                                This election has candidates,
                                                but no votes have been recorded yet.
                                            </p>
                                        </div>
                                    </section>
                                )}

                                <section className="result-table-card">
                                    <div className="result-table-header">
                                        <div>
                                            <span>
                                                CANDIDATE
                                            </span>
                                        </div>

                                        <div>
                                            <span>
                                                VOTES
                                            </span>
                                        </div>

                                        <div>
                                            <span>
                                                SHARE
                                            </span>
                                        </div>
                                    </div>

                                    {results.map(
                                        (
                                            result,
                                            index
                                        ) => {
                                            const voteCount =
                                                Number(
                                                    result.voteCount || 0
                                                );

                                            const percentage =
                                                totalVotes > 0
                                                    ? (
                                                        voteCount /
                                                        totalVotes *
                                                        100
                                                    ).toFixed(1)
                                                    : "0.0";

                                            const isLeader =
                                                totalVotes > 0 &&
                                                voteCount ===
                                                highestVotes;

                                            return (
                                                <div
                                                    className={
                                                        `result-row ${
                                                            isLeader
                                                                ? "leader-row"
                                                                : ""
                                                        }`
                                                    }
                                                    key={
                                                        result.candidateId
                                                    }
                                                >
                                                    <div className="candidate-cell">
                                                        <div className="rank-badge">
                                                            {index + 1}
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {
                                                                    result.candidateName
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    result.party
                                                                }
                                                            </span>
                                                        </div>

                                                        {isLeader && (
                                                            <em>
                                                                Leader
                                                            </em>
                                                        )}
                                                    </div>

                                                    <div className="vote-cell">
                                                        <strong>
                                                            {voteCount}
                                                        </strong>

                                                        <span>
                                                            {voteCount === 1
                                                                ? "vote"
                                                                : "votes"}
                                                        </span>
                                                    </div>

                                                    <div className="share-cell">
                                                        <div className="share-top">
                                                            <strong>
                                                                {percentage}%
                                                            </strong>
                                                        </div>

                                                        <div className="share-track">
                                                            <div
                                                                className="share-fill"
                                                                style={{
                                                                    width:
                                                                        `${percentage}%`
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </section>
                            </>
                        )}
                    </>
                )}
            </main>

            <footer className="results-footer">
                <span>
                    © 2026 Online Voting System
                </span>

                <span>
                    Secure • Transparent • Fair
                </span>
            </footer>
        </div>
    );
}

export default Results;