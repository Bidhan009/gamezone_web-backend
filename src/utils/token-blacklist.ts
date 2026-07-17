// Simple in-memory token blacklist for logout revocation.
// NOTE: For production/multi-server deployments, this should be
// backed by Redis or a shared store instead of in-memory storage,
// since this approach only works for a single server instance.

const blacklistedTokens = new Set<string>();

export const blacklistToken = (token: string): void => {
    blacklistedTokens.add(token);
};

export const isTokenBlacklisted = (token: string): boolean => {
    return blacklistedTokens.has(token);
};