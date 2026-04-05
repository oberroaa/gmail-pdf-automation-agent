import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Generar un JWT
export const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'tu_secreto_super_seguro_123',
        { expiresIn: '30d' }
    );
};

// Middleware para proteger rutas (Verificar Token)
export const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_super_seguro_123');
            req.user = decoded;
            return next();
        } catch (error) {
            return res.status(401).json({ error: 'No autorizado, token fallido' });
        }
    }
    if (!token) {
        return res.status(401).json({ error: 'No autorizado, no hay token' });
    }
};

// Middleware para autorizar por ROL
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: `El rol ${req.user.role} no tiene permiso para esta acción` });
        }
        next();
    };
};
