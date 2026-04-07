import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';

// ─── Zod schema ────────────────────────────────────────
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(4, 'Password must be at least 4 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ─── Demo credentials ──────────────────────────────────
export const DEMO_CREDENTIALS = [
  { email: 'principal@school.edu', label: 'Principal', shortLabel: 'Principal' },
  { email: 'cs.hod@school.edu', label: 'HoD – CS', shortLabel: 'HoD – CS' },
  { email: 'maths.hod@school.edu', label: 'HoD – Maths', shortLabel: 'HoD – Maths' },
  { email: 'staff1@school.edu', label: 'Staff', shortLabel: 'Staff' },
  { email: 'student1@school.edu', label: 'Student', shortLabel: 'Student' },
] as const;

// ─── Hook ───────────────────────────────────────────────
export function useLogin() {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated, user } = useAuthStore();

  const [serverError, setServerError] = useState('');
  const [shouldShake, setShouldShake] = useState(false);

  // If already logged in, redirect immediately
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/dashboard/${user.role}`, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError('');
    setShouldShake(false);

    const result = await login(data.email, data.password);

    if (result.success && result.role) {
      navigate(`/dashboard/${result.role}`, { replace: true });
    } else {
      setServerError(result.error || 'Login failed. Please try again.');
      setShouldShake(true);
      // Remove shake after animation completes
      setTimeout(() => setShouldShake(false), 500);
    }
  };

  const quickLogin = (email: string) => {
    form.setValue('email', email);
    form.setValue('password', 'Test@1234');
    setServerError('');
    // Small delay so user sees the fill, then submit
    setTimeout(() => {
      form.handleSubmit(onSubmit)();
    }, 150);
  };

  return {
    form,
    serverError,
    shouldShake,
    isLoading,
    onSubmit: form.handleSubmit(onSubmit),
    quickLogin,
  };
}
