'use client';
import { useState, useEffect } from 'react';
import { getUsers, deleteUser, updateUserStatus, User } from './userService';
import UserForm from './UserForm';
import { Button } from '@/components/ui/button';
import { Loader2, Edit, Trash2, Plus } from 'lucide-react';

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

const handleToggleStatus = async (id: string, status: string) => {
  const newStatus = status === 'active' ? 'inactive' : 'active';
  try {
  await updateUserStatus(id, newStatus);
  fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveUser = async (userData: Partial<User>) => {
    // This will call your API to create/update a user via UserForm
    console.log('Save user', userData);
    fetchUsers();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search users..."
          className="border p-2 w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => { setSelectedUser(undefined); setModalOpen(true); }}>
          <Plus size={16} /> Add User
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : (
        <table className="w-full table-auto border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Business</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id} className="text-center">
                <td className="border p-2">{user.name}</td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">{(user as any).phone || '-'}</td>
                <td className="border p-2">{(user as any).businessName || '-'}</td>
                <td className="border p-2">{(user as any).role || '-'}</td>
                <td className="border p-2">
                  <Button
                    size="sm"
                    variant={user.status === 'active' ? 'default' : 'outline'}
                    onClick={() => handleToggleStatus(user._id, user.status)}
                  >
                    {user.status}
                  </Button>
                </td>
                <td className="border p-2 flex justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setSelectedUser(user); setModalOpen(true); }}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(user._id)}>
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <UserForm
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser}
      />
    </div>
  );
}
