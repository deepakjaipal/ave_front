
import api from '../../../lib/api'; 

export interface User {
  _id: string;
  name: string;
  email: string;
  status: string; // e.g., 'active', 'inactive'
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
    total: number;
  };
}

// Get all users (with optional filters)
export const getUsers = async (filters: UserFilters = {}): Promise<UsersResponse> => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const response = await api.get(`/users?${params.toString()}`);
  return response.data;
};

// Delete a user by ID
export const deleteUser = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const updateUserStatus = async (id: string, status: string) => {
  const response = await api.put(`/users/${id}`, { status });
  return response.data;
};
