// auth hook
import { useAuth } from "../hooks/useAuth"
// router redirect component
import { Navigate } from "react-router"
// react
import React from 'react'
// spinner component
import LoadingSpinner from '../../../components/LoadingSpinner'

// route protection wrapper
const Protected = ({ children }) => {
    // get user and loading status from auth
    const { loading, user, loggingOut } = useAuth()

    if (loggingOut) return null

    // show loading spinner while checking auth cookie
    if (loading) {
        return <LoadingSpinner message="Loading your session..." fullscreen />
    }

    // redirect to login if unauthenticated
    if (!user) {
        if (sessionStorage.getItem("stackmatch_logging_out") === "1") {
            return null
        }
        return <Navigate to={'/login'} />
    }

    // render protected child routes
    return children
}

// export protected wrapper
export default Protected
