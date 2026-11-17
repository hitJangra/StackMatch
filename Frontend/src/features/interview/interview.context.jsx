// react context and state
import { createContext, useState } from "react";

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

    return (
        // expose state and setters to child components
        <InterviewContext.Provider value={{ loading, setLoading, report, setReport, reports, setReports }}>
            {children}
        </InterviewContext.Provider>
    )
}
