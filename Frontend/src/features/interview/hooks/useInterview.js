// interview api endpoints
import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
// react context hook
import { useContext } from "react"
// interview context
import { InterviewContext } from "../interview.context"

// custom hook for interview state and actions
export const useInterview = () => {
    // consume interview context
    const context = useContext(InterviewContext)

    // ensure called inside provider
    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    // extract state and state setters
    const { loading, setLoading, report, setReport, reports, setReports, resumeFile, setResumeFile } = context

    // scan resume and generate full interview prep report
    const generateReport = async ({ jobDescription, resumeFile }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, resumeFile })
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            console.error("generateReport error:", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    // fetch a single report by id
    const getReportById = async (interviewId) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            console.error("getReportById error:", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    // fetch all reports for logged-in user
    const getReports = async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            setReports(response.interviewReports)
            return response.interviewReports
        } catch (error) {
            console.error("getReports error:", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    // download tailored resume pdf via client-side @react-pdf/renderer
    // NOTE: intentionally does NOT touch shared context loading — InterviewReport.jsx
    // manages its own local `downloading` state so the report page never unmounts.
    const getResumePdf = async (interviewReportId, reportData) => {
        try {
            await generateResumePdf({ 
                interviewReportId, 
                reportData: reportData || report 
            })
        } catch (error) {
            console.error("getResumePdf error:", error)
            throw error
        }
    }

    return {
        loading,
        report,
        reports,
        resumeFile,
        setResumeFile,
        generateReport,
        getReportById,
        getReports,
        getResumePdf
    }
}
