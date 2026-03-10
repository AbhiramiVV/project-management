'use client';

import { useState, useEffect } from 'react';
import { useLoginMutation } from '@/store/apiSlice';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [login, { isLoading, error }] = useLoginMutation();
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/projects');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await login({ email, password }).unwrap();
            localStorage.setItem('token', result.access_token);
            router.push('/projects');
        } catch (err) {
            console.error('Login failed:', err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-[420px] max-w-[420px] text-center space-y-12">
                {/* User Icon Circle */}
                <div className="flex justify-center">
                    <div className="w-32 h-32 rounded-full bg-[#003876] flex items-center justify-center border-[1px] border-white/10 shadow-xl">
                        <User size={64} className="text-white" strokeWidth={1} />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-white text-3xl font-extralight tracking-[0.25em] uppercase">
                     Login
                </h1>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-10 text-left">
                    {/* Email Input */}
                    <div className="relative border-b border-white pb-3 flex items-center gap-4 group">
                        <Mail size={24} className="text-white shrink-0" />
                        <input
                            required
                            type="email"
                            placeholder="Email ID"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-transparent border-none outline-none text-white text-lg font-light w-full placeholder:text-white/80"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative border-b border-white pb-3 flex items-center gap-4 group">
                        <Lock size={24} className="text-white shrink-0" />
                        <input
                            required
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-transparent border-none outline-none text-white text-lg font-light w-full placeholder:text-white/80"
                        />
                    </div>

                

                    {/* Login Button */}
                    <button
                        disabled={isLoading}
                        type="submit"
                        className="w-full bg-[#003876] text-white py-5 text-lg font-bold tracking-[0.2em] uppercase hover:bg-[#002d5f] transition-all shadow-2xl active:scale-[0.98]"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>

                    {error && (
                        <p className="text-red-300 text-sm text-center font-light bg-black/20 py-2 rounded-sm backdrop-blur-sm">
                            Invalid email or password. Please try again.
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
