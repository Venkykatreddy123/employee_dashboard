import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log(`[Middleware] Incoming Request: ${req.method} ${req.originalUrl}`);
    console.log(`[Middleware] Auth Header: ${authHeader || 'Missing'}`);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('[Middleware] ❌ Access Denied: No Bearer Token Provided');
        return res.status(401).json({ message: 'Access Denied: No Token Provided!' });
    }

    const token = authHeader.split(' ')[1];

    if (!token || token === 'null' || token === 'undefined') {
        console.warn(`[Middleware] ❌ Access Denied: Invalid token string: ${token}`);
        return res.status(401).json({ message: 'Access Denied: Invalid Token Format!' });
    }

    try {
        const secret = process.env.JWT_SECRET || 'supersecretkey123';
        const decoded = jwt.verify(token, secret);
        console.log(`[Middleware] ✅ Token Verified for User: ${decoded.email} (${decoded.role})`);
        req.user = decoded; 
        next();
    } catch (err) {
        console.error(`[Middleware] ❌ Token Verification Failed: ${err.message}`);
        res.status(403).json({ message: 'Invalid or Expired Token!', error: err.message });
    }
};

export default authMiddleware;
