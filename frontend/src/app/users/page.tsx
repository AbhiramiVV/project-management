'use client';

import { useGetUsersQuery, useCreateUserMutation, useGetCurrentUserQuery } from '@/store/apiSlice';
import { useState } from 'react';
import { Plus, User, Mail, Shield, ArrowLeft, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [q, setQ] = useState('');
    const { data: usersData, isLoading } = useGetUsersQuery({ q, page, size: 10 });
    const { data: currentUser } = useGetCurrentUserQuery(undefined);
    const [createUser] = useCreateUserMutation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const users = usersData?.items || [];
    const total = usersData?.total || 0;
    const totalPages = Math.ceil(total / 10);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/');
    };

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('developer');

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createUser({ name, email, password, role }).unwrap();
            setIsModalOpen(false);
            setName('');
            setEmail('');
            setPassword('');
            setRole('developer');
        } catch (err) {
            console.error('Failed to create user:', err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-12">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/projects" className="text-white/60 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-4xl font-extralight tracking-tight">Team Management</h1>
            </div>

            <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
                <p className="text-white/60 lowercase italic">Manage your team members and roles</p>
                <div className="flex gap-4">
                    {currentUser?.role === 'admin' && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-[#d7aca2]/80 hover:bg-[#d7aca2] text-white px-6 py-3 rounded-sm font-bold tracking-widest uppercase transition-all shadow-lg"
                        >
                            <Plus size={20} /> Add Member
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 border border-red-500/20 text-red-400 px-6 py-3 rounded-sm font-bold tracking-widest transition-all hover:bg-red-500/10 uppercase"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="mb-8">
                <input
                    type="text"
                    placeholder="search members..."
                    value={q}
                    onChange={(e) => { setQ(e.target.value); setPage(1); }}
                    className="w-full max-w-sm bg-white/5 border border-white/10 rounded-sm px-4 py-2 text-white outline-none focus:bg-white/10 transition-all font-light italic"
                />
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 glass-card animate-pulse rounded-sm" />)}
                    </div>
                ) : (
                    <>
                        {users.map((u: any) => (
                            <div key={u.id} className="glass-card p-6 rounded-sm flex items-center justify-between group transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center text-white">
                                        <User size={24} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-light text-white">{u.name}</h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="flex items-center gap-1.5 text-xs text-white/40 italic">
                                                <Mail size={12} /> {u.email}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-xs text-white/60 font-medium uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-full">
                                                <Shield size={10} /> {u.role}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-6 mt-8 pt-8 border-t border-white/5">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                    className="text-white/40 hover:text-white transition-colors disabled:opacity-20 uppercase tracking-widest text-xs font-bold"
                                >
                                    Previous
                                </button>
                                <span className="text-white/20 font-thin italic">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                    className="text-white/40 hover:text-white transition-colors disabled:opacity-20 uppercase tracking-widest text-xs font-bold"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="glass-card w-full max-w-lg rounded-sm p-10 shadow-2xl relative text-white">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-6 text-white/60 hover:text-white"
                        >✕</button>
                        <h2 className="text-3xl font-light mb-8 tracking-tight">Add New Member</h2>
                        <form onSubmit={handleCreate} className="space-y-5">
                            <div>
                                <label className="block text-sm font-light text-white/70 mb-2 lowercase">Full Name</label>
                                <input
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-sm px-4 py-3 outline-none focus:bg-white/20 transition-all font-light"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-light text-white/70 mb-2 lowercase">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-sm px-4 py-3 outline-none focus:bg-white/20 transition-all font-light"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-light text-white/70 mb-2 lowercase">Password</label>
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-sm px-4 py-3 outline-none focus:bg-white/20 transition-all font-light"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-light text-white/70 mb-2 lowercase">Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-sm px-4 py-3 outline-none focus:bg-white/20 transition-all font-light [&>option]:bg-slate-900"
                                >
                                    <option value="developer">Developer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-white/20 rounded-sm hover:bg-white/10 transition-colors uppercase tracking-widest text-sm">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-3 bg-[#d7aca2]/80 hover:bg-[#d7aca2] rounded-sm font-bold transition-colors uppercase tracking-widest text-sm">Add Member</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
