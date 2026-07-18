import winston from "winston";
import path from "path";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, "../../logs/security.log"),
        }),
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    ],
});

// Helper for consistent, structured security event logging.
// IMPORTANT: never pass passwords, tokens, or other secrets into
// the `details` object — only log identifying/contextual info.
export const logSecurityEvent = (
    event: string,
    details: Record<string, any>
) => {
    logger.info({ event, ...details });
};

export default logger;