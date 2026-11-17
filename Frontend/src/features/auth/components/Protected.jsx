// auth hook
import { useAuth } from "../hooks/useAuth"
// router redirect component
import { Navigate } from "react-router"
// react
import React from 'react'
// spinner component
import Spinner from '../../../components/Spinner'

// route protection wrapper
const Protected = ({ children }) => {
    // get user and loading status from auth
    const { loading, user } = useAuth()

    // show loading spinner while checking auth cookie
    if (loading) {
        return <Spinner message="Loading your session..." />
    }

    // redirect to login if unauthenticated
    if (!user) {
        return <Navigate to={'/login'} />
    }

    // render protected child routes
    return children
}

// export protected wrapper
export default Protected
