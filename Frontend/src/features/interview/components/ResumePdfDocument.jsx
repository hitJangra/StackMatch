import React from "react";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";

// Clean, ATS-compliant, monochromatic styling
const styles = StyleSheet.create({
    page: {
        paddingTop: 36,
        paddingBottom: 36,
        paddingHorizontal: 40,
        fontSize: 10,
        fontFamily: "Helvetica",
        color: "#18181b",
        lineHeight: 1.4,
    },
    header: {
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e4e4e7",
        paddingBottom: 10,
    },
    candidateName: {
        fontSize: 20,
        fontFamily: "Helvetica-Bold",
        color: "#09090b",
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    roleTitle: {
        fontSize: 12,
        color: "#52525b",
        fontFamily: "Helvetica",
        marginBottom: 6,
    },
    scoreBadge: {
        fontSize: 9,
        color: "#166534",
        backgroundColor: "#f0fdf4",
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
        alignSelf: "flex-start",
        fontFamily: "Helvetica-Bold",
    },
    section: {
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 11,
        fontFamily: "Helvetica-Bold",
        color: "#09090b",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        borderBottomWidth: 0.75,
        borderBottomColor: "#d4d4d8",
        paddingBottom: 3,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 9.5,
        color: "#27272a",
        marginBottom: 4,
        lineHeight: 1.45,
    },
    itemBlock: {
        marginBottom: 8,
    },
    itemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 2,
    },
    itemTitle: {
        fontSize: 10,
        fontFamily: "Helvetica-Bold",
        color: "#18181b",
    },
    itemSubtitle: {
        fontSize: 9,
        color: "#71717a",
        fontFamily: "Helvetica-Oblique",
    },
    badgeRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
        marginTop: 4,
    },
    skillPill: {
        fontSize: 8.5,
        backgroundColor: "#f4f4f5",
        color: "#18181b",
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 3,
        borderWidth: 0.5,
        borderColor: "#e4e4e7",
        marginRight: 4,
        marginBottom: 4,
    },
    gapPillHigh: {
        fontSize: 8.5,
        backgroundColor: "#fef2f2",
        color: "#991b1b",
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 3,
        borderWidth: 0.5,
        borderColor: "#fecaca",
        marginRight: 4,
        marginBottom: 4,
    },
    bulletPoint: {
        flexDirection: "row",
        marginBottom: 3,
        paddingLeft: 4,
    },
    bulletDot: {
        width: 10,
        fontSize: 9,
        color: "#71717a",
    },
    bulletText: {
        flex: 1,
        fontSize: 9,
        color: "#3f3f46",
        lineHeight: 1.4,
    },
    footer: {
        position: "absolute",
        bottom: 20,
        left: 40,
        right: 40,
        textAlign: "center",
        fontSize: 8,
        color: "#a1a1aa",
        borderTopWidth: 0.5,
        borderTopColor: "#f4f4f5",
        paddingTop: 6,
    }
});

// PDF Document Component
export const ResumePdfDocument = ({ report }) => {
    const title = report?.title || "Target Position";
    const matchScore = report?.matchScore ?? 85;
    const skillGaps = Array.isArray(report?.skillGaps) ? report.skillGaps : [];
    const prepPlan = Array.isArray(report?.preparationPlan) ? report.preparationPlan : [];
    const techQuestions = Array.isArray(report?.technicalQuestions) ? report.technicalQuestions : [];

    return (
        <Document title={`Resume_Audit_${title.replace(/\s+/g, "_")}`}>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.candidateName}>Target Role: {title}</Text>
                    <Text style={styles.roleTitle}>ATS Alignment & Technical Interview Profile</Text>
                    <Text style={styles.scoreBadge}>Match Score: {matchScore}% Alignment</Text>
                </View>

                {/* Target Alignment Overview */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Profile & Target Alignment</Text>
                    <Text style={styles.paragraph}>
                        This customized ATS profile has been synthesized against the target job requirements.
                        Match alignment is currently calibrated at {matchScore}%. Below is the strategic focus,
                        identified domain competencies, and critical focal points.
                    </Text>
                </View>

                {/* Skill Gaps & Critical Competencies */}
                {skillGaps.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Identified Competencies & Gaps</Text>
                        <View style={styles.badgeRow}>
                            {skillGaps.map((gap, i) => (
                                <Text 
                                    key={i} 
                                    style={gap.severity === "high" ? styles.gapPillHigh : styles.skillPill}
                                >
                                    {gap.skill} ({gap.severity})
                                </Text>
                            ))}
                        </View>
                    </View>
                )}

                {/* Technical Preparation Focus */}
                {techQuestions.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Target Technical Focus Areas</Text>
                        {techQuestions.slice(0, 3).map((q, idx) => (
                            <View key={idx} style={styles.itemBlock}>
                                <Text style={styles.itemTitle}>• {q.question}</Text>
                                <Text style={styles.paragraph}>Intention: {q.intention}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Structured Prep Roadmap */}
                {prepPlan.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recommended Execution Roadmap</Text>
                        {prepPlan.slice(0, 4).map((day, idx) => (
                            <View key={idx} style={styles.itemBlock}>
                                <Text style={styles.itemTitle}>Day {day.day}: {day.focus}</Text>
                                {day.tasks?.slice(0, 2).map((t, tidx) => (
                                    <View key={tidx} style={styles.bulletPoint}>
                                        <Text style={styles.bulletDot}>-</Text>
                                        <Text style={styles.bulletText}>{t}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                )}

                {/* Footer */}
                <Text style={styles.footer}>
                    Generated via StackMatch • ATS Optimization & Interview Strategy Suite
                </Text>
            </Page>
        </Document>
    );
};

// Client-side helper to render and trigger instant PDF download
export const downloadClientResumePdf = async (report) => {
    try {
        const doc = <ResumePdfDocument report={report} />;
        const blob = await pdf(doc).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const safeTitle = (report?.title || "Tailored_Resume").replace(/[^a-zA-Z0-9_-]/g, "_");
        link.download = `${safeTitle}_ATS_Report.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return true;
    } catch (err) {
        console.error("Client-side PDF generation failed:", err);
        throw err;
    }
};

export default ResumePdfDocument;
