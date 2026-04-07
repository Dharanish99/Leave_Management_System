import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, FileWarning, Paperclip, Calendar } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useLeaveStore } from '../../store/leaveStore';
import { Button, Input, Select, Textarea, PageHeader } from '../../components/ui';
import { calculateDays, formatDate } from '../../lib/utils';
import { LEAVE_TYPES } from '../../lib/constants';

// Validation Schema
const schema = z.object({
  leaveType: z.string().min(1, 'Please select a leave type'),
  fromDate: z.string().min(1, 'From date is required'),
  toDate: z.string().min(1, 'To date is required'),
  reason: z.string().min(20, 'Reason must be at least 20 characters').max(500, 'Reason too long'),
  substituteId: z.string().optional(),
}).refine((data) => {
  const from = new Date(data.fromDate);
  const to = new Date(data.toDate);
  return to >= from;
}, {
  message: "End date must be after or on start date",
  path: ["toDate"]
});

type FormValues = z.infer<typeof schema>;

export function LeaveApplicationPage() {
  const { user } = useAuthStore();
  const { applyLeave, getBalanceByUser, fetchBalance } = useLeaveStore();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [attachment, setAttachment] = useState<File | null>(null);

  useEffect(() => {
    if (user) fetchBalance();
  }, [user]);

  const balanceData = user ? getBalanceByUser(user.id) : undefined;

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      leaveType: '',
    }
  });

  const watchFrom = watch('fromDate');
  const watchTo = watch('toDate');
  const watchType = watch('leaveType');
  const watchReason = watch('reason');

  // React to date changes to calculate business days
  useEffect(() => {
    if (watchFrom && watchTo) {
      const start = new Date(watchFrom);
      const end = new Date(watchTo);
      if (end >= start) {
        setCalculatedDays(calculateDays(watchFrom, watchTo));
      } else {
        setCalculatedDays(0);
      }
    } else {
      setCalculatedDays(0);
    }
  }, [watchFrom, watchTo]);

  // Determine balance logic
  const typeBalance = (balanceData && watchType) ? balanceData[watchType as keyof typeof balanceData] as number : undefined;
  const isInsufficient = typeof typeBalance === 'number' && calculatedDays > typeBalance;

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(['leaveType', 'fromDate', 'toDate']);
      if (isValid && !isInsufficient && calculatedDays > 0) setStep(2);
    } else if (step === 2) {
      isValid = await trigger(['reason', 'substituteId']);
      if (isValid) setStep(3);
    }
  };

  const onSubmit = (data: FormValues) => {
    if (!user) return;
    applyLeave({
      applicantId: user.id,
      applicantName: user.name,
      applicantRole: user.role === 'student' ? 'student' : 'staff',
      department: user.department,
      leaveType: data.leaveType as any,
      fromDate: data.fromDate,
      toDate: data.toDate,
      reason: data.reason,
      substituteId: data.substituteId || undefined,
      attachment: attachment || undefined,
    });
    navigate('/leaves/my');
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8 relative">
      <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-surface-border -z-10 w-[80%] mx-auto" />
      <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-accent -z-10 transition-all duration-500 ease-in-out" style={{ width: `${(step - 1) * 40}%`, marginLeft: '10%' }} />
      
      {[1, 2, 3].map((num) => (
        <div key={num} className="flex flex-col items-center flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300 shadow-sm ${
            step > num 
              ? 'bg-accent text-white' 
              : step === num 
                ? 'bg-accent text-white ring-4 ring-accent/20' 
                : 'bg-surface-card text-text-muted border border-surface-border'
          }`}>
            {step > num ? <CheckCircle className="w-5 h-5" /> : num}
          </div>
          <span className={`text-xs mt-2 font-medium ${step >= num ? 'text-text-primary' : 'text-text-muted'}`}>
            {num === 1 ? 'Details' : num === 2 ? 'Reason' : 'Review'}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-10">
      <PageHeader 
        title="Apply for Leave" 
        subtitle="Submit a new leave request for HoD approval."
      />

      <div className="bg-surface-card border border-surface-border rounded-xl shadow-sm p-6 sm:p-8 mt-6">
        <StepIndicator />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* STEP 1: details */}
          {step === 1 && (
            <div className="space-y-5 animate-slide-up">
              <div className="grid sm:grid-cols-2 gap-5">
                <Select
                  label="Leave Type"
                  error={errors.leaveType?.message}
                  {...register('leaveType')}
                >
                  <option value="" disabled hidden>Select Leave Type</option>
                  {Object.entries(LEAVE_TYPES).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </Select>
                
                {watchType && typeof typeBalance === 'number' && (
                   <div className="flex flex-col justify-end pb-2">
                     <p className="text-sm font-medium text-text-secondary">
                        Remaining balance: <span className="text-text-primary font-bold">{typeBalance} days</span>
                     </p>
                   </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <Input
                  label="From Date"
                  type="date"
                  error={errors.fromDate?.message}
                  min={new Date().toISOString().split('T')[0]} // Cannot apply past
                  {...register('fromDate')}
                />
                <Input
                  label="To Date"
                  type="date"
                  error={errors.toDate?.message}
                  min={watchFrom || new Date().toISOString().split('T')[0]}
                  {...register('toDate')}
                />
              </div>

              {calculatedDays > 0 && (
                <div className={`p-4 rounded-lg flex items-start gap-3 ${isInsufficient ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-surface-muted/50 text-text-primary'}`}>
                   {isInsufficient ? <FileWarning className="w-5 h-5 mt-0.5 shrink-0 text-red-500" /> : <Calendar className="w-5 h-5 mt-0.5 shrink-0 text-accent" />}
                   <div>
                     <p className="font-semibold text-sm">
                       {calculatedDays} working {calculatedDays === 1 ? 'day' : 'days'} calculated
                     </p>
                     <p className="text-xs opacity-80 mt-1">
                       {isInsufficient 
                         ? "This exceeds your available balance for the selected leave type." 
                         : "Weekends have been automatically excluded from this duration."}
                     </p>
                   </div>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <Button 
                  type="button" 
                  rightIcon={<ArrowRight className="w-4 h-4" />} 
                  onClick={handleNext}
                  disabled={isInsufficient || calculatedDays === 0}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Reason */}
          {step === 2 && (
            <div className="space-y-6 animate-slide-up">
              <Textarea
                label="Reason for Leave"
                placeholder="Provide a detailed reason (minimum 20 characters)..."
                rows={5}
                error={errors.reason?.message}
                {...register('reason')}
              />

              {user?.role !== 'student' && (
                <Input
                  label="Substitute Faculty / Staff (Optional)"
                  placeholder="e.g. Ramesh Kumar"
                  error={errors.substituteId?.message}
                  {...register('substituteId')}
                  hint="Coordinate with the staff member before listing them."
                />
              )}

              <div className="relative border-2 border-dashed border-surface-border rounded-lg p-6 text-center hover:bg-surface-muted/50 transition-colors">
                 <input 
                   type="file" 
                   accept=".pdf,.jpg,.jpeg,.png"
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                   onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                 />
                 <Paperclip className="w-8 h-8 text-text-muted mx-auto mb-2" />
                 <p className="text-sm font-medium text-text-primary">
                   {attachment ? attachment.name : 'Attach supporting document'}
                 </p>
                 <p className="text-xs text-text-muted mt-1">PDF, JPG, PNG (Max 2MB)</p>
              </div>

              <div className="pt-4 flex justify-between">
                <Button type="button" variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="button" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={handleNext}>
                  Review
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div className="space-y-6 animate-slide-up">
              <div className="bg-surface-muted/50 rounded-xl p-5 space-y-4 border border-surface-border">
                <div className="flex justify-between items-center border-b border-surface-border pb-3">
                   <h4 className="font-semibold text-text-primary">Summary</h4>
                   <button type="button" onClick={() => setStep(1)} className="text-xs text-accent font-medium hover:underline">Edit</button>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                   <div>
                     <p className="text-text-muted text-xs mb-1">Leave Type</p>
                     <p className="font-medium text-text-primary">{LEAVE_TYPES[watchType]?.label}</p>
                   </div>
                   <div>
                     <p className="text-text-muted text-xs mb-1">Duration</p>
                     <p className="font-medium text-text-primary">{calculatedDays} {calculatedDays === 1 ? 'day' : 'days'}</p>
                   </div>
                   <div>
                     <p className="text-text-muted text-xs mb-1">From Date</p>
                     <p className="font-medium text-text-primary">{formatDate(watchFrom)}</p>
                   </div>
                   <div>
                     <p className="text-text-muted text-xs mb-1">To Date</p>
                     <p className="font-medium text-text-primary">{formatDate(watchTo)}</p>
                   </div>
                </div>

                <div className="border-t border-surface-border pt-4">
                   <p className="text-text-muted text-xs mb-1">Reason provided</p>
                   <p className="text-sm text-text-secondary leading-relaxed bg-surface-card p-3 rounded border border-surface-border">
                     {watchReason}
                   </p>
                </div>
                {attachment && (
                  <div className="border-t border-surface-border pt-4">
                     <p className="text-text-muted text-xs mb-1">Attachment</p>
                     <p className="text-sm font-medium text-text-primary">
                       {attachment.name}
                     </p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-blue-50 text-blue-900 rounded-lg flex gap-3 text-sm border border-blue-100">
                <CheckCircle className="w-5 h-5 shrink-0 text-blue-600" />
                <p>By submitting this form, you affirm that the information provided is correct and in accordance with institutional leave policies.</p>
              </div>

              <div className="pt-4 flex justify-between">
                <Button type="button" variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button type="submit" variant="primary">
                  Submit Application
                </Button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}

// Ensure the Calendar icon gets imported above since it's locally redefined visually in my head, but actually comes from lucide-react. I should ensure Calendar is imported from lucide-react.
