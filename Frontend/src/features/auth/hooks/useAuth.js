// react hooks
import { useContext } from "react"
// auth context
import { AuthContext } from "../auth.context"
// auth api service functions — getMe is no longer needed here
// since the session check now lives in AuthProvider
import { login, logout, register } from "../services/auth.api"

// custom hook providing authentication state and actions
export const useAuth = () => {
    // consume auth context
    const context = useContext(AuthContext)

    // enforce provider usage
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }

    // destructure state and setters
    const { user, setUser, loading, setLoading } = context

    // NOTE: the getMe() session check has been moved into AuthProvider
    // so it runs exactly once at app startup — removing it from here
    // prevents duplicate fetches when multiple components call useAuth()

    // action to authenticate with email and password
    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            // call login api
            const data = await login({ email, password })
            // update state on success
            if (data?.user) {
                setUser(data.user)
                return { success: true }
            }
            return { success: false, message: data?.message || "Login failed" }
        } catch (err) {
            // extract error message from response
            const message = err?.response?.data?.message || "Login failed"
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }

    // action to register a new user
    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            // call register api
            const data = await register({ username, email, password })
            // update state on success
            if (data?.user) {
                setUser(data.user)
                return { success: true }
            }
            return { success: false, message: data?.message || "Registration failed" }
        } catch (err) {
            // extract error message
            const message = err?.response?.data?.message || "Registration failed"
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }

    // action to log out and clear state
    const handleLogout = async () => {
        try {
            // call logout endpoint to blacklist token
            await logout()
        } finally {
            // clear user in state
            setUser(null)
        }
    }

    // return state and auth handlers
    return { user, loading, handleLogin, handleRegister, handleLogout }
}
