import React from 'react';
import AuthGuard from '../../components/AuthGuard';
import { LocatorPage } from '../../features/locator/LocatorPage';

export default function Page() {
    return (
        <AuthGuard>
            <LocatorPage />
        </AuthGuard>
    );
}
