import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import StudentDashboard from './pages/StudentDashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';

// const StudentDashboard = () => <div>Student Dashboard</div>;
// const PartnerDashboard = () => <div>Partner Dashboard</div>;
// const OrganizerDashboard = () => <div>Organizer Dashboard</div>;

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) return <div>Loading...</div>;
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (user && !allowedRoles.includes(user.role)) return <Navigate to="/login" />;

    return <Layout><Outlet /></Layout>;
};

const App: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<ProtectedRoute allowedRoles={['ALUMNO']} />}>
                        <Route path="/student" element={<StudentDashboard />} />
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={['SOCIOFORMADOR']} />}>
                        <Route path="/partner" element={<PartnerDashboard />} />
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={['ORGANIZADOR']} />}>
                        <Route path="/organizer" element={<OrganizerDashboard />} />
                    </Route>

                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default App;
