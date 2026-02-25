import * as fs from 'fs';
import * as path from 'path';

// Logs high-risk or low-confidence responses to a file without interrupting the user response

const HIGH_RISK_KEYWORDS = ['murder', 'suicide', 'weapon', 'bomb', 'rape', 'terrorism'];

export const flagResponseIfNeeded = async (
    query: string,
    response: any,
    confidenceScore: number
): Promise<void> => {
    const queryLower = query.toLowerCase();

    const isHighRisk = HIGH_RISK_KEYWORDS.some(keyword => queryLower.includes(keyword));
    const isLowConfidence = confidenceScore < 0.6;

    if (isHighRisk || isLowConfidence) {
        const flaggedEntry = {
            query,
            response,
            confidence_score: confidenceScore,
            timestamp: new Date().toISOString(),
            reason: isHighRisk ? 'High Risk Keyword Match' : 'Low Confidence Score'
        };

        try {
            // In a real scenario, this would write to a DB. We'll write to a local log file.
            const logDir = path.join(__dirname, '../../data');
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }

            const logFile = path.join(logDir, 'flagged_responses.json');
            let currentLogs: any[] = [];

            if (fs.existsSync(logFile)) {
                const fileData = fs.readFileSync(logFile, 'utf8');
                try {
                    currentLogs = JSON.parse(fileData);
                } catch (e) {
                    // Ignore invalid JSON in file and override
                }
            }

            currentLogs.push(flaggedEntry);
            fs.writeFileSync(logFile, JSON.stringify(currentLogs, null, 2), 'utf8');

            console.log(`[FLAG] Response flagged. Reason: ${flaggedEntry.reason}. Score: ${confidenceScore}`);
        } catch (err: any) {
            console.error("[FLAG_ERROR] Failed to save flagged response:", err.message);
        }
    }
};
