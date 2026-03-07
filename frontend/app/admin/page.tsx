import React from 'react';
import AuthGuard from '../../components/AuthGuard';
import { AdminDashboard } from '../../features/admin/AdminDashboard';

export default function Page() {
    return (
        <AuthGuard>
            <AdminDashboard />
        </AuthGuard>
    );
}
