import { useContext, useEffect } from "react"
import { AuthContext } from "../auth.context"
import { getMe, login, logout, register } from "../services/auth.api"


export const useAuth = () => {

    const context = useContext(AuthContext)

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }

    const { user, setUser, loading, setLoading } = context

    // Fetch current logged-in user on mount (runs once per AuthProvider)
    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true)
            try {
                const data = await getMe()
                if (data?.user) {
                    setUser(data.user)
                } else {
                    setUser(null)
                }
            } catch {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [])

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            if (data?.user) {
                setUser(data.user)
                return { success: true }
            }
            return { success: false, message: data?.message || "Login failed" }
        } catch (err) {
            const message = err?.response?.data?.message || "Login failed"
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            if (data?.user) {
                setUser(data.user)
                return { success: true }
            }
            return { success: false, message: data?.message || "Registration failed" }
        } catch (err) {
            const message = err?.response?.data?.message || "Registration failed"
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            await logout()
        } finally {
            setUser(null)
        }
    }

    return { user, loading, handleLogin, handleRegister, handleLogout }
}