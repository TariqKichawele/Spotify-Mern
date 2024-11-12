import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";

interface AuthStore {
    isAdmin: boolean;
    isLoading: boolean;
    error: string | null;

    checkAdminStatus: () => Promise<void>;
    reset: () => void;
}


export const useAuthStore = create<AuthStore>((set) => ({
    isAdmin: false,
    isLoading: false,
    error: null,

    checkAdminStatus: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/admin/check");
            set({ isAdmin: response.data.admin });
        } catch (error: unknown) {
            console.log(error, "Error in checkAdminStatus");
            if (error instanceof Error) {
                set({ error: error.message });
            } else {
                set({ error: "An unknown error occurred" });
            }
        } finally {
            set({ isLoading: false });
        }
    },

    reset: () => {
        set({ isAdmin: false, isLoading: false, error: null });
    }
}));