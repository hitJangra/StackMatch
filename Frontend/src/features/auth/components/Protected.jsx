import { useAuth } from "../hooks/useAuth"
import { Navigate } from "react-router"
import React from 'react'
import Spinner from '../../../components/Spinner'

const Protected = ({ children }) => {
    const { loading, user } = useAuth()

    if (loading) {
        return <Spinner message="Loading your session..." />
    }

    if (!user) {
        return <Navigate to={'/login'} />
    }

    return children
}

export default Protected