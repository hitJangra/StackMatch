// react lazy and suspense for route-level code splitting
import React, { lazy, Suspense } from "react";
// react-router browser router helper
import { createBrowserRouter } from "react-router";
// auth pages
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
// protected route wrapper
import Protected from "./features/auth/components/Protected";
// main shell layout (sidebar + header)
import Layout from "./components/Layout";
// home landing page (kept eager for immediate first paint)
import Home from "./features/interview/pages/Home";
// 404 page
import NotFound from "./components/NotFound";
// loading spinner fallback for lazy chunks
import Spinner from "./components/Spinner";

// lazy-loaded feature routes to split heavy dependencies (e.g. @react-pdf/renderer)
const Jobs = lazy(() => import("./features/interview/pages/Jobs"));
const Kanban = lazy(() => import("./features/interview/pages/Kanban"));
const History = lazy(() => import("./features/interview/pages/History"));
const Settings = lazy(() => import("./features/interview/pages/Settings"));
const Interview = lazy(() => import("./features/interview/pages/Interview"));

// helper wrapper to render lazy components with suspense fallback
const withSuspense = (Component, message) => (
    <Suspense fallback={<Spinner message={message || "Loading..."} />}>
        <Component />
    </Suspense>
);

// define browser routing table
export const router = createBrowserRouter([
    // public login page
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
        path: "/",
        element: (
            // guard against unauthenticated visits
            <Protected>
                {/* protected layout shell */}
                <Layout />
            </Protected>
        ),
        children: [
            // dashboard / resume scanner home
            {
                index: true,
                element: <Home />
            },
            // job board recommendation feed (code-split)
            {
                path: "jobs",
                element: withSuspense(Jobs, "Loading jobs pipeline...")
            },
            // application pipeline kanban board (code-split)
            {
                path: "kanban",
                element: withSuspense(Kanban, "Loading application tracker...")
            },
            // user scan history (code-split)
            {
                path: "history",
                element: withSuspense(History, "Loading scan history...")
            },
            // user settings and api keys (code-split)
            {
                path: "settings",
                element: withSuspense(Settings, "Loading settings...")
            },
            // specific interview prep report view (code-split: isolates @react-pdf)
            {
                path: "interview/:interviewId",
                element: withSuspense(Interview, "Loading interview report...")
            }
        ]
    },
    // catch-all route for missing pages
    {
        path: "*",
        element: <NotFound />
    }
]);
