import './globals.css';
import { Providers } from '@/store/Providers';

export const metadata = {
    title: 'Project Management System',
    description: 'Manage your projects and tasks effectively.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className={`text-slate-100 min-h-screen antialiased`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
