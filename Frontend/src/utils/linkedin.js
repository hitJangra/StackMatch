// helper to construct or return the appropriate linkedin job application url
export const getLinkedInJobUrl = (jobOrTitle) => {
    if (!jobOrTitle || typeof jobOrTitle !== "object") return "";
    const directUrl =
        jobOrTitle.applyLink ||
        jobOrTitle.applicationUrl ||
        jobOrTitle.jobUrl ||
        jobOrTitle.url ||
        jobOrTitle.link ||
        "";
    return typeof directUrl === "string" &&
        directUrl.startsWith("http") &&
        directUrl !== "#"
        ? directUrl
        : "";
};
