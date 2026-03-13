import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

export const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ msg: 'Unauthorized' });
        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({ msg: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};

export const auth = authenticate; // Support legacy names
