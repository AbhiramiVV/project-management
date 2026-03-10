'use client';

import { useGetTasksQuery, useCreateTaskMutation, useUpdateTaskStatusMutation, useGetUsersQuery, useGetProjectsQuery, useGetCurrentUserQuery } from '@/store/apiSlice';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import { Plus, CheckCircle2, Circle, Clock, User as UserIcon, Tag, ArrowLeft, LogOut } from 'lucide-react';
import Link from 'next/link';

function TasksContent() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get('project_id');
    const [page, setPage] = useState(1);
    const [q, setQ] = useState('');

    const { data: users } = useGetUsersQuery({ size: 100 });
    const { data: projects } = useGetProjectsQuery({ size: 100 });
    const { data: currentUser } = useGetCurrentUserQuery(undefined);

    // Developer only sees their own tasks
    const assignedTo = currentUser?.role === 'developer' ? currentUser.id : undefined;

    const { data: tasksData, isLoading: tasksLoading } = useGetTasksQuery(
        { projectId, assignedTo, q, page, size: 10 },
        { skip: !currentUser }
    );
    const isLoading = tasksLoading || !currentUser;

    const tasks = tasksData?.items || [];
    const total = tasksData?.total || 0;
    const totalPages = Math.ceil(total / 10);

    const router = useRouter();
    const [createTask] = useCreateTaskMutation();
    const [updateStatus] = useUpdateTaskStatusMutation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/');
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [assignee, setAssignee] = useState('');

    const currentProject = projects?.items?.find((p: any) => p.id === projectId);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId) return;
        try {
            await createTask({
                title,
                description: desc,
                project_id: projectId,
                assigned_to: assignee || undefined,
            }).unwrap();
            setIsModalOpen(false);
            setTitle('');
            setDesc('');
            setAssignee('');
        } catch (err) {
            console.error('Failed to create task:', err);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="text-emerald-300" size={24} strokeWidth={1.5} />;
            case 'in_progress': return <Clock className="text-blue-300" size={24} strokeWidth={1.5} />;
            default: return <Circle className="text-white/30" size={24} strokeWidth={1.5} />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-12">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/projects" className="text-white/60 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-4xl font-extralight tracking-tight flex items-baseline gap-3">
                    Tasks
                    {currentProject && <span className="text-xl text-white/40 italic font-thin"> / {currentProject.name}</span>}
                </h1>
            </div>

            <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
                <p className="text-white/60 lowercase italic">Manage project execution</p>
                <div className="flex gap-4">
                    {currentUser?.role === 'admin' && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-[#d7aca2]/80 hover:bg-[#d7aca2] text-white px-6 py-3 rounded-sm font-bold tracking-widest uppercase transition-all shadow-lg"
                        >
                            <Plus size={20} /> Add Task
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
                    placeholder="search tasks..."
                    value={q}
                    onChange={(e) => { setQ(e.target.value); setPage(1); }}
                    className="w-full max-w-sm bg-white/5 border border-white/10 rounded-sm px-4 py-2 text-white outline-none focus:bg-white/10 transition-all font-light italic"
                />
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-20 glass-card animate-pulse rounded-sm" />)}
                    </div>
                ) : (
                    <>
                        {tasks.map((task: any) => (
                            <div key={task.id} className="glass-card hover:bg-white/30 p-6 rounded-sm flex items-center justify-between group transition-all">
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={() => {
                                            const isAdmin = currentUser?.role === 'admin';
                                            const isAssigned = task.assigned_to === currentUser?.id;
                                            if (isAdmin || isAssigned) {
                                                updateStatus({ taskId: task.id, status: task.status === 'completed' ? 'todo' : 'completed' });
                                            }
                                        }}
                                        className={`${(currentUser?.role === 'admin' || task.assigned_to === currentUser?.id) ? 'hover:scale-110 cursor-pointer' : 'cursor-default opacity-50'} transition-transform p-1`}
                                    >
                                        {getStatusIcon(task.status)}
                                    </button>
                                    <div>
                                        <h3 className={`text-xl font-light ${task.status === 'completed' ? 'line-through text-white/40' : 'text-white'}`}>
                                            {task.title}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="flex items-center gap-1.5 text-xs text-white/40 uppercase tracking-widest font-bold">
                                                <Tag size={12} /> {task.status.replace('_', ' ')}
                                            </span>
                                            {task.assigned_to && (
                                                <span className="flex items-center gap-1.5 text-xs text-white/60 italic font-light">
                                                    <UserIcon size={12} /> {users?.items?.find((u: any) => u.id === task.assigned_to)?.name || 'Member'}
                                                </span>
                                            )}
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
                {!isLoading && tasks.length === 0 && (
                    <div className="glass-card rounded-sm text-center py-24">
                        <p className="text-white/40 lowercase font-light italic text-lg">No tasks found. Create your first one!</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="glass-card w-full max-w-lg rounded-sm p-10 shadow-2xl relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-6 text-white/60 hover:text-white"
                        >✕</button>
                        <h2 className="text-3xl font-light mb-8 text-white tracking-tight">Assign New Task</h2>
                        <form onSubmit={handleCreate} className="space-y-6">
                            <div>
                                <label className="block text-sm font-light text-white/70 mb-2 lowercase">Task Title</label>
                                <input
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-sm px-4 py-3 text-white outline-none focus:bg-white/20 transition-all font-light"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-light text-white/70 mb-2 lowercase">Assign To</label>
                                <select
                                    value={assignee}
                                    onChange={(e) => setAssignee(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-sm px-4 py-3 text-white outline-none focus:bg-white/20 transition-all font-light [&>option]:bg-slate-900"
                                >
                                    <option value="">Unassigned</option>
                                    {users?.map((u: any) => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-white/20 text-white rounded-sm hover:bg-white/10 transition-colors uppercase tracking-widest text-sm">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-3 bg-[#d7aca2]/80 hover:bg-[#d7aca2] text-white rounded-sm font-bold transition-colors uppercase tracking-widest text-sm">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TasksPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/20"></div>
            </div>
        }>
            <TasksContent />
        </Suspense>
    );
}
