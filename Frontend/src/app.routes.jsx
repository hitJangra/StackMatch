// react-router browser router helper
import { createBrowserRouter } from "react-router";
// auth pages
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
// protected route wrapper
import Protected from "./features/auth/components/Protected";
// main shell layout with navbar
import Layout from "./components/Layout";
// feature pages
import Home from "./features/interview/pages/Home";
import Jobs from "./features/interview/pages/Jobs";
import History from "./features/interview/pages/History";
import Settings from "./features/interview/pages/Settings";
import Interview from "./features/interview/pages/Interview";
// 404 page
import NotFound from "./components/NotFound";

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
                {/* shared navbar + content layout */}
                <Layout />
            </Protected>
        ),
        children: [
            // dashboard / resume scanner home
            {
                index: true,
                element: <Home />
            },
            // job board recommendation feed
            {
                path: "jobs",
                element: <Jobs />
            },
            // user scan history
            {
                path: "history",
                element: <History />
            },
            // user settings and api keys
            {
                path: "settings",
                element: <Settings />
            },
            // specific interview prep report view
            {
                path: "interview/:interviewId",
                element: <Interview />
            }
        ]
    },
    // catch-all route for missing pages
    {
        path: "*",
        element: <NotFound />
    }
]);
