// react hooks
import { useContext } from "react"
import { useNavigate } from "react-router"
// auth context
import { AuthContext } from "../auth.context"
// auth api service functions — getMe is no longer needed here
// since the session check now lives in AuthProvider
import { login, logout, register, deleteAccount } from "../services/auth.api"

export function clearUserSpecificState() {
    try {
        const theme = localStorage.getItem("theme")
        const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
        keys.forEach((key) => {
            if (key && key !== "theme") localStorage.removeItem(key)
        })
        if (theme) localStorage.setItem("theme", theme)
        sessionStorage.clear()
        window.dispatchEvent(new Event("stackmatch-clear-resume"))
    } catch (error) {
        console.error("Failed to clear user-specific state:", error)
    }
}

// custom hook providing authentication state and actions
export const useAuth = () => {
    // consume auth context
    const context = useContext(AuthContext)
    const navigate = useNavigate()

    // enforce provider usage
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }

    // destructure state and setters
    const { user, setUser, loading, setLoading, setLoggingOut } = context

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
                clearUserSpecificState()
                setUser(data.user)
                return { success: true }
            }
            return { success: false, message: data?.message || "Login failed" }
        } catch (err) {
            // extract error message from response
            const status = err?.response?.status
            const message = status === 429
                ? "Too many login attempts. Please try again after 15 minutes."
                : err?.response?.data?.message || "Login failed"
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
                clearUserSpecificState()
                setUser(data.user)
                return { success: true }
            }
            return { success: false, message: data?.message || "Registration failed" }
        } catch (err) {
            // extract error message
            const status = err?.response?.status
            const message = status === 429
                ? "Too many registration attempts. Please try again later."
                : err?.response?.data?.message || "Registration failed"
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }

    // action to log out and clear state
    const handleLogout = async () => {
        setLoggingOut?.(true)
        try {
            // call logout endpoint to blacklist token
            await logout()
        } finally {
            navigate("/", { replace: true })
            clearUserSpecificState()
            window.setTimeout(() => setUser(null), 50)
            window.setTimeout(() => setLoggingOut?.(false), 250)
        }
    }

    const handleDeleteAccount = async () => {
        setLoggingOut?.(true)
        try {
            await deleteAccount()
            navigate("/", { replace: true })
            clearUserSpecificState()
            window.setTimeout(() => setUser(null), 50)
            window.setTimeout(() => setLoggingOut?.(false), 250)
            return { success: true }
        } catch (err) {
            setLoggingOut?.(false)
            return {
                success: false,
                message: err?.response?.data?.message || "Could not delete account."
            }
        }
    }

    // return state and auth handlers
    return { user, loading, handleLogin, handleRegister, handleLogout, handleDeleteAccount }
}
