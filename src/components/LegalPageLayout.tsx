import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface LegalPageLayoutProps {
    title: string;
    children: React.ReactNode;
}

export default function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 sm:p-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">
                        {title}
                    </h1>
                    <div className="prose prose-blue max-w-none text-gray-600">
                        {children}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
