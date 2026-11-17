// react context and hooks
import { createContext, useContext, useState, useCallback } from "react"
// toast styles
import "./toast.scss"

// context instance for toasts
const ToastContext = createContext()

// auto-incrementing id for toast notifications
let toastId = 0

// toast provider component wrapping tree
export const ToastProvider = ({ children }) => {
    // array of active toast notifications
    const [toasts, setToasts] = useState([])

    // method to show a new toast message
    const addToast = useCallback((message, type = "info", duration = 3500) => {
        // generate unique id
        const id = ++toastId
        // append new toast to list
        setToasts(prev => [...prev, { id, message, type }])
        // automatically dismiss after duration ms
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, duration)
    }, [])

    // manually dismiss toast by id
    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return (
        // provide addToast function to consumers
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {/* toast container fixed on screen */}
            <div className="toast-container">
                {toasts.map(t => (
                    // individual toast banner
                    <div key={t.id} className={`toast toast--${t.type}`}>
                        {/* message text */}
                        <span className="toast__msg">{t.message}</span>
                        {/* manual close button */}
                        <button className="toast__close" onClick={() => removeToast(t.id)}>✕</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

// custom hook to access addToast
export const useToast = () => {
    // consume toast context
    const context = useContext(ToastContext)
    // ensure within provider
    if (!context) throw new Error("useToast must be used within a ToastProvider")
    return context
}
