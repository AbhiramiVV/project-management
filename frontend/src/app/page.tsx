'use client';

import { useState, useEffect } from 'react';
import { useLoginMutation } from '@/store/apiSlice';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail } from 'lucide-react';

export default function HomePage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [login, { isLoading }] = useLoginMutation();
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
        <div className="flex flex-col items-center justify-center min-h-screen p-6 font-sans">
            {/* Circle Icon */}
            <div className="w-44 h-44 bg-[#013a7c] rounded-full flex items-center justify-center mb-6 shadow-2xl">
                <User size={100} className="text-white" strokeWidth={1} />
            </div>

            {/* Header Text */}
            <h1 className="text-4xl text-white font-thin tracking-[0.25em] mb-16 uppercase">
                Customer Login
            </h1>

            <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-2">
                {/* Email Input */}
                <div className="input-icon-group">
                    <Mail size={24} className="text-white" strokeWidth={1.5} />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field"
                        placeholder="Email ID"
                        required
                    />
                </div>

                {/* Password Input */}
                <div className="input-icon-group">
                    <Lock size={24} className="text-white" strokeWidth={1.5} />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field"
                        placeholder="Password"
                        required
                    />
                </div>

                {/* Checkbox and Link */}
                <div className="flex items-center justify-between text-white text-lg font-light mb-12 px-1">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-5 h-5 accent-[#013a7c] border-none"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <span>Remember me</span>
                    </label>
                    <a href="#" className="italic hover:underline">Forgot Password?</a>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="blue-btn mt-6"
                >
                    {isLoading ? 'LOGIN...' : 'Login'}
                </button>
            </form>
        </div>
    );
}
