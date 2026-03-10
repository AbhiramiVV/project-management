import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api', // Correctly prefixes all requests for the Next.js rewrite
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Project', 'Task'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => {
        const formData = new FormData();
        formData.append('username', credentials.email);
        formData.append('password', credentials.password);
        return {
          url: 'auth/login',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['User'],
    }),
    getUsers: builder.query({
      query: (arg: any) => {
        const { q, page = 1, size = 20 } = arg || {};
        const skip = (page - 1) * size;
        const params = new URLSearchParams();
        if (q) params.append('q', q);
        params.append('skip', skip.toString());
        params.append('limit', size.toString());
        return `users?${params.toString()}`;
      },
      providesTags: ['User'],
    }),
    getCurrentUser: builder.query({
      query: () => 'users/me',
      providesTags: ['User'],
    }),
    createUser: builder.mutation({
      query: (userData) => ({
        url: 'users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    getProjects: builder.query({
      query: (arg: any) => {
        const { q, page = 1, size = 20 } = arg || {};
        const skip = (page - 1) * size;
        const params = new URLSearchParams();
        if (q) params.append('q', q);
        params.append('skip', skip.toString());
        params.append('limit', size.toString());
        return `projects?${params.toString()}`;
      },
      providesTags: ['Project'],
    }),
    createProject: builder.mutation({
      query: (projectData) => ({
        url: 'projects',
        method: 'POST',
        body: projectData,
      }),
      invalidatesTags: ['Project'],
    }),
    updateProject: builder.mutation({
      query: ({ projectId, ...projectData }) => ({
        url: `projects/${projectId}`,
        method: 'PUT',
        body: projectData,
      }),
      invalidatesTags: ['Project'],
    }),
    deleteProject: builder.mutation({
      query: (projectId) => ({
        url: `projects/${projectId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),
    getTasks: builder.query({
      query: (arg: any) => {
        const { projectId, status, assignedTo, q, page = 1, size = 20 } = arg || {};
        const skip = (page - 1) * size;
        let params = new URLSearchParams();
        if (projectId) params.append('project_id', projectId);
        if (status) params.append('status', status);
        if (assignedTo) params.append('assigned_to', assignedTo);
        if (q) params.append('q', q);
        params.append('skip', skip.toString());
        params.append('limit', size.toString());
        return `tasks?${params.toString()}`;
      },
      providesTags: ['Task'],
    }),
    createTask: builder.mutation({
      query: (taskData) => ({
        url: 'tasks',
        method: 'POST',
        body: taskData,
      }),
      invalidatesTags: ['Task'],
    }),
    updateTaskStatus: builder.mutation({
      query: ({ taskId, status }) => ({
        url: `tasks/${taskId}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Task'],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetUsersQuery,
  useGetCurrentUserQuery,
  useCreateUserMutation,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
} = apiSlice;
