import { createContext, useContext, useState, useCallback } from "react"
import "./toast.scss"

const ToastContext = createContext()

let toastId = 0

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = "info", duration = 3500) => {
        const id = ++toastId
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, duration)
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`toast toast--${t.type}`}>
                        <span className="toast__msg">{t.message}</span>
                        <button className="toast__close" onClick={() => removeToast(t.id)}>✕</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) throw new Error("useToast must be used within a ToastProvider")
    return context
}
