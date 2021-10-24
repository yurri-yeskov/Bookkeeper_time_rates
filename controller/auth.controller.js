const linkConfig = require("../config/links.config");
const jwt = require("jsonwebtoken");

exports.tokenVeryfy = (token) => {

    const token_expiration = linkConfig.TOKEN_EXPIRATION;

    const r_key = token.substring(0, 4);
    const r_token = token.substring(4);
    const decoded = jwt.verify(r_token, r_key);
    
    const now = new Date();
    if (!decoded.timestamp) return false;
    const token_timestamp = new Date(decoded.timestamp * 1000);
    
    if (now - token_timestamp > parseInt(token_expiration)) return false;
    return decoded;
};

exports.adminEmails = () => {
    return ['tk@ebogholderen.dk', 'tr@ebogholderen.dk', 'thra@c.dk', 'yurii@gmail.com'];
}