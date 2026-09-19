import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/admin.css";

function AdminDashboard() {
    const navigate = useNavigate();

    const [language, setLanguage] = useState(
        localStorage.getItem("language") || "en"
    );

    const handleLanguageChange = (value) => {
        setLanguage(value);
        localStorage.setItem("language", value);
    };

    const [elections, setElections] = useState([]);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [selectedElection, setSelectedElection] =
        useState("");

    const [candidates, setCandidates] = useState([]);

    const [candidateName, setCandidateName] =
        useState("");

    const [party, setParty] = useState("");

    const [editingCandidateId, setEditingCandidateId] =
        useState(null);

    const [editingCandidateName, setEditingCandidateName] =
        useState("");

    const [editingParty, setEditingParty] =
        useState("");

    const [showAdminModal, setShowAdminModal] =
        useState(false);

    const [adminFullName, setAdminFullName] =
        useState("");

    const [adminEmail, setAdminEmail] =
        useState("");

    const [adminId, setAdminId] =
        useState("");

    const [adminPassword, setAdminPassword] =
        useState("");

    const [adminLoading, setAdminLoading] =
        useState(false);

    const [historyElections, setHistoryElections] =
        useState([]);

    const [historyLoading, setHistoryLoading] =
        useState(false);

    const [deleteElection, setDeleteElection] =
        useState(null);

    const [deleteLoading, setDeleteLoading] =
        useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const getToken = () => {
        return localStorage.getItem("token");
    };

    const getRole = () => {
        return localStorage.getItem("role");
    };

    const authHeaders = () => ({
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json"
    });

    const parseResponse = async (response) => {
        const text = await response.text();

        if (!text) {
            return null;
        }

        try {
            return JSON.parse(text);
        } catch {
            return text;
        }
    };

    const responseError = (data, fallback) => {
        if (typeof data === "string") {
            return data;
        }

        if (data?.message) {
            return data.message;
        }

        if (data?.error) {
            return data.error;
        }

        return fallback;
    };

    const loadElectionHistory = async () => {
        try {
            setHistoryLoading(true);

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:8080/api/elections/admin/history",
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
                data = responseText
                    ? JSON.parse(responseText)
                    : [];
            } catch {
                data = [];
            }

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.clear();
                sessionStorage.clear();

                navigate("/", {
                    replace: true
                });

                return;
            }

            if (!response.ok) {
                throw new Error(
                    typeof data === "string"
                        ? data
                        : "Unable to load election history."
                );
            }

            setHistoryElections(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (error) {
            console.error(
                "Election history error:",
                error
            );
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        const token = getToken();
        const role = getRole();

        if (!token) {
            navigate("/", {
                replace: true
            });
            return;
        }

        if (
            !role ||
            String(role).toUpperCase() !== "ADMIN"
        ) {
            navigate("/dashboard", {
                replace: true
            });
            return;
        }

        loadElections();
        loadElectionHistory();
    }, [navigate]);

    const loadElections = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:8080/api/elections/admin/dashboard",
                {
                    method: "GET",
                    headers: authHeaders()
                }
            );

            const data =
                await parseResponse(response);

            if (!response.ok) {
                throw new Error(
                    responseError(
                        data,
                        "Unable to load elections."
                    )
                );
            }

            setElections(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (err) {
            setError(
                err.message ||
                "Unable to load elections."
            );
        } finally {
            setLoading(false);
        }
    };

    const createElection = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        if (!title.trim()) {
            setError(
                "Election title is required."
            );
            return;
        }

        if (!description.trim()) {
            setError(
                "Election description is required."
            );
            return;
        }

        try {
            setLoading(true);

            const token =
                localStorage.getItem("token");

            if (!token) {
                setError(
                    "Your session has expired. Please login again."
                );
                return;
            }

            const response = await fetch(
                "http://localhost:8080/api/elections/admin",
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        title:
                            title.trim(),
                        description:
                            description.trim()
                    })
                }
            );

            const text =
                await response.text();

            console.log(
                "Create election status:",
                response.status
            );

            console.log(
                "Create election response:",
                text
            );

            let data = text;

            try {
                data = text
                    ? JSON.parse(text)
                    : null;
            } catch {
            }

            if (!response.ok) {
                const errorMessage =
                    typeof data === "string"
                        ? data
                        : data?.message ||
                        data?.error ||
                        `Unable to create election (${response.status})`;

                throw new Error(
                    errorMessage
                );
            }

            setTitle("");
            setDescription("");

            setMessage(
                "Election created successfully."
            );

            await loadElections();
        } catch (err) {
            console.error(
                "Create election error:",
                err
            );

            setError(
                err.message ||
                "Unable to create election."
            );
        } finally {
            setLoading(false);
        }
    };

    const changeElectionStatus = async (
        electionId,
        active
    ) => {
        setMessage("");
        setError("");

        try {
            setLoading(true);

            const endpoint = active
                ? `http://localhost:8080/api/elections/admin/${electionId}/deactivate`
                : `http://localhost:8080/api/elections/admin/${electionId}/activate`;

            const response = await fetch(
                endpoint,
                {
                    method: "PUT",
                    headers: authHeaders()
                }
            );

            const data =
                await parseResponse(response);

            if (!response.ok) {
                throw new Error(
                    responseError(
                        data,
                        "Unable to change election status."
                    )
                );
            }

            setMessage(
                active
                    ? "Election deactivated successfully."
                    : "Election activated successfully."
            );

            await loadElections();
        } catch (err) {
            setError(
                err.message ||
                "Unable to change election status."
            );
        } finally {
            setLoading(false);
        }
    };

    const openDeleteElectionModal = (
        election
    ) => {
        setMessage("");
        setError("");

        setDeleteElection(election);
    };

    const closeDeleteElectionModal = () => {
        if (deleteLoading) {
            return;
        }

        setDeleteElection(null);
    };

    const confirmDeleteElection = async () => {
        if (!deleteElection) {
            return;
        }

        setMessage("");
        setError("");

        try {
            setDeleteLoading(true);

            const token = localStorage.getItem("token");

            if (!token) {
                setError(
                    "Your session has expired. Please login again."
                );

                setDeleteElection(null);

                navigate("/", {
                    replace: true
                });

                return;
            }

            const electionId = deleteElection.id;

            console.log(
                "Deleting election ID:",
                electionId
            );

            const response = await fetch(
                `http://localhost:8080/api/elections/admin/${electionId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        "Content-Type":
                            "application/json"
                    }
                }
            );

            const responseText =
                await response.text();

            console.log(
                "Delete election status:",
                response.status
            );

            console.log(
                "Delete election response:",
                responseText
            );

            let data = responseText;

            try {
                data = responseText
                    ? JSON.parse(responseText)
                    : null;
            } catch {
            }

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.clear();
                sessionStorage.clear();

                setDeleteElection(null);

                navigate("/", {
                    replace: true
                });

                return;
            }

            if (!response.ok) {
                const serverMessage =
                    typeof data === "string"
                        ? data
                        : data?.message ||
                        data?.error ||
                        `Unable to delete election (${response.status}).`;

                throw new Error(
                    serverMessage
                );
            }

            console.log(
                "Election deleted successfully:",
                electionId
            );

            if (
                String(selectedElection) ===
                String(electionId)
            ) {
                setSelectedElection("");

                setCandidates([]);

                setEditingCandidateId(null);

                setEditingCandidateName("");

                setEditingParty("");
            }

            setDeleteElection(null);

            setMessage(
                "Election deleted successfully."
            );

            await loadElections();
        } catch (err) {
            console.error(
                "Delete election error:",
                err
            );

            setError(
                err.message ||
                "Unable to delete election."
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    const loadCandidates = async (
        electionId
    ) => {
        if (!electionId) {
            setCandidates([]);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `http://localhost:8080/api/candidates/election/${electionId}`,
                {
                    method: "GET",
                    headers: authHeaders()
                }
            );

            const data =
                await parseResponse(response);

            if (!response.ok) {
                throw new Error(
                    responseError(
                        data,
                        "Unable to load candidates."
                    )
                );
            }

            setCandidates(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (err) {
            setError(
                err.message ||
                "Unable to load candidates."
            );
        } finally {
            setLoading(false);
        }
    };

    const createCandidate = async (
        event
    ) => {
        event.preventDefault();

        setMessage("");
        setError("");

        if (!selectedElection) {
            setError(
                "Please select an election."
            );
            return;
        }

        if (!candidateName.trim()) {
            setError(
                "Candidate name is required."
            );
            return;
        }

        if (!party.trim()) {
            setError(
                "Party name is required."
            );
            return;
        }

        try {
            setLoading(true);

            const token =
                localStorage.getItem("token");

            if (!token) {
                setError(
                    "Your session has expired. Please login again."
                );
                return;
            }

            const requestBody = {
                name:
                    candidateName.trim(),
                party:
                    party.trim(),
                election: {
                    id:
                        Number(
                            selectedElection
                        )
                }
            };

            console.log(
                "Creating candidate:",
                requestBody
            );

            const response = await fetch(
                "http://localhost:8080/api/candidates/admin",
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        "Content-Type":
                            "application/json"
                    },
                    body:
                        JSON.stringify(
                            requestBody
                        )
                }
            );

            const text =
                await response.text();

            console.log(
                "Candidate response status:",
                response.status
            );

            console.log(
                "Candidate response:",
                text
            );

            let data = text;

            try {
                data = text
                    ? JSON.parse(text)
                    : null;
            } catch {
            }

            if (!response.ok) {
                const errorMessage =
                    typeof data === "string"
                        ? data
                        : data?.message ||
                        data?.error ||
                        `Unable to create candidate (${response.status})`;

                throw new Error(
                    errorMessage
                );
            }

            setCandidateName("");
            setParty("");

            setMessage(
                "Candidate created successfully."
            );

            await loadCandidates(
                selectedElection
            );
        } catch (err) {
            console.error(
                "Create candidate error:",
                err
            );

            setError(
                err.message ||
                "Unable to create candidate."
            );
        } finally {
            setLoading(false);
        }
    };

    const startEditCandidate = (
        candidate
    ) => {
        setMessage("");
        setError("");

        setEditingCandidateId(
            candidate.id
        );

        setEditingCandidateName(
            candidate.name || ""
        );

        setEditingParty(
            candidate.party || ""
        );
    };

    const cancelEditCandidate = () => {
        setEditingCandidateId(null);
        setEditingCandidateName("");
        setEditingParty("");
    };

    const updateCandidate = async (
        candidateId
    ) => {
        setMessage("");
        setError("");

        if (!editingCandidateName.trim()) {
            setError(
                "Candidate name is required."
            );
            return;
        }

        if (!editingParty.trim()) {
            setError(
                "Party name is required."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `http://localhost:8080/api/candidates/admin/${candidateId}`,
                {
                    method: "PUT",
                    headers: authHeaders(),
                    body:
                        JSON.stringify({
                            name:
                                editingCandidateName.trim(),
                            party:
                                editingParty.trim()
                        })
                }
            );

            const data =
                await parseResponse(
                    response
                );

            if (!response.ok) {
                throw new Error(
                    responseError(
                        data,
                        "Unable to update candidate."
                    )
                );
            }

            cancelEditCandidate();

            setMessage(
                "Candidate updated successfully."
            );

            await loadCandidates(
                selectedElection
            );
        } catch (err) {
            setError(
                err.message ||
                "Unable to update candidate."
            );
        } finally {
            setLoading(false);
        }
    };

    const deleteCandidate = async (
        candidateId
    ) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this candidate?"
            );

        if (!confirmed) {
            return;
        }

        setMessage("");
        setError("");

        try {
            setLoading(true);

            const response = await fetch(
                `http://localhost:8080/api/candidates/admin/${candidateId}`,
                {
                    method: "DELETE",
                    headers: authHeaders()
                }
            );

            const data =
                await parseResponse(response);

            if (!response.ok) {
                throw new Error(
                    responseError(
                        data,
                        "Unable to delete candidate."
                    )
                );
            }

            setMessage(
                "Candidate deleted successfully."
            );

            await loadCandidates(
                selectedElection
            );
        } catch (err) {
            setError(
                err.message ||
                "Unable to delete candidate."
            );
        } finally {
            setLoading(false);
        }
    };

    const createAdministrator = async (
        event
    ) => {
        event.preventDefault();

        setMessage("");
        setError("");

        if (!adminFullName.trim()) {
            setError(
                "Administrator full name is required."
            );
            return;
        }

        if (!adminEmail.trim()) {
            setError(
                "Administrator email is required."
            );
            return;
        }

        if (!adminId.trim()) {
            setError(
                "Administrator ID is required."
            );
            return;
        }

        if (!adminPassword) {
            setError(
                "Administrator password is required."
            );
            return;
        }

        if (adminPassword.length < 6) {
            setError(
                "Administrator password must contain at least 6 characters."
            );
            return;
        }

        try {
            setAdminLoading(true);

            const response = await fetch(
                "http://localhost:8080/api/admin/users",
                {
                    method: "POST",
                    headers: authHeaders(),
                    body:
                        JSON.stringify({
                            fullName:
                                adminFullName.trim(),
                            email:
                                adminEmail.trim(),
                            voterId:
                                adminId.trim(),
                            password:
                            adminPassword
                        })
                }
            );

            const data =
                await parseResponse(
                    response
                );

            if (!response.ok) {
                throw new Error(
                    responseError(
                        data,
                        "Unable to create administrator."
                    )
                );
            }

            setAdminFullName("");
            setAdminEmail("");
            setAdminId("");
            setAdminPassword("");

            setShowAdminModal(false);

            setMessage(
                "Administrator created successfully."
            );
        } catch (err) {
            setError(
                err.message ||
                "Unable to create administrator."
            );
        } finally {
            setAdminLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("voterId");
        localStorage.removeItem("user");

        navigate("/", {
            replace: true
        });
    };

    return (
        <div className="admin-page">

            <header className="admin-header">

                <div className="admin-brand">

                    <div className="admin-brand-icon">
                        🗳️
                    </div>

                    <div>
                        <h1>
                            Online Voting System
                        </h1>

                        <span>
                            Administrator Panel
                        </span>
                    </div>

                </div>

                <div className="admin-header-actions">

                    <div className="admin-language-selector">

                        <span>
                            🌐
                        </span>

                        <select
                            value={language}
                            onChange={(event) =>
                                handleLanguageChange(
                                    event.target.value
                                )
                            }
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

                    <button
                        type="button"
                        className="add-admin-top-btn"
                        onClick={() =>
                            setShowAdminModal(
                                true
                            )
                        }
                    >
                        + Add Admin
                    </button>

                    <button
                        type="button"
                        className="admin-nav-btn"
                        onClick={() =>
                            navigate("/results")
                        }
                    >
                        Results
                    </button>

                    <button
                        type="button"
                        className="admin-logout-btn"
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>

            </header>

            <main className="admin-content">

                {message && (
                    <div className="admin-success-message">
                        <span className="message-icon">
                            ✓
                        </span>

                        <span>
                            {message}
                        </span>
                    </div>
                )}

                {error && (
                    <div className="admin-error-message">
                        <span className="message-icon">
                            !
                        </span>

                        <span>
                            {error}
                        </span>
                    </div>
                )}

                <section className="admin-card create-election-card">

                    <h2>
                        Create Election
                    </h2>

                    <p className="section-description">
                        Create a new election for students.
                    </p>

                    <form
                        onSubmit={createElection}
                        className="admin-form"
                    >

                        <div className="form-group">

                            <label>
                                Election Title
                            </label>

                            <input
                                type="text"
                                value={title}
                                onChange={(event) =>
                                    setTitle(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter election title"
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Description
                            </label>

                            <input
                                type="text"
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter election description"
                            />

                        </div>

                        <button
                            type="submit"
                            className="create-election-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating..."
                                : "Create Election"}
                        </button>

                    </form>

                </section>

                <section className="admin-card election-management-card">

                    <h2>
                        Election Management
                    </h2>

                    <p className="section-description">
                        Manage your elections and their
                        current status.
                    </p>

                    {elections.length === 0 ? (

                        <div className="empty-state">

                            <h3>
                                No elections available
                            </h3>

                            <p>
                                Create an election above
                                to get started.
                            </p>

                        </div>

                    ) : (

                        <div className="election-list">

                            {elections.map(
                                (election) => (

                                    <div
                                        className="election-item"
                                        key={election.id}
                                    >

                                        <div className="election-info">

                                            <h3 className="admin-election-title">
                                                {
                                                    election.title
                                                }
                                            </h3>

                                            <p>
                                                {
                                                    election.description
                                                }
                                            </p>

                                            <span
                                                className={
                                                    election.active
                                                        ? "status-badge active"
                                                        : "status-badge inactive"
                                                }
                                            >

                                                <span className="status-dot">
                                                </span>

                                                {election.active
                                                    ? "Active"
                                                    : "Inactive"}

                                            </span>

                                        </div>

                                        <div className="election-actions">

                                            <button
                                                type="button"
                                                className={
                                                    election.active
                                                        ? "deactivate-btn"
                                                        : "activate-btn"
                                                }
                                                onClick={() =>
                                                    changeElectionStatus(
                                                        election.id,
                                                        election.active
                                                    )
                                                }
                                                disabled={
                                                    loading ||
                                                    deleteLoading
                                                }
                                            >
                                                {election.active
                                                    ? "Deactivate"
                                                    : "Activate"}
                                            </button>

                                            <button
                                                type="button"
                                                className="delete-election-btn"
                                                onClick={() =>
                                                    openDeleteElectionModal(
                                                        election
                                                    )
                                                }
                                                disabled={
                                                    loading ||
                                                    deleteLoading
                                                }
                                            >
                                                <span className="delete-icon">
                                                    🗑
                                                </span>

                                                Delete
                                            </button>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}
                </section>

                <section className="admin-section history-section">

                    <div className="admin-section-header">

                        <div>

                            <span className="admin-section-label">
                                ARCHIVED ELECTIONS
                            </span>

                            <h2>
                                Election History
                            </h2>

                            <p>
                                Completed elections and their final records.
                            </p>

                        </div>

                        <span className="admin-section-count">
                            {historyElections.length}
                        </span>

                    </div>

                    {historyLoading ? (

                        <div className="history-loading">
                            Loading election history...
                        </div>

                    ) : historyElections.length === 0 ? (

                        <div className="history-empty">

                            <div className="history-empty-icon">
                                ✓
                            </div>

                            <h3>
                                No completed elections
                            </h3>

                            <p>
                                Completed elections will appear here
                                after voting has ended.
                            </p>

                        </div>

                    ) : (

                        <div className="history-list">

                            {historyElections.map(
                                (election) => (

                                    <div
                                        className="history-card"
                                        key={election.id}
                                    >

                                        <div className="history-card-main">

                                            <div className="history-icon">
                                                ✓
                                            </div>

                                            <div>

                                                <h3>
                                                    {election.title}
                                                </h3>

                                                <p>
                                                    {election.description}
                                                </p>

                                                <span className="history-status">
                                                    COMPLETED
                                                </span>

                                            </div>

                                        </div>

                                        <button
                                            type="button"
                                            className="history-results-btn"
                                            onClick={() =>
                                                navigate("/results")
                                            }
                                        >
                                            View Results
                                        </button>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>

                <section className="admin-card candidate-management-card">

                    <h2>
                        Candidate Management
                    </h2>

                    <p className="section-description">
                        Add, edit and remove candidates
                        for an election.
                    </p>

                    <div className="candidate-select-area">

                        <label>
                            Select Election
                        </label>

                        <select
                            value={selectedElection}
                            onChange={(event) => {

                                const value =
                                    event.target.value;

                                setSelectedElection(
                                    value
                                );

                                loadCandidates(
                                    value
                                );

                            }}
                        >

                            <option value="">
                                -- Select Election --
                            </option>

                            {elections.map(
                                (election) => (

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
                                    </option>

                                )
                            )}

                        </select>

                    </div>

                    {selectedElection && (
                        <form
                            onSubmit={
                                createCandidate
                            }
                            className="candidate-add-form"
                        >

                            <div className="candidate-form-row">

                                <div className="form-group">

                                    <label>
                                        Candidate Name
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            candidateName
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setCandidateName(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Candidate name"
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Party
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            party
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setParty(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Party name"
                                    />

                                </div>

                                <button
                                    type="submit"
                                    className="candidate-add-btn"
                                    disabled={
                                        loading
                                    }
                                >
                                    Add Candidate
                                </button>

                            </div>

                        </form>
                    )}

                    {selectedElection && (

                        <div className="candidate-list">

                            {candidates.length === 0 ? (

                                <div className="empty-state candidate-empty">

                                    <h3>
                                        No candidates available
                                    </h3>

                                    <p>
                                        Add candidates for
                                        this election.
                                    </p>

                                </div>

                            ) : (

                                candidates.map(
                                    (candidate) => (

                                        <div
                                            className="candidate-item"
                                            key={
                                                candidate.id
                                            }
                                        >

                                            {editingCandidateId ===
                                            candidate.id ? (

                                                <div className="candidate-edit-row">

                                                    <input
                                                        type="text"
                                                        value={
                                                            editingCandidateName
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            setEditingCandidateName(
                                                                event.target.value
                                                            )
                                                        }
                                                    />

                                                    <input
                                                        type="text"
                                                        value={
                                                            editingParty
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            setEditingParty(
                                                                event.target.value
                                                            )
                                                        }
                                                    />

                                                    <button
                                                        type="button"
                                                        className="candidate-save-btn"
                                                        onClick={() =>
                                                            updateCandidate(
                                                                candidate.id
                                                            )
                                                        }
                                                    >
                                                        Save
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="candidate-cancel-btn"
                                                        onClick={
                                                            cancelEditCandidate
                                                        }
                                                    >
                                                        Cancel
                                                    </button>

                                                </div>

                                            ) : (

                                                <>

                                                    <div className="candidate-info">

                                                        <h3>
                                                            {
                                                                candidate.name
                                                            }
                                                        </h3>

                                                        <p>
                                                            {
                                                                candidate.party
                                                            }
                                                        </p>

                                                    </div>

                                                    <div className="candidate-actions">

                                                        <button
                                                            type="button"
                                                            className="candidate-edit-btn"
                                                            onClick={() =>
                                                                startEditCandidate(
                                                                    candidate
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="candidate-delete-btn"
                                                            onClick={() =>
                                                                deleteCandidate(
                                                                    candidate.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                </>

                                            )}

                                        </div>

                                    )
                                )
                            )}

                        </div>

                    )}

                </section>

            </main>

            {showAdminModal && (

                <div
                    className="admin-modal-overlay"
                    onClick={() =>
                        setShowAdminModal(
                            false
                        )
                    }
                >

                    <div
                        className="admin-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="admin-modal-header">

                            <div className="admin-modal-title">

                                <div className="admin-modal-icon">
                                    👤
                                </div>

                                <div>

                                    <h2>
                                        Create New Administrator
                                    </h2>

                                    <p>
                                        Enter the details for
                                        the new admin.
                                    </p>

                                </div>

                            </div>

                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={() =>
                                    setShowAdminModal(
                                        false
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>

                        <form
                            onSubmit={
                                createAdministrator
                            }
                            className="admin-modal-form"
                        >

                            <div className="form-group">

                                <label>
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    value={
                                        adminFullName
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setAdminFullName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter full name"
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={
                                        adminEmail
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setAdminEmail(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter email address"
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Admin ID
                                </label>

                                <input
                                    type="text"
                                    value={
                                        adminId
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setAdminId(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Example: ADMIN002"
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Password
                                </label>

                                <input
                                    type="password"
                                    value={
                                        adminPassword
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setAdminPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter password"
                                />

                            </div>

                            <div className="admin-modal-security">

                                <span>
                                    🔐
                                </span>

                                <p>
                                    This account will
                                    automatically receive
                                    the <strong>ADMIN</strong> role.
                                </p>

                            </div>

                            <div className="admin-modal-actions">

                                <button
                                    type="button"
                                    className="admin-modal-cancel"
                                    onClick={() =>
                                        setShowAdminModal(
                                            false
                                        )
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="admin-modal-submit"
                                    disabled={
                                        adminLoading
                                    }
                                >
                                    {adminLoading
                                        ? "Creating..."
                                        : "Create Admin"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {deleteElection && (

                <div
                    className="admin-modal-overlay delete-modal-overlay"
                    onClick={
                        closeDeleteElectionModal
                    }
                >

                    <div
                        className="admin-modal delete-election-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="delete-modal-top">

                            <div className="delete-modal-icon">
                                🗑️
                            </div>

                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={
                                    closeDeleteElectionModal
                                }
                                disabled={
                                    deleteLoading
                                }
                            >
                                ×
                            </button>

                        </div>

                        <div className="delete-modal-content">

                            <span className="delete-modal-label">
                                DELETE ELECTION
                            </span>

                            <h2>
                                Delete this election?
                            </h2>

                            <p>
                                You are about to delete:
                            </p>

                            <div className="delete-election-preview">

                                <strong>
                                    {
                                        deleteElection.title
                                    }
                                </strong>

                                <span
                                    className={
                                        deleteElection.active
                                            ? "preview-status active"
                                            : "preview-status inactive"
                                    }
                                >
                                    {deleteElection.active
                                        ? "Active"
                                        : "Inactive"}
                                </span>

                            </div>

                            <div className="delete-warning-box">

                                <span>
                                    ⚠️
                                </span>

                                <p>
                                    This action permanently
                                    removes the election.
                                    Elections that cannot be
                                    deleted by the server will
                                    return an appropriate error.
                                </p>

                            </div>

                        </div>

                        <div className="delete-modal-actions">

                            <button
                                type="button"
                                className="delete-modal-cancel"
                                onClick={
                                    closeDeleteElectionModal
                                }
                                disabled={
                                    deleteLoading
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="delete-modal-confirm"
                                onClick={
                                    confirmDeleteElection
                                }
                                disabled={
                                    deleteLoading
                                }
                            >
                                {deleteLoading ? (
                                    <>
                                        <span className="delete-spinner">
                                        </span>

                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <span>
                                            🗑
                                        </span>

                                        Delete Election
                                    </>
                                )}
                            </button>

                        </div>

                    </div>

                </div>
            )}

            <footer className="admin-footer">

                <p>
                    Online Voting System
                </p>

                <span>
                    Secure • Transparent • Digital
                </span>

            </footer>

        </div>
    );
}
export default AdminDashboard;