const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const COOKIE_NAME = "billforge_token";

function getJwtSecret() {
  return process.env.JWT_SECRET || "change-this-in-production";
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      clientId: user.client_id || null,
      companyId: user.company_id || null,
      branchId: user.branch_id || null,
    },
    getJwtSecret(),
    {
      expiresIn: "7d",
    }
  );
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

function setAuthCookie(response, token) {
  response.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookie(response) {
  response.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function extractToken(request) {
  const cookieToken = request.cookies?.[COOKIE_NAME];
  if (cookieToken) return cookieToken;

  const authHeader = request.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

function requireAuth(request, response, next) {
  try {
    const token = extractToken(request);
    if (!token) {
      return response.status(401).json({ message: "Authentication required" });
    }
    request.auth = verifyToken(token);
    return next();
  } catch (error) {
    return response.status(401).json({ message: "Invalid or expired token" });
  }
}

function requireRole(...roles) {
  return (request, response, next) => {
    if (!request.auth || !roles.includes(request.auth.role)) {
      return response.status(403).json({ message: "Access denied" });
    }
    return next();
  };
}

module.exports = {
  COOKIE_NAME,
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
  requireRole,
};
