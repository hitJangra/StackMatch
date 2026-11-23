// react context and state
import { createContext, useEffect, useState } from "react";

// interview context instance
export const InterviewContext = createContext()

// provider component managing interview and report state
export const InterviewProvider = ({ children }) => {
    // global loading indicator
    const [loading, setLoading] = useState(false)
    // currently viewed report
    const [report, setReport] = useState(null)
    // list of all past reports
    const [reports, setReports] = useState([])
    // actual uploaded resume shared across Home and Saved Jobs Prep
    const [resumeFile, setResumeFile] = useState(null)

    useEffect(() => {
        const clearResume = () => setResumeFile(null)
        window.addEventListener("stackmatch-clear-resume", clearResume)
        return () => window.removeEventListener("stackmatch-clear-resume", clearResume)
    }, [])

    return (
        // expose state and setters to child components
        <InterviewContext.Provider value={{ loading, setLoading, report, setReport, reports, setReports, resumeFile, setResumeFile }}>
            {children}
        </InterviewContext.Provider>
    )
}
