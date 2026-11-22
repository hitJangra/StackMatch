// react lazy and suspense for route-level code splitting
import React, { lazy, Suspense } from "react";
// react-router browser router helper
import { createBrowserRouter, Navigate } from "react-router";
// auth pages
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
// protected route wrapper
import Protected from "./features/auth/components/Protected";
// main shell layout (sidebar + header)
import AppLayout from "./components/AppLayout";
// home landing page (kept eager for immediate first paint)
import Home from "./features/interview/pages/Home";
// 404 page
import NotFound from "./components/NotFound";
// loading spinner fallback for lazy chunks
import LoadingSpinner from "./components/LoadingSpinner";
import Landing from "./features/landing/Landing";

// lazy-loaded feature routes to split heavy dependencies (e.g. @react-pdf/renderer)
const Jobs = lazy(() => import("./features/interview/pages/Jobs"));
const SavedJobs = lazy(() => import("./features/interview/pages/SavedJobs"));
const Settings = lazy(() => import("./features/interview/pages/Settings"));
const InterviewReport = lazy(() => import("./features/interview/pages/InterviewReport"));

// helper wrapper to render lazy components with suspense fallback
const withSuspense = (Component, message) => (
    <Suspense fallback={<LoadingSpinner message={message || "Loading..."} />}>
        <Component />
    </Suspense>
);

// define browser routing table
export const router = createBrowserRouter([
    // public product landing page
    {
        path: "/",
        element: <Landing />
    },
    {
        path: "/login",
        element: <Login />
    },
    // public registration page
    {
        path: "/register",
        element: <Register />
    },
    // protected application routes (requires login)
    {
        path: "/home",
        element: (
            // guard against unauthenticated visits
            <Protected>
                {/* protected layout shell */}
                <AppLayout />
            </Protected>
        ),
        children: [
            // dashboard / resume scanner home
            {
                index: true,
                element: <Home />
            }
        ]
    },
    {
        path: "/jobs",
        element: <Protected><AppLayout /></Protected>,
        children: [{ index: true, element: withSuspense(Jobs, "Loading jobs pipeline...") }]
    },
    {
        path: "/saved-jobs",
        element: <Protected><AppLayout /></Protected>,
        children: [{ index: true, element: withSuspense(SavedJobs, "Loading saved jobs...") }]
    },
    {
        path: "/settings",
        element: <Protected><AppLayout /></Protected>,
        children: [{ index: true, element: withSuspense(Settings, "Loading settings...") }]
    },
    {
        path: "/interview/:interviewId",
        element: <Protected><AppLayout /></Protected>,
        children: [{ index: true, element: withSuspense(InterviewReport, "Loading interview report...") }]
    },
    { path: "/dashboard", element: <Navigate to="/home" replace /> },
    { path: "/kanban", element: <Navigate to="/saved-jobs" replace /> },
    { path: "/history", element: <Navigate to="/saved-jobs" replace /> },
    // catch-all route for missing pages
    {
        path: "*",
        element: <NotFound />
    }
]);
