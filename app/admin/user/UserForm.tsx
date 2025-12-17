'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  role: string;
  status: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserFormData) => void;
  user?: Partial<UserFormData> & { _id?: string };
}

const initialState: UserFormData = {
  name: '',
  email: '',
  phone: '',
  businessName: '',
  role: 'user',
  status: 'active',
};

export default function UserForm({ isOpen, onClose, onSave, user }: Props) {
  const [formData, setFormData] = useState<UserFormData>(initialState);

  useEffect(() => {
    if (user) {
      setFormData({
        ...initialState,
        ...user,
      });
    } else {
      setFormData(initialState);
    }
  }, [user, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {user ? 'Edit User' : 'Add User'}
        </h2>

        <div className="flex flex-col gap-3 mb-4">
          <Input
            placeholder="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />

          <Input
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          <Input
            placeholder="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          <Input
            placeholder="Business Name"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
          />

          {/* Role Selector */}
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="border rounded-md px-3 py-2"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="vendor">Vendor</option>
          </select>

          {/* Status (optional – keep hidden if you want) */}
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="border rounded-md px-3 py-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {user ? 'Update' : 'Add'}
          </Button>
        </div>
      </div>
    </div>
  );
}
