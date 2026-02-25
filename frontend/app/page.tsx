"use client";

import ComplaintWizard from '../features/complaint'; // assuming index.tsx exports main

export default function Home() {
    return (
        <div className="p-4 mx-auto max-w-5xl">
            <h1 className="text-3xl font-bold mb-6 text-center">NyayaSetu AI Dashboard</h1>
            <ComplaintWizard />
        </div>
    );
}
