import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { toast } from '../../hooks/useToast';
import { Key, ShieldCheck, Mail } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { user } = useAuthStore();
  const { updateUser } = useUserStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    }
  });

  if (!user) return null;

  const onSubmit = async (data: FormValues) => {
    try {
      await updateUser(user.id, data);
      toast.success('Profile Updated', 'Your profile changes have been saved.');
    } catch {
      toast.error('Update Failed', 'Could not update profile. Please try again.');
    }
  };

  const handlePasswordChange = () => {
    toast.success('Password Email Sent', 'Instructions to reset your password have been sent.');
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto flex flex-col gap-6">
      <PageHeader 
        title="My Profile" 
        subtitle="Manage your personal details and strictly controlled access credentials." 
      />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Col: Static Identity Card */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="card flex flex-col items-center text-center p-8 bg-surface-card border-t-4 border-t-accent">
            <Avatar name={user.name} size="lg" src={user.avatar} className="w-24 h-24 text-2xl mb-4 shadow" />
            <h2 className="text-xl font-bold text-text-primary capitalize">{user.name}</h2>
            <p className="text-sm font-medium text-text-secondary uppercase tracking-widest mt-1 mb-4">
              {user.role}
            </p>
            <div className="w-full flex flex-col items-center gap-2 pt-4 border-t border-surface-border">
              <span className="inline-flex items-center gap-2 text-xs text-text-muted">
                <ShieldCheck className="w-4 h-4 text-status-approved" /> Account Active
              </span>
              <span className="inline-flex items-center gap-2 text-xs text-text-muted">
                <Mail className="w-4 h-4 text-text-muted" /> {user.email}
              </span>
            </div>
          </div>

          <div className="card p-6 flex flex-col gap-4 bg-status-rejected/5 border-status-rejected/10">
            <h3 className="text-sm font-bold text-status-rejected uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4" /> Security
            </h3>
            <p className="text-xs text-text-secondary">It is recommended to rotate your credentials securely.</p>
            <Button variant="secondary" onClick={handlePasswordChange} className="w-full text-text-primary hover:text-text-primary bg-surface border-surface-border">
              Change Password
            </Button>
          </div>
        </div>

        {/* Right Col: Editable Details */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <form onSubmit={handleSubmit(onSubmit)} className="card bg-surface-card">
            <div className="flex justify-between items-center mb-6 border-b border-surface-border pb-4">
              <h3 className="text-lg font-semibold text-text-primary">Personal Details</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-5">
              <Input
                label="Full Name"
                id="name"
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="Phone Number"
                id="phone"
                placeholder="+91 - "
                error={errors.phone?.message}
                {...register('phone')}
              />
              
              <div className="pt-4 border-t border-surface-border flex justify-end">
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </div>
          </form>

          <div className="card bg-surface-muted/30 border-dashed border-surface-border">
            <h3 className="text-lg font-semibold text-text-primary mb-6">Institutional Records</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                  Department
                </label>
                <div className="px-4 py-2.5 bg-surface rounded-md border border-surface-border text-text-primary font-medium text-sm">
                  {user.department || 'Not Assigned'}
                </div>
              </div>

              {user.role === 'student' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                      Student ID
                    </label>
                    <div className="px-4 py-2.5 bg-surface rounded-md border border-surface-border text-text-primary font-mono text-sm">
                      {user.studentId || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                      Class & Section
                    </label>
                    <div className="px-4 py-2.5 bg-surface rounded-md border border-surface-border text-text-primary font-medium text-sm">
                      {user.class || 'N/A'}
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                    Employee ID
                  </label>
                  <div className="px-4 py-2.5 bg-surface rounded-md border border-surface-border text-text-primary font-mono text-sm">
                    {user.employeeId || 'N/A'}
                  </div>
                </div>
              )}
            </div>
            <p className="mt-4 text-xs text-text-muted">
              Note: Contact the Principal or HoD to request changes to institutional fields.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
