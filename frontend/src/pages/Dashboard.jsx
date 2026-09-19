import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getLanguage,
    getTranslation
} from "../i18n";

import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();

    const token =
        localStorage.getItem("token");

    const role =
        localStorage.getItem("role");

    const voterId =
        localStorage.getItem("voterId");

    const [language, setLanguage] =
        useState(getLanguage());

    const [elections, setElections] =
        useState([]);

    const [selectedElection, setSelectedElection] =
        useState(null);

    const [candidates, setCandidates] =
        useState([]);

    const [selectedCandidate, setSelectedCandidate] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [candidateLoading, setCandidateLoading] =
        useState(false);

    const [voteStatusLoading, setVoteStatusLoading] =
        useState(false);

    const [voting, setVoting] =
        useState(false);

    const [alreadyVoted, setAlreadyVoted] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [showConfirmation, setShowConfirmation] =
        useState(false);

    const [voteComplete, setVoteComplete] =
        useState(false);

    const t = (key) =>
        getTranslation(
            language,
            key
        );

    useEffect(() => {
        if (!token) {
            navigate("/", {
                replace: true
            });
            return;
        }

        if (role !== "VOTER") {
            if (role === "ADMIN") {
                navigate("/admin", {
                    replace: true
                });
            } else {
                localStorage.clear();

                navigate("/", {
                    replace: true
                });
            }
        }
    }, [token, role, navigate]);

    useEffect(() => {
        if (!token || role !== "VOTER") {
            return;
        }

        loadElections();
    }, [token, role]);

    const loadElections = async () => {
        setLoading(true);
        setError("");
        setMessage("");
        setAlreadyVoted(false);
        setVoteComplete(false);
        setSelectedCandidate(null);

        try {
            const response =
                await fetch(
                    "http://localhost:8080/api/elections",
                    {
                        method: "GET",
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const responseText =
                await response.text();

            let data;

            try {
                data =
                    responseText
                        ? JSON.parse(responseText)
                        : null;
            } catch {
                data = responseText;
            }

            if (!response.ok) {
                if (
                    response.status === 401 ||
                    response.status === 403
                ) {
                    localStorage.clear();

                    navigate("/", {
                        replace: true
                    });

                    return;
                }

                setError(
                    typeof data === "string"
                        ? data
                        : "Unable to load elections."
                );

                return;
            }

            const activeElections =
                Array.isArray(data)
                    ? data.filter(
                        election =>
                            election.active === true
                    )
                    : [];

            setElections(
                activeElections
            );

            if (activeElections.length > 0) {
                const firstElection =
                    activeElections[0];

                setSelectedElection(
                    firstElection
                );

                loadCandidates(
                    firstElection.id
                );

                checkVoteStatus(
                    firstElection.id
                );
            } else {
                setSelectedElection(null);
                setCandidates([]);
                setAlreadyVoted(false);
            }
        } catch (err) {
            console.error(
                "Election loading error:",
                err
            );

            setError(
                "Unable to connect to the voting server."
            );
        } finally {
            setLoading(false);
        }
    };

    const checkVoteStatus = async (
        electionId
    ) => {
        if (!electionId || !token) {
            return false;
        }

        setVoteStatusLoading(true);

        try {
            const response =
                await fetch(
                    `http://localhost:8080/api/votes/status/${electionId}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const responseText =
                await response.text();

            let data;

            try {
                data =
                    responseText
                        ? JSON.parse(responseText)
                        : null;
            } catch {
                data = responseText;
            }

            if (!response.ok) {
                if (
                    response.status === 401 ||
                    response.status === 403
                ) {
                    localStorage.clear();

                    navigate("/", {
                        replace: true
                    });

                    return false;
                }

                return false;
            }

            const hasVoted =
                data === true ||
                data === "true";

            setAlreadyVoted(
                hasVoted
            );

            if (hasVoted) {
                setSelectedCandidate(
                    null
                );

                setShowConfirmation(
                    false
                );
            }

            return hasVoted;
        } catch (err) {
            console.error(
                "Vote status error:",
                err
            );

            return false;
        } finally {
            setVoteStatusLoading(false);
        }
    };

    const loadCandidates = async (
        electionId
    ) => {
        if (!electionId) {
            return;
        }

        setCandidateLoading(true);
        setCandidates([]);
        setSelectedCandidate(null);
        setError("");
        setMessage("");
        setVoteComplete(false);

        try {
            const response =
                await fetch(
                    `http://localhost:8080/api/candidates/election/${electionId}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const responseText =
                await response.text();

            let data;

            try {
                data =
                    responseText
                        ? JSON.parse(responseText)
                        : null;
            } catch {
                data = responseText;
            }

            if (!response.ok) {
                if (
                    response.status === 401 ||
                    response.status === 403
                ) {
                    localStorage.clear();

                    navigate("/", {
                        replace: true
                    });

                    return;
                }

                setError(
                    typeof data === "string"
                        ? data
                        : "Unable to load candidates."
                );

                return;
            }

            setCandidates(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (err) {
            console.error(
                "Candidate loading error:",
                err
            );

            setError(
                "Unable to load candidates."
            );
        } finally {
            setCandidateLoading(false);
        }
    };

    const handleElectionChange = async (
        election
    ) => {
        setSelectedElection(
            election
        );

        setSelectedCandidate(
            null
        );

        setVoteComplete(
            false
        );

        setShowConfirmation(
            false
        );

        setError("");
        setMessage("");
        setAlreadyVoted(false);

        await loadCandidates(
            election.id
        );

        await checkVoteStatus(
            election.id
        );
    };

    const handleCandidateSelect = (
        candidate
    ) => {
        if (
            voting ||
            voteComplete ||
            voteStatusLoading
        ) {
            return;
        }

        setSelectedCandidate(
            candidate
        );

        setError("");
        setMessage("");
    };

    const handleVoteClick = async () => {
        setError("");
        setMessage("");

        if (!selectedElection) {
            setError(
                "Please select an election."
            );

            return;
        }

        if (!selectedCandidate) {
            setError(
                "Please select a candidate before voting."
            );

            return;
        }

        const hasAlreadyVoted =
            await checkVoteStatus(
                selectedElection.id
            );

        if (hasAlreadyVoted) {
            setShowConfirmation(
                false
            );

            setError(
                "You have already voted in this election."
            );

            return;
        }

        setShowConfirmation(
            true
        );
    };

    const confirmVote = async () => {
        if (
            !selectedElection ||
            !selectedCandidate ||
            voting
        ) {
            return;
        }

        const hasAlreadyVoted =
            await checkVoteStatus(
                selectedElection.id
            );

        if (hasAlreadyVoted) {
            setShowConfirmation(
                false
            );

            setVoting(false);

            setError(
                "You have already voted in this election."
            );

            return;
        }

        setVoting(true);
        setShowConfirmation(false);
        setError("");
        setMessage("");

        try {
            const response =
                await fetch(
                    "http://localhost:8080/api/votes",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                            Authorization:
                                `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            candidate: {
                                id:
                                selectedCandidate.id
                            }
                        })
                    }
                );

            const responseText =
                await response.text();

            let data;

            try {
                data =
                    responseText
                        ? JSON.parse(responseText)
                        : null;
            } catch {
                data = responseText;
            }

            if (!response.ok) {
                if (
                    response.status === 401 ||
                    response.status === 403
                ) {
                    localStorage.clear();

                    navigate("/", {
                        replace: true
                    });

                    return;
                }

                const serverMessage =
                    typeof data === "string"
                        ? data
                        : "Unable to cast your vote.";

                if (
                    serverMessage
                        .toLowerCase()
                        .includes("already") ||
                    serverMessage
                        .toLowerCase()
                        .includes("already voted")
                ) {
                    setAlreadyVoted(
                        true
                    );

                    setShowConfirmation(
                        false
                    );

                    setError(
                        "You have already voted in this election."
                    );

                    return;
                }

                setError(
                    serverMessage
                );

                return;
            }

            setMessage(
                t("voteSuccess")
            );

            setVoteComplete(
                true
            );

            setAlreadyVoted(
                true
            );

            setSelectedCandidate(
                null
            );
        } catch (err) {
            console.error(
                "Voting error:",
                err
            );

            setError(
                "Unable to connect to the voting server."
            );
        } finally {
            setVoting(false);
        }
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

    const handleLanguageChange = (
        newLanguage
    ) => {
        setLanguage(
            newLanguage
        );

        setError("");
        setMessage("");
    };

    if (loading) {
        return (
            <div className="voter-shell">
                <div className="voter-loading">
                    <div className="loading-symbol">
                        🗳️
                    </div>

                    <h2>
                        {t("secureVoting")}
                    </h2>

                    <p>
                        Loading your ballot...
                    </p>

                    <div className="loading-line">
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="voter-shell">
            <header className="voter-header">
                <div className="brand-area">
                    <div className="brand-symbol">
                        🗳️
                    </div>

                    <div>
                        <div className="brand-name">
                            {t("appName")}
                        </div>

                        <div className="brand-tagline">
                            {t("appTagline")}
                        </div>
                    </div>
                </div>

                <div className="header-actions">
                    <div className="dashboard-language-selector">
                        <span>🌐</span>

                        <select
                            value={language}
                            onChange={(event) =>
                                handleLanguageChange(
                                    event.target.value
                                )
                            }
                            aria-label="Select language"
                        >
                            <option value="en">
                                English
                            </option>

                            <option value="hi">
                                हिन्दी
                            </option>

                            <option value="te">
                                తెలుగు
                            </option>
                        </select>
                    </div>

                    <div className="voter-profile">
                        <div className="profile-avatar">
                            {voterId
                                ? voterId
                                    .charAt(0)
                                    .toUpperCase()
                                : "V"}
                        </div>

                        <div className="profile-details">
                            <span>
                                Voter
                            </span>

                            <strong>
                                {voterId || "Voter"}
                            </strong>
                        </div>
                    </div>

                    <button
                        className="voter-logout"
                        onClick={logout}
                    >
                        <span>
                            ↪
                        </span>

                        {t("logout")}
                    </button>
                </div>
            </header>

            <main className="voter-main">
                <section className="ballot-intro">
                    <div className="intro-copy">
                        <div className="intro-kicker">
                            {t("everyVoiceCounts")}
                        </div>

                        <h1>
                            {t("yourVoteMatters")}
                        </h1>

                        <p>
                            {t("thinkCarefully")}
                        </p>
                    </div>

                    <div className="intro-art">
                        <div className="ballot-ring">
                            <div className="ballot-paper">
                                <div className="paper-line">
                                </div>

                                <div className="paper-line short">
                                </div>

                                <div className="paper-line">
                                </div>

                                <div className="check-mark">
                                    ✓
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="security-strip">
                    <div className="security-item">
                        <div className="security-icon">
                            🔒
                        </div>

                        <div>
                            <strong>
                                {t("voteSecure")}
                            </strong>

                            <span>
                                Secure voter authentication
                            </span>
                        </div>
                    </div>

                    <div className="security-divider">
                    </div>

                    <div className="security-item">
                        <div className="security-icon">
                            1
                        </div>

                        <div>
                            <strong>
                                One vote
                            </strong>

                            <span>
                                One voter. One choice.
                            </span>
                        </div>
                    </div>

                    <div className="security-divider">
                    </div>

                    <div className="security-item">
                        <div className="security-icon">
                            ✓
                        </div>

                        <div>
                            <strong>
                                Verified
                            </strong>

                            <span>
                                Your identity is protected
                            </span>
                        </div>
                    </div>
                </section>

                {error && (
                    <div className="voter-alert voter-alert-error">
                        <span className="alert-icon">
                            !
                        </span>

                        <span>
                            {error}
                        </span>
                    </div>
                )}

                {message && (
                    <div className="voter-alert voter-alert-success">
                        <span className="alert-icon">
                            ✓
                        </span>

                        <span>
                            {message}
                        </span>
                    </div>
                )}

                {elections.length === 0 && (
                    <section className="no-election-card">
                        <div className="no-election-icon">
                            🕊️
                        </div>

                        <h2>
                            {t("noElections")}
                        </h2>

                        <p>
                            There is no election currently
                            open for voting. Please check
                            again later.
                        </p>

                        <button
                            className="secondary-action"
                            onClick={
                                loadElections
                            }
                        >
                            Refresh Elections
                        </button>
                    </section>
                )}

                {elections.length > 0 && (
                    <>
                        {elections.length > 1 && (
                            <section className="election-selector-section">
                                <div className="section-heading">
                                    <div>
                                        <span className="section-eyebrow">
                                            AVAILABLE
                                        </span>

                                        <h2>
                                            {t("elections")}
                                        </h2>
                                    </div>

                                    <span className="election-count">
                                        {elections.length}
                                    </span>
                                </div>

                                <div className="election-tabs">
                                    {elections.map(
                                        (election) => (
                                            <button
                                                key={
                                                    election.id
                                                }
                                                className={
                                                    selectedElection?.id ===
                                                    election.id
                                                        ? "election-tab selected"
                                                        : "election-tab"
                                                }
                                                onClick={() =>
                                                    handleElectionChange(
                                                        election
                                                    )
                                                }
                                            >
                                                <span className="tab-radio">
                                                    {selectedElection?.id ===
                                                    election.id
                                                        ? "✓"
                                                        : ""}
                                                </span>

                                                <span>
                                                    <strong>
                                                        {
                                                            election.title
                                                        }
                                                    </strong>

                                                    <small>
                                                        {t("votingOpen")}
                                                    </small>
                                                </span>
                                            </button>
                                        )
                                    )}
                                </div>
                            </section>
                        )}

                        {selectedElection && (
                            <section className="current-election">
                                <div className="election-heading">
                                    <div>
                                        <div className="live-label">
                                            <span className="live-dot">
                                            </span>

                                            {t("votingOpen")}
                                        </div>

                                        <h2>
                                            {
                                                selectedElection.title
                                            }
                                        </h2>

                                        <p>
                                            {
                                                selectedElection.description
                                            }
                                        </p>
                                    </div>

                                    <div className="ballot-number">
                                        <span>
                                            BALLOT
                                        </span>

                                        <strong>
                                            #{selectedElection.id}
                                        </strong>
                                    </div>
                                </div>

                                {alreadyVoted && !voteComplete && (
                                    <div className="voter-alert voter-alert-error">
                                        <span className="alert-icon">
                                            !
                                        </span>

                                        <span>
                                            You have already voted in this election.
                                        </span>
                                    </div>
                                )}

                                <div className="candidate-section-header">
                                    <div>
                                        <span className="section-eyebrow">
                                            YOUR CHOICE
                                        </span>

                                        <h2>
                                            {t("chooseCandidate")}
                                        </h2>
                                    </div>

                                    <span className="candidate-count">
                                        {candidates.length}
                                        {" "}
                                        {candidates.length === 1
                                            ? "candidate"
                                            : "candidates"}
                                    </span>
                                </div>

                                {candidateLoading ? (
                                    <div className="candidate-loading">
                                        <div className="mini-spinner">
                                        </div>

                                        <span>
                                            Loading candidates...
                                        </span>
                                    </div>
                                ) : candidates.length === 0 ? (
                                    <div className="no-candidates">
                                        <div>
                                            👥
                                        </div>

                                        <h3>
                                            {t("noCandidates")}
                                        </h3>
                                    </div>
                                ) : (
                                    <div className="candidate-grid">
                                        {candidates.map(
                                            (candidate, index) => {
                                                const isSelected =
                                                    selectedCandidate?.id ===
                                                    candidate.id;

                                                return (
                                                    <button
                                                        type="button"
                                                        key={
                                                            candidate.id
                                                        }
                                                        className={
                                                            isSelected
                                                                ? "candidate-ballot selected"
                                                                : "candidate-ballot"
                                                        }
                                                        onClick={() =>
                                                            handleCandidateSelect(
                                                                candidate
                                                            )
                                                        }
                                                        disabled={
                                                            voting ||
                                                            voteComplete ||
                                                            voteStatusLoading
                                                        }
                                                    >
                                                        <div className="candidate-top">
                                                            <span className="candidate-number">
                                                                {String(
                                                                    index + 1
                                                                ).padStart(
                                                                    2,
                                                                    "0"
                                                                )}
                                                            </span>

                                                            <span
                                                                className={
                                                                    isSelected
                                                                        ? "selection-circle checked"
                                                                        : "selection-circle"
                                                                }
                                                            >
                                                                {isSelected
                                                                    ? "✓"
                                                                    : ""}
                                                            </span>
                                                        </div>

                                                        <div className="candidate-avatar">
                                                            {
                                                                candidate.name
                                                                    ? candidate.name
                                                                        .charAt(0)
                                                                        .toUpperCase()
                                                                    : "?"
                                                            }
                                                        </div>

                                                        <div className="candidate-information">
                                                            <h3>
                                                                {
                                                                    candidate.name
                                                                }
                                                            </h3>

                                                            <span>
                                                                {
                                                                    candidate.party
                                                                }
                                                            </span>
                                                        </div>

                                                        <div className="candidate-choice">
                                                            {isSelected
                                                                ? "SELECTED"
                                                                : "SELECT"}
                                                        </div>
                                                    </button>
                                                );
                                            }
                                        )}
                                    </div>
                                )}

                                {!voteComplete &&
                                    candidates.length > 0 && (
                                        <div className="vote-panel">
                                            <div className="vote-guidance">
                                                <div className="guidance-icon">
                                                    ✓
                                                </div>

                                                <div>
                                                    <strong>
                                                        {
                                                            selectedCandidate
                                                                ? `You selected ${selectedCandidate.name}`
                                                                : "Make your selection"
                                                        }
                                                    </strong>

                                                    <span>
                                                        {t("oneVote")}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                className="cast-vote-button"
                                                onClick={
                                                    handleVoteClick
                                                }
                                                disabled={
                                                    !selectedCandidate ||
                                                    voting ||
                                                    voteStatusLoading
                                                }
                                            >
                                                {voteStatusLoading
                                                    ? "Checking vote status..."
                                                    : voting
                                                        ? "Submitting..."
                                                        : t("castVote")}

                                                <span>
                                                    →
                                                </span>
                                            </button>
                                        </div>
                                    )}

                                {voteComplete && (
                                    <div className="vote-complete">
                                        <div className="success-seal">
                                            ✓
                                        </div>

                                        <div>
                                            <span className="section-eyebrow">
                                                BALLOT SUBMITTED
                                            </span>

                                            <h2>
                                                Your vote has been recorded
                                            </h2>

                                            <p>
                                                Thank you for participating
                                                in the election. Your choice
                                                has been securely submitted.
                                            </p>
                                        </div>

                                        <div className="submitted-mark">
                                            SECURE
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}
                    </>
                )}

                <footer className="voter-footer">
                    <div>
                        <strong>
                            {t("appName")}
                        </strong>

                        <span>
                            {t("trustedElection")}
                        </span>
                    </div>

                    <span>
                        🔒 Secure Voting Portal
                    </span>
                </footer>
            </main>

            {showConfirmation && !alreadyVoted && (
                <div className="modal-backdrop">
                    <div className="confirmation-modal">
                        <div className="modal-symbol">
                            🗳️
                        </div>

                        <span className="modal-eyebrow">
                            FINAL REVIEW
                        </span>

                        <h2>
                            Confirm your vote
                        </h2>

                        <p>
                            Please review your selection.
                            Once submitted, your vote cannot
                            be changed.
                        </p>

                        <div className="review-card">
                            <span>
                                YOUR CHOICE
                            </span>

                            <strong>
                                {
                                    selectedCandidate?.name
                                }
                            </strong>

                            <small>
                                {
                                    selectedCandidate?.party
                                }
                            </small>
                        </div>

                        <div className="modal-warning">
                            <span>
                                ⚠
                            </span>

                            <p>
                                You can vote only once in this
                                election. Make sure your choice
                                is correct.
                            </p>
                        </div>

                        <div className="modal-actions">
                            <button
                                className="modal-cancel"
                                onClick={() =>
                                    setShowConfirmation(
                                        false
                                    )
                                }
                                disabled={voting}
                            >
                                {t("cancel")}
                            </button>

                            <button
                                className="modal-confirm"
                                onClick={
                                    confirmVote
                                }
                                disabled={voting}
                            >
                                {voting
                                    ? "Submitting..."
                                    : t("confirm")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;