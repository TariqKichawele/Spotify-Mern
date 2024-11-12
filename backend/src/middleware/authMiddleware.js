import { clerkClient } from "@clerk/express";

export const protectRoute = async (req, res, next) => {
    if(!req.auth.userId) {
        return res.status(401).json({ error: "Unauthorized" })
    }
    next();
};

export const requireAdmin = async (req, res, next) => {
    try {
        const currentUser = await clerkClient.users.getUser(req.auth.userId);
        const isAdmin = process.env.ADMIN_EMAIL === currentUser.primaryEmailAddress?.emailAddress;

        if(!isAdmin) {
            return res.status(401).json({ error: "Unauthorized - yoU are not an admin" })
        }

        next();
    } catch (error) {
        next(error);
    }
}
