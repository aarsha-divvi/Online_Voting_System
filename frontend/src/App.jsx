import React from "react";

import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Admin from "./pages/Admin";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Results from "./pages/Results";

import "./styles/main.css";

function VoterRoute({
                        children
                    }) {

    const token =
        localStorage.getItem("token");

    const role =
        localStorage.getItem("role");

    if (!token) {

        return (
            <Navigate
                to="/"
                replace
            />
        );
    }


    /*
     * Logged-in admin should not enter
     * the voter dashboard.
     */

    if (
        role &&
        String(role).toUpperCase() ===
        "ADMIN"
    ) {

        return (
            <Navigate
                to="/admin"
                replace
            />
        );
    }


    return children;
}

/*PROTECTED ADMIN ROUTE*/
function AdminRoute({
                        children
                    }) {

    const token =
        localStorage.getItem("token");

    const role =
        localStorage.getItem("role");

    /*
     * No login
     */

    if (!token) {

        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

     // Only ADMIN can open the admin dashboard

    if (
        String(role).toUpperCase() !==
        "ADMIN"
    ) {

        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    return children;
}

function ResultsRoute({
                          children
                      }) {

    const token =
        localStorage.getItem("token");
    if (!token) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }
    return children;
}
function App() {
    return (
        <BrowserRouter>

            <Routes>
                <Route
                    path="/"
                    element={
                        <Admin />
                    }
                />

                <Route
                    path="/register"
                    element={
                        <Register />
                    }
                />

                {/* VOTER DASHBOARD*/}

                <Route
                    path="/dashboard"
                    element={
                        <VoterRoute>
                            <Dashboard />
                        </VoterRoute>
                    }
                />
                {/* ADMIN DASHBOARD */}

                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/results"
                    element={
                        <ResultsRoute>
                            <Results />
                        </ResultsRoute>
                    }
                />
                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
export default App;