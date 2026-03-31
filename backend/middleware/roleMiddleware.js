const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            console.warn('[Role Middleware] ❌ No user detected. Protected route access denied.');
            return res.status(401).json({ message: 'Unauthorized: No user session found.' });
        }

        const userRole = req.user.role?.toLowerCase();
        const permitted = allowedRoles.map(r => r.toLowerCase());

        if (!permitted.includes(userRole)) {
            console.warn(`[Role Middleware] ❌ Access Revoked for Role: ${userRole}. Required: ${allowedRoles.join(' or ')}`);
            return res.status(403).json({ 
                message: 'Access Denied: You do not have the required permissions tier for this node.',
                requiredRoles: allowedRoles
            });
        }

        console.log(`[Role Middleware] ✅ Access Granted for Role: ${userRole}`);
        next();
    };
};

export default roleMiddleware;
