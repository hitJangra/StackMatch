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
    const { loading, setLoading, report, setReport, reports, setReports } = context

    // scan resume and generate full interview prep report
    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        // start loading spinner
        setLoading(true)
        try {
            // call backend api
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            // save report in context
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            console.error("generateReport error:", error)
            throw error
        } finally {
            // stop spinner
            setLoading(false)
        }
    }

    // fetch a single report by id
    const getReportById = async (interviewId) => {
        setLoading(true)
        try {
            // query report endpoint
            const response = await getInterviewReportById(interviewId)
            // set active report
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
            // get list of reports
            const response = await getAllInterviewReports()
            // store reports array
            setReports(response.interviewReports)
            return response.interviewReports
        } catch (error) {
            console.error("getReports error:", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    // download tailored resume pdf
    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        try {
            // fetch binary pdf stream from api
            const response = await generateResumePdf({ interviewReportId })
            // create blob url
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            // create temporary download link
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            // trigger browser download
            link.click()
            // clean up dom and blob url
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error("getResumePdf error:", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    // return state and methods
    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }
}
