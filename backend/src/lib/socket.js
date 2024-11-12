import { Server } from 'socket.io';
import { Message } from '../models/messageModel.js';

export const initializeSocket = (server) => {
    // Create a new instance of Socket.IO server
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:3000', // Allow requests from this origin
            credentials: true, // Allow credentials to be sent
        }
    });

    // Maps to track user sockets and their activities
    const userSockets = new Map();
    const userActivities = new Map();

    // Listen for new connections
    io.on('connection', (socket) => {
        // Handle user connection event
        socket.on("user_connected", (userId) => {
            userSockets.set(userId, socket.id); // Store user's socket ID
            userActivities.set(userId, 'Idle'); // Initialize user activity status

            // Notify all clients about the new user connection
            io.emit("user_connected", userId);

            // Send the list of online users to the newly connected user
            socket.emit("users_online", Array.from(userSockets.keys()));

            // Emit the current activities of all users
            io.emit('activites', Array.from(userActivities.entries()));
        });

        // Handle activity update event
        socket.on("update_activitiy", ({ userId, activitiy }) => {
            userActivities.set(userId, activitiy); // Update user's activity status
            io.emit("activity_updated", { userId, activitiy }) // Notify all clients about the activity update
        });

        // Handle message sending event
        socket.on("send_message", async (data) => {
            try {
                const { senderId, receiverId, content } = data;

                // Create a new message in the database
                const message = await Message.create({
                    senderId,
                    receiverId,
                    content
                });

                // Get the receiver's socket ID and send the message if online
                const receiverSocketId = userSockets.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("receive_message", message);
                };

                // Acknowledge the sender that the message has been sent
                socket.emit("message_sent", message);
            } catch (error) {
                console.error("Message error", error);
                socket.emit("message_error", error.message) // Notify sender of the error
            }
        });

        // Handle user disconnection event
        socket.on("disconnect", () => {
            let disconnectedUserId;

            // Find and remove the disconnected user from the maps
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId;
                    userSockets.delete(userId);
                    userActivities.delete(userId);
                    break;
                }
            }

            // Notify all clients about the user disconnection
            if (disconnectedUserId) {
                io.emit("user_disconnected", disconnectedUserId);
            }
        })
    });
}