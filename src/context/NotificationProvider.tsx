import React, { createContext, useContext } from "react";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type NotificationType = "success" | "info" | "warning" | "error";

interface NotificationContextProps {
    notifyToast: (message: string, type?: NotificationType) => void;
    notifySwal: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextProps>({
    notifyToast: () => { },
    notifySwal: () => { },
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const notifyToast = (message: string, type: NotificationType = "info") => {
        toast[type](message, {
            position: "top-right",
            autoClose: 3000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
        });
    };

    const notifySwal = (message: string, type: NotificationType = "info") => {
        Swal.fire({
            title: "Notificación",
            text: message,
            icon: type,
            confirmButtonText: "OK",
        });
    };

    return (
        <NotificationContext.Provider value={{ notifyToast, notifySwal }}>
            {/*
        Importante: ToastContainer se puede colocar aquí
        o en tu App.tsx, siempre que esté dentro de NotificationProvider
      */}
            <ToastContainer />
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
