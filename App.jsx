import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function AppRoutes() {
    const { user } = useAuth();
    const [showRegister, setShowRegister] = useState(false);

    if (user) return <Dashboard />;

    if (showRegister)
        return <Register onSwitch={() => setShowRegister(false)} />;

    return <Login onSwitch={() => setShowRegister(true)} />;
}

export default function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}