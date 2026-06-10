import jwt from "jsonwebtoken";
import {User} from "../schema/auth.js"

export const authenticate = async (req, res, next) => {
    try {
        const token =
            req.cookies?.token ||
            (
                req.headers.authorization?.startsWith("Bearer ")
                    ? req.headers.authorization.split(" ")[1]
                    : null
            );

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(
            decoded.userId || decoded.id
        ).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account is deactivated"
            });
        }

        if (user.isLocked()) {
            return res.status(403).json({
                success: false,
                message: "Account is locked"
            });
        }

        req.user = user;
        req.userId = user._id;

        next();

    } catch (error) {

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Authentication failed"
        });
    }
};




export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({
                success: false,
                message: "Access denied. User not authenticated.",
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Insufficient permissions.",
            });
        }

        next();
    };
};

