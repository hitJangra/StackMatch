import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import Layout from "./components/Layout";
import Home from "./features/interview/pages/Home";
import Jobs from "./features/interview/pages/Jobs";
import History from "./features/interview/pages/History";
import Settings from "./features/interview/pages/Settings";
import Interview from "./features/interview/pages/Interview";
import NotFound from "./components/NotFound";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/",
        element: (
            <Protected>
                <Layout />
            </Protected>
        ),
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: "jobs",
                element: <Jobs />
            },
            {
                path: "history",
                element: <History />
            },
            {
                path: "settings",
                element: <Settings />
            },
            {
                path: "interview/:interviewId",
                element: <Interview />
            }
        ]
    },
    {
        path: "*",
        element: <NotFound />
    }
]);
