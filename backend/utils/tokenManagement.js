import db from '../config/db.js'; // Adjust this import according to your setup

// Function to revoke a token
export const revokeToken = async (token) => {
await db.query('UPDATE user_tokens SET is_revoked = TRUE WHERE token = ?', [token]);
};

// Function to check if a token is revoked
export const isTokenRevoked = async (token) => {
const [rows] = await db.query('SELECT is_revoked FROM user_tokens WHERE token = ?', [token]);
console.log(rows);


// If rows is empty, deny access
if (rows.length === 0) {
    return true; // Deny access
}

// Return true if the token is revoked, false otherwise
return rows[0].is_revoked;


};

// Function to revoke all tokens for a specific user ID
export const revokeUserTokens = async (userId) => {
await db.query('UPDATE user_tokens SET is_revoked = TRUE WHERE user_id = ?', [userId]);
};

i