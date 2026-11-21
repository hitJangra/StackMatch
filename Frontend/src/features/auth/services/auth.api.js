// shared axios client (reads VITE_API_BASE_URL, withCredentials, 100s timeout)
import { api } from "../../../lib/axios";

// register a new account
export async function register({ username, email, password }) {
    // send signup request
    const response = await api.post('/api/auth/register', {
        username, email, password
    })
    return response.data
}

// sign in existing user
export async function login({ email, password }) {
    // send login credentials
    const response = await api.post("/api/auth/login", {
        email, password
    })
    return response.data
}

// sign out user and invalidate cookie
export async function logout() {
    // send logout request
    const response = await api.get("/api/auth/logout")
    return response.data
}

// fetch authenticated user details
export async function getMe() {
    // query session endpoint
    const response = await api.get("/api/auth/get-me")
    return response.data
}

// update account password
export async function updatePassword({ currentPassword, newPassword }) {
    // submit old and new password
    const response = await api.put("/api/auth/update-password", {
        currentPassword, newPassword
    })
    return response.data
}
