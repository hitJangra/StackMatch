// helper to construct or return the appropriate linkedin job application url
export const getLinkedInJobUrl = (jobOrTitle, company = "") => {
    // if passed a job object with a valid existing web link
    if (jobOrTitle && typeof jobOrTitle === "object") {
        const directUrl = jobOrTitle.url || jobOrTitle.jobUrl || jobOrTitle.link;
        if (directUrl && typeof directUrl === "string" && directUrl.startsWith("http") && directUrl !== "#") {
            return directUrl;
        }
        const title = jobOrTitle.title || jobOrTitle.positionName || "Software Engineer";
        const comp = jobOrTitle.company && jobOrTitle.company !== "N/A" ? ` ${jobOrTitle.company}` : "";
        return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(String(title).trim() + comp)}`;
    }

    // if passed a raw string title
    const title = jobOrTitle || "Software Engineer";
    const comp = company && company !== "N/A" ? ` ${company}` : "";
    return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(String(title).trim() + comp)}`;
};
