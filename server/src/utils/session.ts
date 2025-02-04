import type { Store } from "express-session";
import { type IncomingHttpHeaders } from "http";
import logger from "./logger";

const SESSION_COOKIE_KEY = "connect.sid";

export const getCookies = (headers: IncomingHttpHeaders) => {
  const cookieString = decodeURI(headers["cookie"] as string);
  if (!cookieString) {
    return [];
  }
  return cookieString.split(/[;,]/).filter(Boolean);
};

export const getSessionId = (cookies: string[]) => {
  let sessionId = null;
  if (cookies?.length === 0) {
    return sessionId;
  }
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=").map((part) => part.trim());

    // Only add to Map if both key and value exist
    if (SESSION_COOKIE_KEY === key && value) {
      // First decode the URL-encoded session ID
      const decodedSessionId = decodeURIComponent(value);
      // Remove 's:' prefix and get everything before the dot
      const cleanSessionId = decodedSessionId.slice(2).split(".")[0];
      sessionId = cleanSessionId;
    }
  }

  return sessionId;
};

// Create a helper function to get user from session
export const getUserId = (
  sessionId: string,
  store: Store
): Promise<string | null> => {
  return new Promise((resolve) => {
    if (!store) {
      logger.error("No session store found in middleware");
      resolve(null);
      return;
    }

    store.get(sessionId, (err: any, session: any) => {
      if (err || !session || !session.passport?.user) {
        resolve(null);
        return;
      }
      resolve(session.passport.user);
    });
  });
};
