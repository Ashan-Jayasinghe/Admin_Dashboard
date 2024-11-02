import jwt from 'jsonwebtoken';
import { isTokenRevoked } from '../utils/tokenManagement.js'; // Adjust the import according to your setup

export const verifyToken = async (req, res, next) => {
const authHeader = req.headers.authorization;
const token = authHeader && authHeader.split(' ')[1];

if (!token) {
return res.status(401).json({ status: 'error', message: 'Access denied, no token provided' });
}

// Check if the token is revoked
if (await isTokenRevoked(token)) {
return res.status(401).json({ status: 'error', message: 'Token is invalid or has been logged out' });
}

try {
const decoded = jwt.verify(token, process.env.JWT_SECRET);
console.log(decoded);
req.user = decoded;
next();
} catch (error) {
console.error("Token verification error:", error.message);
return res.status(401).json({ status: 'error', message: 'Access denied, invalid or malformed token' });
}
};