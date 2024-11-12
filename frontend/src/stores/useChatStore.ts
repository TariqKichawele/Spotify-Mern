import { axiosInstance } from "@/lib/axios";
import { Message, User } from "@/types";
import { create } from "zustand";
import { io } from 'socket.io-client';

interface ChatStore {
    users: User[];
    isLoading: boolean;
    error: string | null;
    socket: any;
    isConnected: boolean;
    selectedUser: User | null;
    onlineUsers: Set<string>;
    userActivities: Map<string, string>;
    messages: Message[];

    setSelectedUser: (user: User | null) => void;
    fetchUsers: () => Promise<void>;
    initSocket: (userId: string) => void;
    disconnectSocket: () => void;
    sendMessage: (receiverId: string, senderId: string, content: string) => Promise<void>;
    fetchMessages: (userId: string) => Promise<void>;
}

const baseURL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/"

const socket = io(baseURL, {
    autoConnect: false,
    withCredentials: true,
})


export const useChatStore = create<ChatStore>((set, get) => ({
    users: [],
    isLoading: false,
    error: null,
    selectedUser: null,
    socket: socket,
    isConnected: false,
    onlineUsers: new Set(),
    userActivities: new Map(),
    messages: [],

    setSelectedUser: (user) => set({ selectedUser: user }),

    fetchUsers: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/users");
            set({ users: response.data });
        } catch (error) {
            const axiosError = error as { response?: { data: { message: string } } };
            set({ error: axiosError.response?.data.message || "An error occurred" });
        } finally {
            set({ isLoading: false });
        }
    },

    initSocket: (userId: string) => {
        if(!get().isConnected) {
            socket.auth = { userId };
            socket.connect();

            socket.emit("user_connected", userId);

            socket.on("users_online", (users: string[]) => {
                set({ onlineUsers: new Set(users) });
            });

            socket.on("activites", (activities: [string, string][]) => {
                set({ userActivities: new Map(activities) })
            });

            socket.on("user_connected", (userId: string) => {
                set((state) => ({
                    onlineUsers: new Set([ ...state.onlineUsers, userId])
                }))
            });

            socket.on("user_disconnected", (userId: string) => {
                set((state) => {
                    const newOnlineUsers = new Set(state.onlineUsers);
                    newOnlineUsers.delete(userId);
                    return { onlineUsers: newOnlineUsers }
                })
            });

            socket.on("receive_message", (message: Message) => {
                set((state) => ({
                    messages: [...state.messages, message]
                }));
            });

            socket.on("message_sent", (message: Message) => {
                set((state) => ({
                    messages: [...state.messages, message]
                }))
            });

            socket.on("activity_updated", ({ userId, activity}) => {
                set((state) => {
                    const newActivities = new Map(state.userActivities);
                    newActivities.set(userId,activity);
                    return { userActivities: newActivities }
                })
            });

            set({ isConnected: true })
        }
    },

    disconnectSocket: () => {
        if(get().isConnected) {
            socket.disconnect();
            set({ isConnected: false })
        }
    },

    sendMessage: async (receiverId: string, senderId: string, content: string) => {
        const socket = get().socket;
        if(!socket) return;

        socket.emit("send_message", { receiverId, senderId, content })
    },

    fetchMessages: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.get(`/users/messages/${userId}`);
            set({ messages: res.data })
        } catch (error) {
            const axiosError = error as { response?: { data: { message: string } } };
            set({ error: axiosError.response?.data.message || "An error occurred" });
        } finally {
            set({ isLoading: false })
        }
    }

}));