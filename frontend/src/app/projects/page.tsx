'use client';

import { useGetProjectsQuery, useCreateProjectMutation, useUpdateProjectMutation, useDeleteProjectMutation, useGetCurrentUserQuery } from '@/store/apiSlice';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Briefcase, Calendar, ChevronRight, Edit2, Trash2, Users, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProjectsPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [q, setQ] = useState('');
    const { data: projectsData, isLoading } = useGetProjectsQuery({ q, page, size: 6 });
    const { data: currentUser } = useGetCurrentUserQuery(undefined);
    const [createProject] = useCreateProjectMutation();
    const [updateProject] = useUpdateProjectMutation();
    const [deleteProject] = useDeleteProjectMutation();

    const projects = projectsData?.items || [];
    const total = projectsData?.total || 0;
    const totalPages = Math.ceil(total / 6);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/');
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/');
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<any>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const openCreateModal = () => {
        setEditingProject(null);
        setName('');
        setDescription('');
        setIsModalOpen(true);
    };

    const openEditModal = (e: React.MouseEvent, project: any) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingProject(project);
        setName(project.name);
        setDescription(project.description || '');
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProject) {
            await updateProject({ projectId: editingProject.id, name, description });
        } else {
            await createProject({ name, description });
        }
        setIsModalOpen(false);
    };

    const handleDelete = async (e: React.MouseEvent, projectId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this project?')) {
            await deleteProject(projectId);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-12">
            <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-5xl font-extralight text-white mb-2 tracking-tight">Projects</h1>
                    <p className="text-white/60 lowercase italic">Manage your workspace initiatives</p>
                </div>
                <div className="flex gap-4">
                    {currentUser?.role === 'admin' && (
                        <>
                            <Link
                                href="/users"
                                className="flex items-center gap-2 border border-white/20 text-white px-6 py-3 rounded-sm font-bold tracking-widest transition-all hover:bg-white/10 uppercase"
                            >
                                <Users size={20} />
                                <span>Manage Users</span>
                            </Link>
                            <button
                                onClick={openCreateModal}
                                className="flex items-center gap-2 bg-[#d7aca2]/80 hover:bg-[#d7aca2] text-white px-8 py-3 rounded-sm font-bold tracking-widest transition-all shadow-lg uppercase"
                            >
                                <Plus size={20} />
                                <span>New Project</span>
                            </button>
                        </>
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
                    placeholder="search projects..."
                    value={q}
                    onChange={(e) => { setQ(e.target.value); setPage(1); }}
                    className="w-full max-w-sm bg-white/5 border border-white/10 rounded-sm px-4 py-2 text-white outline-none focus:bg-white/10 transition-all font-light italic"
                />
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-56 glass-card animate-pulse rounded-sm" />
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project: any) => (
                            <div key={project.id} className="relative group">
                                <Link
                                    href={`/tasks?project_id=${project.id}`}
                                    className="block glass-card hover:bg-white/30 rounded-sm p-8 transition-all duration-500 h-full"
                                >
                                    <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                                        <Briefcase size={28} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-2xl font-light text-white mb-3 flex items-center justify-between">
                                        {project.name}
                                    </h3>
                                    <p className="text-white/70 text-sm font-light line-clamp-2 mb-6 leading-relaxed">
                                        {project.description || 'No description provided.'}
                                    </p>
                                    <div className="flex items-center justify-between text-white/50 text-xs pt-6 border-t border-white/10 mt-auto">
                                        <div className="flex items-center gap-2 italic">
                                            <Calendar size={14} />
                                            <span>{new Date(project.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <ChevronRight size={18} className="translate-x-0 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </Link>

                                {currentUser?.role === 'admin' && (
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => openEditModal(e, project)}
                                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                            title="Edit Project"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, project.id)}
                                            className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full text-white transition-colors"
                                            title="Delete Project"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-6 mt-12 pt-8 border-t border-white/5">
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

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="glass-card w-full max-w-lg rounded-sm p-10 shadow-2xl relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-6 text-white/60 hover:text-white"
                        >✕</button>
                        <h2 className="text-3xl font-light mb-8 text-white tracking-tight">
                            {editingProject ? 'Edit Project' : 'Create New Project'}
                        </h2>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label className="block text-sm font-light text-white/70 mb-2 lowercase">Project Name</label>
                                <input
                                    autoFocus
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-sm px-4 py-3 text-white outline-none focus:bg-white/20 transition-all font-light"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-light text-white/70 mb-2 lowercase">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-sm px-4 py-3 h-32 text-white outline-none focus:bg-white/20 transition-all resize-none font-light"
                                />
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 border border-white/20 text-white rounded-sm hover:bg-white/10 transition-colors uppercase tracking-widest text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-[#d7aca2]/80 hover:bg-[#d7aca2] text-white rounded-sm font-bold transition-colors uppercase tracking-widest text-sm"
                                >
                                    {editingProject ? 'Save Changes' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
