import { RouterProvider } from "react-router"
import { router } from "./app.routes.jsx"
import { AuthProvider } from "./features/auth/auth.context.jsx"
import { InterviewProvider } from "./features/interview/interview.context.jsx"
import { ThemeProvider } from "./features/theme/theme.context.jsx"
import { ToastProvider } from "./components/Toast.jsx"

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <InterviewProvider>
            <RouterProvider router={router} />
          </InterviewProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
