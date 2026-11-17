// react context and state
import { createContext, useState, useEffect } from "react";
// auth api service to verify existing session
import { getMe } from "./services/auth.api";

// auth context creation
export const AuthContext = createContext()

// provider component that holds logged-in user state
// and owns the initial session check so it runs exactly once
// regardless of how many components call useAuth()
export const AuthProvider = ({ children }) => { 
    // current authenticated user profile object
    const [user, setUser] = useState(null)
    // loading state while verifying existing session — starts true
    // so Protected never renders child routes before the check completes
    const [loading, setLoading] = useState(true)

    // run the session check once when the app first mounts
    // keeping it here (not in useAuth) means it fires exactly once
    // even if multiple components consume useAuth simultaneously
    useEffect(() => {
        getMe()
            .then(data => setUser(data?.user ?? null))
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [])

    return (
        // pass down user and loading flags with their setters
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }} >
            {children}
        </AuthContext.Provider>
    )
}
