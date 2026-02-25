import './globals.css';
import { Providers } from './providers';
import ClientLayoutWrapper from '../components/ClientLayoutWrapper';

export const metadata = {
    title: 'NyayaSetu AI',
    description: 'AI-powered legal companion designed to make justice accessible.'
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <Providers>
                    <ClientLayoutWrapper>
                        {children}
                    </ClientLayoutWrapper>
                </Providers>
            </body>
        </html>
    );
}
