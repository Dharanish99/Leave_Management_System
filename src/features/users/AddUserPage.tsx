import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { toast } from '../../hooks/useToast';
import { api } from '../../lib/api';

const userSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  role: z.enum(['principal', 'hod', 'staff', 'student']),
  department: z.string().min(2, 'Department is required'),
  employeeId: z.string().optional(),
  studentId: z.string().optional(),
  class: z.string().optional(),
});

type FormValues = z.infer<typeof userSchema>;

interface Department {
  id: string;
  name: string;
  code: string;
}

export function AddUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, addUser, updateUser, fetchUsers } = useUserStore();
  const { user: currentUser } = useAuthStore();
  
  const [departments, setDepartments] = useState<Department[]>([]);

  const isEdit = Boolean(id);
  const targetUser = isEdit ? users.find((u) => u.id === id) : null;

  // Fetch departments from API
  useEffect(() => {
    api.get('/departments').then(res => setDepartments(res.data || [])).catch(() => {});
    if (users.length === 0) fetchUsers();
  }, []);

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: 'staff',
      department: currentUser?.role === 'hod' ? (currentUser.departmentId || currentUser.department) : '',
    }
  });

  const selectedRole = watch('role');

  useEffect(() => {
    if (isEdit && targetUser) {
      reset({
        name: targetUser.name,
        email: targetUser.email,
        phone: targetUser.phone,
        role: targetUser.role,
        department: targetUser.departmentId || targetUser.department,
        employeeId: targetUser.employeeId,
        studentId: targetUser.studentId,
        class: targetUser.class,
      });
    } else if (isEdit && !targetUser) {
      toast.error('Not Found', 'The requested user could not be found.');
      navigate('/users');
    }
  }, [isEdit, targetUser, reset, navigate]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEdit && id) {
        await updateUser(id, { ...data, departmentId: data.department });
        toast.success('User Updated', 'User profile has been updated successfully.');
      } else {
        await addUser({ ...data, departmentId: data.department, isActive: true, createdBy: currentUser?.id || 'system' });
        toast.success('User Added', 'New user has been created successfully with default password Test@1234.');
      }
      navigate('/users');
    } catch (err: any) {
      toast.error('Operation Failed', err.message || 'Could not save user.');
    }
  };

  // Role options dependent on caller
  const roleOptions = [
    { label: 'Staff', value: 'staff' },
    { label: 'Student', value: 'student' },
  ];
  if (currentUser?.role === 'principal') {
    roleOptions.unshift({ label: 'Principal', value: 'principal' }, { label: 'Head of Dept', value: 'hod' });
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto flex flex-col gap-6">
      <PageHeader 
        title={isEdit ? 'Edit User' : 'Add New User'} 
        subtitle={isEdit ? `Update details for ${targetUser?.name}` : 'Create a new user account in the system.'} 
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* SECTION: Personal Info */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-surface-border pb-2">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              id="name"
              placeholder="e.g. Ramesh Kumar"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Email Address *"
              id="email"
              type="email"
              placeholder="ramesh@school.edu"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Phone Number"
              id="phone"
              placeholder="+91 XXXXX XXXXX"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>
        </div>

        {/* SECTION: Role & Access */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-surface-border pb-2">
            Role & Access
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Role *"
              id="role"
              error={errors.role?.message}
              {...register('role')}
            >
              {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </Select>
            <Select
              label="Department *"
              id="department"
              error={errors.department?.message}
              {...register('department')}
              disabled={currentUser?.role === 'hod'}
            >
              <option value="">Select Department</option>
              {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
            </Select>

            {selectedRole === 'student' ? (
              <>
                <Input
                  label="Student ID *"
                  id="studentId"
                  placeholder="e.g. STU001"
                  error={errors.studentId?.message}
                  {...register('studentId')}
                />
                <Input
                  label="Class/Section"
                  id="class"
                  placeholder="e.g. XII-A"
                  error={errors.class?.message}
                  {...register('class')}
                />
              </>
            ) : (
              <Input
                label="Employee ID *"
                id="employeeId"
                placeholder="e.g. EMP001"
                error={errors.employeeId?.message}
                {...register('employeeId')}
              />
            )}
          </div>
        </div>

        {/* SECTION: Security (Add Mode Only) */}
        {!isEdit && (
          <div className="card border border-accent/20 bg-accent/5">
            <h3 className="text-lg font-semibold text-accent mb-4 border-b border-accent/10 pb-2">
              Security
            </h3>
            <div className="space-y-4">
              <Input
                label="Temporary Password *"
                id="password"
                type="text"
                defaultValue="welcome123"
                readOnly
                className="bg-surface cursor-not-allowed opacity-75"
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-accent border-surface-border rounded bg-surface" />
                <span className="text-sm text-text-secondary">Force password change on first login</span>
              </label>
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
          <Button type="button" variant="secondary" onClick={() => navigate('/users')}>
            Cancel
          </Button>
          <Button type="submit">
            {isEdit ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      </form>
    </div>
  );
}
