# 🎨 MedSource Pro - Frontend Account System Changes

## Executive Summary

**Document Version**: 1.0  
**Date**: December 16, 2025  
**Scope**: Frontend UI/UX changes required to support backend Account System improvements  
**Related Backend Docs**: `server/ACCOUNT_SERVICE_IMPROVEMENT_PLAN.md`, `server/PHASE_0_COMPLETION_REPORT.md`, `server/PHASE_1_COMPLETION_REPORT.md`

---

## 📋 Table of Contents

1. [Phase 0 & 1: Required Frontend Changes](#phase-0--1-required-frontend-changes)
2. [Phase 2: Caching Layer Frontend Changes](#phase-2-caching-layer-frontend-changes)
3. [Phase 3: Audit Trail Frontend Changes](#phase-3-audit-trail-frontend-changes)
4. [Phase 4: Cleanup & Optimization Frontend Changes](#phase-4-cleanup--optimization-frontend-changes)
5. [Component Library Requirements](#component-library-requirements)
6. [API Client Updates](#api-client-updates)
7. [Implementation Priority](#implementation-priority)

---

## Phase 0 & 1: Required Frontend Changes

### 🔴 CRITICAL: Login Page Error Handling

The backend now returns new error messages that the frontend MUST handle:

#### New Login Response Messages

| Backend Message | HTTP Code | User-Facing Message | UI Action |
|-----------------|-----------|---------------------|-----------|
| `invalid_credentials` | 401 | "Invalid email or password" | Show error toast |
| `account_locked` | 401 | "Account temporarily locked" | Show lockout modal |
| `account_suspended` | 401 | "Account suspended" | Show suspension modal |
| `email_verification_required` | 401 | "Please verify your email" | Show verification prompt |
| `force_password_change` | 200 | "Password change required" | Redirect to password change |

#### 1.1 Login Page Updates

**File**: `client/app/(auth)/login/page.tsx`

```tsx
// Updated login handler
const handleLogin = async (credentials: LoginCredentials) => {
  try {
    const { data } = await AuthService.login(credentials);
    
    switch (data.message) {
      case 'login_success':
        // Normal login - redirect to dashboard
        router.push('/app/dashboard');
        break;
        
      case 'force_password_change':
        // Store temporary token and redirect to password change
        setTemporaryToken(data.payload);
        router.push('/auth/change-password?required=true');
        break;
        
      case 'account_locked':
        setShowLockoutModal(true);
        break;
        
      case 'account_suspended':
        setShowSuspensionModal(true);
        break;
        
      case 'email_verification_required':
        setShowVerificationModal(true);
        break;
        
      default:
        toast.error('Login failed. Please try again.');
    }
  } catch (error) {
    // Handle 401 responses
    const message = error.response?.data?.message;
    
    if (message === 'account_locked') {
      setShowLockoutModal(true);
    } else if (message === 'account_suspended') {
      setShowSuspensionModal(true);
    } else if (message === 'email_verification_required') {
      setShowVerificationModal(true);
    } else {
      toast.error('Invalid email or password');
    }
  }
};
```

#### 1.2 Account Locked Modal Component

**File**: `client/app/_components/modals/AccountLockedModal.tsx`

```tsx
interface AccountLockedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountLockedModal({ isOpen, onClose }: AccountLockedModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center p-6">
        {/* Lock Icon */}
        <div className="mx-auto w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4">
          <LockClosedIcon className="w-8 h-8 text-error" />
        </div>
        
        {/* Title */}
        <h2 className="text-xl font-bold text-base-content mb-2">
          Account Temporarily Locked
        </h2>
        
        {/* Message */}
        <p className="text-base-content/70 mb-4">
          Your account has been temporarily locked due to too many failed login attempts.
        </p>
        
        {/* Details */}
        <div className="bg-base-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold mb-2">What happened?</h3>
          <ul className="text-sm text-base-content/70 space-y-1">
            <li>• 5 incorrect password attempts detected</li>
            <li>• Account locked for 30 minutes for security</li>
            <li>• This protects your account from unauthorized access</li>
          </ul>
        </div>
        
        {/* Timer (optional - if we track this) */}
        <div className="mb-6">
          <p className="text-sm text-base-content/60">
            Try again in approximately <span className="font-semibold">30 minutes</span>
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button variant="primary" onClick={() => router.push('/auth/forgot-password')}>
            Reset Password Instead
          </Button>
          <Button variant="ghost" onClick={onClose}>
            I'll Wait
          </Button>
        </div>
        
        {/* Help Link */}
        <p className="text-xs text-base-content/50 mt-4">
          Need help? <a href="/contact" className="text-primary hover:underline">Contact Support</a>
        </p>
      </div>
    </Modal>
  );
}
```

#### 1.3 Account Suspended Modal Component

**File**: `client/app/_components/modals/AccountSuspendedModal.tsx`

```tsx
interface AccountSuspendedModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string; // If we want to show suspension reason in future
}

export function AccountSuspendedModal({ isOpen, onClose, reason }: AccountSuspendedModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center p-6">
        {/* Warning Icon */}
        <div className="mx-auto w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-4">
          <ExclamationTriangleIcon className="w-8 h-8 text-warning" />
        </div>
        
        {/* Title */}
        <h2 className="text-xl font-bold text-base-content mb-2">
          Account Suspended
        </h2>
        
        {/* Message */}
        <p className="text-base-content/70 mb-4">
          Your account has been suspended by an administrator.
        </p>
        
        {/* Reason (if available) */}
        {reason && (
          <div className="bg-base-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold mb-2">Reason:</h3>
            <p className="text-sm text-base-content/70">{reason}</p>
          </div>
        )}
        
        {/* What to do */}
        <div className="bg-base-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold mb-2">What can you do?</h3>
          <ul className="text-sm text-base-content/70 space-y-1">
            <li>• Contact support to understand why your account was suspended</li>
            <li>• Review our Terms of Service</li>
            <li>• Request an account review if you believe this is an error</li>
          </ul>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button variant="primary" onClick={() => window.location.href = 'mailto:support@medsourcepro.com'}>
            Contact Support
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

#### 1.4 Email Verification Required Modal

**File**: `client/app/_components/modals/EmailVerificationModal.tsx`

```tsx
interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
}

export function EmailVerificationModal({ isOpen, onClose, email }: EmailVerificationModalProps) {
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      await API.Auth.resendVerificationEmail(email);
      setResent(true);
      toast.success('Verification email sent!');
    } catch (error) {
      toast.error('Failed to send email. Try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center p-6">
        {/* Email Icon */}
        <div className="mx-auto w-16 h-16 bg-info/10 rounded-full flex items-center justify-center mb-4">
          <EnvelopeIcon className="w-8 h-8 text-info" />
        </div>
        
        {/* Title */}
        <h2 className="text-xl font-bold text-base-content mb-2">
          Verify Your Email
        </h2>
        
        {/* Message */}
        <p className="text-base-content/70 mb-4">
          Please verify your email address to continue.
          {email && <span className="block font-medium mt-1">{email}</span>}
        </p>
        
        {/* Instructions */}
        <div className="bg-base-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold mb-2">Next Steps:</h3>
          <ol className="text-sm text-base-content/70 space-y-1 list-decimal list-inside">
            <li>Check your inbox for a verification email</li>
            <li>Click the verification link in the email</li>
            <li>Return here and log in again</li>
          </ol>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button 
            variant="primary" 
            onClick={handleResendEmail}
            disabled={isResending || resent}
          >
            {isResending ? 'Sending...' : resent ? 'Email Sent!' : 'Resend Verification Email'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        
        {/* Spam note */}
        <p className="text-xs text-base-content/50 mt-4">
          Can't find the email? Check your spam folder.
        </p>
      </div>
    </Modal>
  );
}
```

#### 1.5 Force Password Change Page

**File**: `client/app/(auth)/change-password/page.tsx`

```tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const passwordSchema = z.object({
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[!@#$%^&*]/, 'Password must contain special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ForcePasswordChangePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isRequired = searchParams.get('required') === 'true';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: { newPassword: string }) => {
    setIsSubmitting(true);
    try {
      await API.Accounts.changePassword(data.newPassword);
      toast.success('Password changed successfully!');
      router.push('/app/dashboard');
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-4">
              <KeyIcon className="w-8 h-8 text-warning" />
            </div>
            <h1 className="text-2xl font-bold">
              {isRequired ? 'Password Change Required' : 'Change Password'}
            </h1>
            {isRequired && (
              <p className="text-base-content/70 mt-2">
                An administrator has required you to change your password for security reasons.
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">New Password</span>
              </label>
              <input
                type="password"
                {...register('newPassword')}
                className="input input-bordered w-full"
                placeholder="Enter new password"
              />
              {errors.newPassword && (
                <p className="text-error text-sm mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="label">
                <span className="label-text">Confirm Password</span>
              </label>
              <input
                type="password"
                {...register('confirmPassword')}
                className="input input-bordered w-full"
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && (
                <p className="text-error text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-base-200 rounded-lg p-4">
              <p className="text-sm font-semibold mb-2">Password Requirements:</p>
              <ul className="text-xs text-base-content/70 space-y-1">
                <li>• At least 8 characters</li>
                <li>• One uppercase letter (A-Z)</li>
                <li>• One lowercase letter (a-z)</li>
                <li>• One number (0-9)</li>
                <li>• One special character (!@#$%^&*)</li>
              </ul>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>

          {/* Cannot skip if required */}
          {isRequired && (
            <p className="text-xs text-center text-base-content/50 mt-4">
              You cannot skip this step. Your password must be changed to continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### 🟡 ADMIN: Account Status Management UI

Admins need a way to manage account statuses. This requires new UI components.

#### 2.1 Account Status Badge Component

**File**: `client/app/_components/badges/AccountStatusBadge.tsx`

```tsx
import { AccountStatus } from '@_classes/Enums';

interface AccountStatusBadgeProps {
  status: AccountStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  [AccountStatus.PendingVerification]: {
    label: 'Pending Verification',
    color: 'badge-warning',
    icon: '⏳',
  },
  [AccountStatus.Active]: {
    label: 'Active',
    color: 'badge-success',
    icon: '✓',
  },
  [AccountStatus.ForcePasswordChange]: {
    label: 'Password Change Required',
    color: 'badge-warning',
    icon: '🔑',
  },
  [AccountStatus.Suspended]: {
    label: 'Suspended',
    color: 'badge-error',
    icon: '⛔',
  },
  [AccountStatus.Locked]: {
    label: 'Locked',
    color: 'badge-error',
    icon: '🔒',
  },
  [AccountStatus.Archived]: {
    label: 'Archived',
    color: 'badge-neutral',
    icon: '📦',
  },
};

export function AccountStatusBadge({ status, size = 'md' }: AccountStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig[AccountStatus.Active];
  
  const sizeClasses = {
    sm: 'badge-sm',
    md: '',
    lg: 'badge-lg',
  };

  return (
    <span className={`badge ${config.color} ${sizeClasses[size]} gap-1`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
```

#### 2.2 AccountStatus Enum (Frontend)

**File**: `client/app/_classes/Enums.ts`

```typescript
// Add to existing Enums.ts file
export enum AccountStatus {
  PendingVerification = 0,
  Active = 100,
  ForcePasswordChange = 150,
  Suspended = 200,
  Locked = 300,
  Archived = 400,
}

// Helper function
export function getAccountStatusLabel(status: AccountStatus): string {
  const labels: Record<AccountStatus, string> = {
    [AccountStatus.PendingVerification]: 'Pending Verification',
    [AccountStatus.Active]: 'Active',
    [AccountStatus.ForcePasswordChange]: 'Password Change Required',
    [AccountStatus.Suspended]: 'Suspended',
    [AccountStatus.Locked]: 'Locked',
    [AccountStatus.Archived]: 'Archived',
  };
  return labels[status] || 'Unknown';
}

export function canAccountLogin(status: AccountStatus): boolean {
  return status === AccountStatus.Active || status === AccountStatus.ForcePasswordChange;
}
```

#### 2.3 Account Actions Dropdown (Admin)

**File**: `client/app/_components/admin/AccountActionsDropdown.tsx`

```tsx
'use client';

import { useState } from 'react';
import { AccountStatus } from '@_classes/Enums';
import type User from '@_classes/User';

interface AccountActionsDropdownProps {
  account: User;
  onStatusChange: (accountId: string, newStatus: AccountStatus) => void;
}

export function AccountActionsDropdown({ account, onStatusChange }: AccountActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      switch (action) {
        case 'activate':
          await API.Accounts.activate(account.id);
          onStatusChange(account.id, AccountStatus.Active);
          toast.success('Account activated');
          break;
          
        case 'suspend':
          setShowSuspendModal(true);
          break;
          
        case 'unlock':
          await API.Accounts.unlock(account.id);
          onStatusChange(account.id, AccountStatus.Active);
          toast.success('Account unlocked');
          break;
          
        case 'archive':
          if (confirm('Are you sure you want to archive this account?')) {
            await API.Accounts.archive(account.id);
            onStatusChange(account.id, AccountStatus.Archived);
            toast.success('Account archived');
          }
          break;
          
        case 'restore':
          await API.Accounts.restore(account.id);
          onStatusChange(account.id, AccountStatus.Active);
          toast.success('Account restored');
          break;
          
        case 'force_password':
          await API.Accounts.forcePasswordChange(account.id);
          onStatusChange(account.id, AccountStatus.ForcePasswordChange);
          toast.success('User will be required to change password on next login');
          break;
      }
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  // Determine available actions based on current status
  const getAvailableActions = () => {
    const actions = [];
    
    switch (account.status) {
      case AccountStatus.Active:
        actions.push({ key: 'suspend', label: 'Suspend Account', icon: '⛔', variant: 'error' });
        actions.push({ key: 'force_password', label: 'Force Password Change', icon: '🔑', variant: 'warning' });
        actions.push({ key: 'archive', label: 'Archive Account', icon: '📦', variant: 'neutral' });
        break;
        
      case AccountStatus.Suspended:
        actions.push({ key: 'activate', label: 'Activate Account', icon: '✓', variant: 'success' });
        actions.push({ key: 'archive', label: 'Archive Account', icon: '📦', variant: 'neutral' });
        break;
        
      case AccountStatus.Locked:
        actions.push({ key: 'unlock', label: 'Unlock Account', icon: '🔓', variant: 'success' });
        actions.push({ key: 'activate', label: 'Activate Account', icon: '✓', variant: 'success' });
        break;
        
      case AccountStatus.Archived:
        actions.push({ key: 'restore', label: 'Restore Account', icon: '♻️', variant: 'success' });
        break;
        
      case AccountStatus.PendingVerification:
        actions.push({ key: 'activate', label: 'Manually Verify', icon: '✓', variant: 'success' });
        break;
        
      case AccountStatus.ForcePasswordChange:
        actions.push({ key: 'activate', label: 'Remove Password Requirement', icon: '✓', variant: 'success' });
        actions.push({ key: 'suspend', label: 'Suspend Account', icon: '⛔', variant: 'error' });
        break;
    }
    
    return actions;
  };

  return (
    <>
      <div className="dropdown dropdown-end">
        <button 
          tabIndex={0} 
          className="btn btn-ghost btn-sm"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <EllipsisVerticalIcon className="w-5 h-5" />
          )}
        </button>
        
        {isOpen && (
          <ul className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-56 z-50">
            <li className="menu-title">
              <span>Account Actions</span>
            </li>
            {getAvailableActions().map((action) => (
              <li key={action.key}>
                <button 
                  onClick={() => handleAction(action.key)}
                  className={`text-${action.variant}`}
                >
                  <span>{action.icon}</span>
                  {action.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Suspend Modal */}
      <SuspendAccountModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        onConfirm={async (reason) => {
          await API.Accounts.suspend(account.id, reason);
          onStatusChange(account.id, AccountStatus.Suspended);
          toast.success('Account suspended');
          setShowSuspendModal(false);
        }}
        accountName={account.name?.first + ' ' + account.name?.last}
      />
    </>
  );
}
```

#### 2.4 Suspend Account Modal

**File**: `client/app/_components/modals/SuspendAccountModal.tsx`

```tsx
interface SuspendAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  accountName: string;
}

export function SuspendAccountModal({ isOpen, onClose, onConfirm, accountName }: SuspendAccountModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onConfirm(reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Suspend Account</h2>
        
        <p className="text-base-content/70 mb-4">
          You are about to suspend the account for <strong>{accountName}</strong>.
          This user will not be able to log in until the account is reactivated.
        </p>
        
        <div className="mb-6">
          <label className="label">
            <span className="label-text">Reason for Suspension *</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="textarea textarea-bordered w-full h-24"
            placeholder="e.g., Policy violation, suspicious activity, etc."
          />
          <p className="text-xs text-base-content/50 mt-1">
            This reason will be stored for audit purposes.
          </p>
        </div>
        
        <div className="flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button 
            className="btn btn-error" 
            onClick={handleConfirm}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? 'Suspending...' : 'Suspend Account'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
```

#### 2.5 Account Details Page - Status Section

**File**: Update `client/app/app/accounts/[id]/page.tsx`

```tsx
// Add to account details page
<div className="card bg-base-100 shadow">
  <div className="card-body">
    <h2 className="card-title">Account Status</h2>
    
    {/* Current Status */}
    <div className="flex items-center justify-between py-4 border-b border-base-200">
      <span className="text-base-content/70">Current Status</span>
      <AccountStatusBadge status={account.status} size="lg" />
    </div>
    
    {/* Last Login */}
    <div className="flex items-center justify-between py-4 border-b border-base-200">
      <span className="text-base-content/70">Last Login</span>
      <span>
        {account.lastLoginAt 
          ? formatDistanceToNow(new Date(account.lastLoginAt), { addSuffix: true })
          : 'Never'}
      </span>
    </div>
    
    {/* Last Login IP */}
    {account.lastLoginIP && (
      <div className="flex items-center justify-between py-4 border-b border-base-200">
        <span className="text-base-content/70">Last Login IP</span>
        <code className="bg-base-200 px-2 py-1 rounded text-sm">{account.lastLoginIP}</code>
      </div>
    )}
    
    {/* Failed Login Attempts */}
    <div className="flex items-center justify-between py-4 border-b border-base-200">
      <span className="text-base-content/70">Failed Login Attempts</span>
      <span className={account.failedLoginAttempts > 0 ? 'text-warning font-semibold' : ''}>
        {account.failedLoginAttempts}
        {account.failedLoginAttempts >= 5 && ' (Account Locked)'}
      </span>
    </div>
    
    {/* Lock Status */}
    {account.status === AccountStatus.Locked && account.lockedUntil && (
      <div className="alert alert-warning mt-4">
        <LockClosedIcon className="w-5 h-5" />
        <span>
          Account locked until {format(new Date(account.lockedUntil), 'PPpp')}
        </span>
        <button 
          className="btn btn-sm btn-ghost"
          onClick={() => handleUnlock(account.id)}
        >
          Unlock Now
        </button>
      </div>
    )}
    
    {/* Suspension Reason */}
    {account.status === AccountStatus.Suspended && account.suspensionReason && (
      <div className="alert alert-error mt-4">
        <ExclamationTriangleIcon className="w-5 h-5" />
        <div>
          <p className="font-semibold">Suspension Reason:</p>
          <p>{account.suspensionReason}</p>
        </div>
      </div>
    )}
    
    {/* Admin Actions */}
    {currentUser.isAdmin() && (
      <div className="card-actions justify-end mt-4">
        <AccountActionsDropdown 
          account={account} 
          onStatusChange={handleStatusChange}
        />
      </div>
    )}
  </div>
</div>
```

#### 2.6 Accounts Table - Add Status Column

**File**: Update `client/app/app/accounts/_components/AccountsDataGrid.tsx`

```tsx
// Add to columns definition
{
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => (
    <AccountStatusBadge status={row.original.status} size="sm" />
  ),
  filterFn: (row, id, filterValue) => {
    if (!filterValue || filterValue === 'all') return true;
    return row.original.status === parseInt(filterValue);
  },
},

// Add filter dropdown
<select 
  className="select select-bordered select-sm"
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
>
  <option value="all">All Statuses</option>
  <option value="100">Active</option>
  <option value="0">Pending Verification</option>
  <option value="200">Suspended</option>
  <option value="300">Locked</option>
  <option value="400">Archived</option>
</select>
```

---

### 🟢 User Class Updates

**File**: `client/app/_classes/User.ts`

```typescript
// Add new properties to User class
export default class User {
  // ... existing properties ...
  
  // Phase 1 additions
  status: AccountStatus = AccountStatus.Active;
  failedLoginAttempts: number = 0;
  lockedUntil: string | null = null;
  lastLoginAt: string | null = null;
  lastLoginIP: string | null = null;
  forcePasswordChange: boolean = false;
  suspensionReason: string | null = null;
  archivedAt: string | null = null;

  constructor(data?: Partial<User>) {
    if (data) {
      Object.assign(this, data);
      // Ensure status is a number
      this.status = typeof data.status === 'number' 
        ? data.status 
        : AccountStatus.Active;
    }
  }

  // Helper methods
  isActive(): boolean {
    return this.status === AccountStatus.Active;
  }

  isLocked(): boolean {
    return this.status === AccountStatus.Locked;
  }

  isSuspended(): boolean {
    return this.status === AccountStatus.Suspended;
  }

  isArchived(): boolean {
    return this.status === AccountStatus.Archived;
  }

  canLogin(): boolean {
    return this.status === AccountStatus.Active || 
           this.status === AccountStatus.ForcePasswordChange;
  }

  needsPasswordChange(): boolean {
    return this.forcePasswordChange || 
           this.status === AccountStatus.ForcePasswordChange;
  }
}
```

---

### 🔵 API Client Updates

**File**: `client/app/_shared/services/api.ts`

```typescript
// Add to Accounts section
Accounts: {
  // ... existing methods ...
  
  // Phase 1: Account Status Management (Admin only)
  
  /**
   * Suspends an account (Admin only).
   * @param id - Account ID
   * @param reason - Reason for suspension
   */
  suspend: async (id: string, reason: string) =>
    HttpService.put<boolean>(`/account/${id}/suspend`, { reason }),
  
  /**
   * Activates a suspended/locked account (Admin only).
   * @param id - Account ID
   */
  activate: async (id: string) =>
    HttpService.put<boolean>(`/account/${id}/activate`, {}),
  
  /**
   * Unlocks a locked account (Admin only).
   * @param id - Account ID
   */
  unlock: async (id: string) =>
    HttpService.put<boolean>(`/account/${id}/unlock`, {}),
  
  /**
   * Archives (soft deletes) an account (Admin only).
   * @param id - Account ID
   */
  archive: async (id: string) =>
    HttpService.put<boolean>(`/account/${id}/archive`, {}),
  
  /**
   * Restores an archived account (Admin only).
   * @param id - Account ID
   */
  restore: async (id: string) =>
    HttpService.put<boolean>(`/account/${id}/restore`, {}),
  
  /**
   * Forces a user to change password on next login (Admin only).
   * @param id - Account ID
   */
  forcePasswordChange: async (id: string) =>
    HttpService.put<boolean>(`/account/${id}/force-password-change`, {}),
},
```

---

## Phase 2: Caching Layer Frontend Changes

### Minimal Frontend Changes Required

Phase 2 is primarily a backend optimization. Frontend changes are minimal:

#### 2.1 Performance Improvement Expectations

| Feature | Before | After | User Experience |
|---------|--------|-------|-----------------|
| Role lookup | ~50ms | ~5ms | Faster permission checks |
| User data fetch | ~50ms | ~10ms | Faster page loads |
| Sales team list | ~100ms | ~20ms | Faster dropdowns |

#### 2.2 Optional: Add Loading States

Since cached data loads faster, you may want to adjust loading state thresholds:

```tsx
// Before (might show loader for 50ms)
const { data, isLoading } = useQuery('user', fetchUser);

// After (add delay before showing loader)
const { data, isLoading } = useQuery('user', fetchUser);
const showLoader = isLoading && loadingTime > 200; // Only show if > 200ms
```

#### 2.3 Cache Invalidation Handling

When updating user data, the backend cache is automatically invalidated. No frontend changes needed, but be aware of eventual consistency:

```tsx
// After updating user, refetch to get fresh data
const updateUser = async (userData: User) => {
  await API.Accounts.update(userData);
  // Refetch to get latest (backend cache invalidated)
  await queryClient.invalidateQueries(['user', userData.id]);
};
```

---

## Phase 3: Audit Trail Frontend Changes

### 🟡 Admin: Audit Log Viewer

#### 3.1 Account Audit Log Component

**File**: `client/app/_components/admin/AccountAuditLog.tsx`

```tsx
interface AuditLogEntry {
  id: number;
  accountId: number;
  performedById: number | null;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  reason: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
  performedBy?: {
    name: string;
    email: string;
  };
}

interface AccountAuditLogProps {
  accountId: string;
}

export function AccountAuditLog({ accountId }: AccountAuditLogProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, [accountId]);

  const fetchAuditLogs = async () => {
    try {
      const { data } = await API.Accounts.getAuditLog(accountId);
      setLogs(data.payload || []);
    } catch (error) {
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      CREATED: { color: 'badge-success', label: 'Created' },
      UPDATED: { color: 'badge-info', label: 'Updated' },
      DELETED: { color: 'badge-error', label: 'Deleted' },
      ARCHIVED: { color: 'badge-neutral', label: 'Archived' },
      RESTORED: { color: 'badge-success', label: 'Restored' },
      ROLE_CHANGED: { color: 'badge-warning', label: 'Role Changed' },
      STATUS_CHANGED: { color: 'badge-warning', label: 'Status Changed' },
      PASSWORD_CHANGED: { color: 'badge-info', label: 'Password Changed' },
      PASSWORD_RESET: { color: 'badge-warning', label: 'Password Reset' },
      LOGIN_SUCCESS: { color: 'badge-success', label: 'Login Success' },
      LOGIN_FAILED: { color: 'badge-error', label: 'Login Failed' },
      LOCKED: { color: 'badge-error', label: 'Locked' },
      UNLOCKED: { color: 'badge-success', label: 'Unlocked' },
      SUSPENDED: { color: 'badge-error', label: 'Suspended' },
      ACTIVATED: { color: 'badge-success', label: 'Activated' },
    };
    
    return badges[action] || { color: 'badge-neutral', label: action };
  };

  if (isLoading) {
    return <div className="skeleton h-48 w-full" />;
  }

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h2 className="card-title">
          Activity Log
          <span className="badge badge-neutral">{logs.length}</span>
        </h2>
        
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Date</th>
                <th>Action</th>
                <th>Details</th>
                <th>Performed By</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const badge = getActionBadge(log.action);
                return (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap">
                      {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td>
                      <span className={`badge ${badge.color}`}>{badge.label}</span>
                    </td>
                    <td className="max-w-xs">
                      {log.reason && <p className="text-sm">{log.reason}</p>}
                      {log.oldValue && log.newValue && (
                        <p className="text-xs text-base-content/60">
                          {log.oldValue} → {log.newValue}
                        </p>
                      )}
                    </td>
                    <td>
                      {log.performedBy ? (
                        <span>{log.performedBy.name}</span>
                      ) : log.performedById ? (
                        <span className="text-base-content/60">User #{log.performedById}</span>
                      ) : (
                        <span className="text-base-content/40">System</span>
                      )}
                    </td>
                    <td>
                      {log.ipAddress && (
                        <code className="text-xs">{log.ipAddress}</code>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {logs.length === 0 && (
            <div className="text-center py-8 text-base-content/50">
              No activity recorded
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

#### 3.2 Security Events Dashboard (Admin)

**File**: `client/app/app/admin/security/page.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';

interface SecurityEvent {
  action: string;
  count: number;
  lastOccurrence: string;
}

export default function SecurityDashboardPage() {
  const [recentFailedLogins, setRecentFailedLogins] = useState([]);
  const [lockedAccounts, setLockedAccounts] = useState([]);
  const [suspendedAccounts, setSuspendedAccounts] = useState([]);
  const [securityStats, setSecurityStats] = useState<SecurityEvent[]>([]);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    // Fetch recent failed logins
    const failedLogins = await API.Accounts.getAuditByAction('LOGIN_FAILED');
    setRecentFailedLogins(failedLogins.data.payload || []);
    
    // Fetch locked accounts
    const locked = await API.Accounts.search({ 
      filters: { status: AccountStatus.Locked.toString() },
      pageSize: 100 
    });
    setLockedAccounts(locked.data.payload?.data || []);
    
    // Fetch suspended accounts
    const suspended = await API.Accounts.search({ 
      filters: { status: AccountStatus.Suspended.toString() },
      pageSize: 100 
    });
    setSuspendedAccounts(suspended.data.payload?.data || []);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Security Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-error">
            <LockClosedIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Locked Accounts</div>
          <div className="stat-value text-error">{lockedAccounts.length}</div>
          <div className="stat-desc">Due to failed logins</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-warning">
            <ExclamationTriangleIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Suspended Accounts</div>
          <div className="stat-value text-warning">{suspendedAccounts.length}</div>
          <div className="stat-desc">By administrators</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-error">
            <ShieldExclamationIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Failed Logins (24h)</div>
          <div className="stat-value text-error">{recentFailedLogins.length}</div>
          <div className="stat-desc">Last 24 hours</div>
        </div>
      </div>

      {/* Locked Accounts Table */}
      <div className="card bg-base-100 shadow mb-6">
        <div className="card-body">
          <h2 className="card-title text-error">
            <LockClosedIcon className="w-5 h-5" />
            Locked Accounts
          </h2>
          
          {lockedAccounts.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Locked Until</th>
                  <th>Failed Attempts</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lockedAccounts.map((account) => (
                  <tr key={account.id}>
                    <td>{account.name?.first} {account.name?.last}</td>
                    <td>{account.email}</td>
                    <td>
                      {account.lockedUntil 
                        ? format(new Date(account.lockedUntil), 'PPpp')
                        : 'Indefinite'}
                    </td>
                    <td>{account.failedLoginAttempts}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-success"
                        onClick={() => handleUnlock(account.id)}
                      >
                        Unlock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-base-content/50">No locked accounts</p>
          )}
        </div>
      </div>

      {/* Recent Failed Logins */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">
            Recent Failed Login Attempts
          </h2>
          
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Account</th>
                  <th>IP Address</th>
                  <th>Attempts</th>
                </tr>
              </thead>
              <tbody>
                {recentFailedLogins.slice(0, 20).map((log, i) => (
                  <tr key={i}>
                    <td>{format(new Date(log.timestamp), 'PPpp')}</td>
                    <td>Account #{log.accountId}</td>
                    <td><code>{log.ipAddress || 'Unknown'}</code></td>
                    <td>{log.newValue || '1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Phase 4: Cleanup & Optimization Frontend Changes

### 4.1 Use New DTOs (AccountSummary)

When Phase 4 is complete, update components to use lightweight DTOs:

```tsx
// Before (full User object)
const { data: users } = await API.Accounts.getAll();

// After (lightweight AccountSummary)
const { data: summaries } = await API.Accounts.getSummaries();

// Use in lists/tables where full data isn't needed
<AccountListItem account={summary} /> // Uses AccountSummary
```

### 4.2 Sales Rep Dropdown Optimization

```tsx
// Before
const { data } = await API.Accounts.getByRole([AccountRole.SalesRep, AccountRole.SalesManager]);
const options = data.payload.map(u => ({
  value: u.id,
  label: `${u.name.first} ${u.name.last}`
}));

// After (using optimized endpoint)
const { data } = await API.Accounts.getSalesRepOptions();
// Backend returns pre-formatted options: { id, fullName, email, role }
```

---

## Component Library Requirements

### New Components Needed

| Component | Priority | Phase | Purpose |
|-----------|----------|-------|---------|
| `AccountLockedModal` | 🔴 Critical | 0-1 | Login page lockout message |
| `AccountSuspendedModal` | 🔴 Critical | 0-1 | Login page suspension message |
| `EmailVerificationModal` | 🟡 High | 0-1 | Login page verification prompt |
| `AccountStatusBadge` | 🟡 High | 1 | Display status in tables/cards |
| `AccountActionsDropdown` | 🟡 High | 1 | Admin status management |
| `SuspendAccountModal` | 🟡 High | 1 | Suspend with reason form |
| `AccountAuditLog` | 🟢 Medium | 3 | Activity history viewer |
| `SecurityDashboard` | 🟢 Medium | 3 | Security events overview |

### Modified Components

| Component | Changes | Phase |
|-----------|---------|-------|
| Login page | Add status error handling | 0-1 |
| Accounts table | Add status column, filters | 1 |
| Account detail page | Add status section | 1 |
| User class | Add status properties | 1 |
| API client | Add status management methods | 1 |
| Enums | Add AccountStatus enum | 1 |

---

## API Client Updates Summary

### New Methods Required

```typescript
// Phase 0-1 Required
API.Accounts.suspend(id: string, reason: string)
API.Accounts.activate(id: string)
API.Accounts.unlock(id: string)
API.Accounts.archive(id: string)
API.Accounts.restore(id: string)
API.Accounts.forcePasswordChange(id: string)

// Phase 3 Required
API.Accounts.getAuditLog(accountId: string)
API.Accounts.getAuditByAction(action: string, since?: Date)

// Phase 4 Optional
API.Accounts.getSummaries()
API.Accounts.getSalesRepOptions()
```

---

## Implementation Priority

### 🔴 Phase 0-1: Critical (This Week)

| Task | Effort | Impact |
|------|--------|--------|
| Login error handling | 2 hrs | Users see proper lockout messages |
| AccountLockedModal | 1 hr | Clear UX for locked users |
| AccountSuspendedModal | 1 hr | Clear UX for suspended users |
| AccountStatus enum | 30 min | Type safety |
| User class updates | 30 min | Data model alignment |
| API client methods | 1 hr | Enable admin actions |
| AccountStatusBadge | 1 hr | Visual status indicators |
| Accounts table status column | 1 hr | Status visibility in lists |

**Total Estimated: 8-10 hours**

### 🟡 Phase 1 Extended: High Priority (Next Week)

| Task | Effort | Impact |
|------|--------|--------|
| AccountActionsDropdown | 2 hrs | Admin can manage status |
| SuspendAccountModal | 1 hr | Proper suspension workflow |
| Account detail status section | 2 hrs | Full status visibility |
| Force password change page | 2 hrs | Security compliance |

**Total Estimated: 7-9 hours**

### 🟢 Phase 3: Medium Priority (Future)

| Task | Effort | Impact |
|------|--------|--------|
| AccountAuditLog component | 3 hrs | Activity tracking |
| Security Dashboard | 4 hrs | Admin security overview |
| Audit API methods | 1 hr | Data access |

**Total Estimated: 8-10 hours**

### ⚪ Phase 4: Low Priority (Optional)

| Task | Effort | Impact |
|------|--------|--------|
| Use AccountSummary DTOs | 2 hrs | Minor performance gain |
| Optimized sales rep dropdown | 1 hr | Faster dropdown loading |

**Total Estimated: 3-4 hours**

---

## Testing Checklist

### Login Flow Testing

- [ ] Enter wrong password 5 times → See lockout modal
- [ ] Try login while locked → See lockout modal
- [ ] Try login while suspended → See suspension modal
- [ ] Try login with unverified email → See verification modal
- [ ] Login with force password change → Redirect to password change

### Admin Actions Testing

- [ ] Admin can view account status
- [ ] Admin can suspend account with reason
- [ ] Admin can activate suspended account
- [ ] Admin can unlock locked account
- [ ] Admin can archive account
- [ ] Admin can restore archived account
- [ ] Admin can force password change

### UI/UX Testing

- [ ] Status badges display correctly
- [ ] Status filters work in accounts table
- [ ] Modals close properly
- [ ] Toast notifications show correctly
- [ ] Loading states display during actions

---

## Conclusion

This document outlines all frontend changes needed to support the backend Account System improvements. 

**Immediate Priority:**
1. Implement login error handling (Phase 0-1)
2. Add modal components for status messages
3. Update API client with new methods
4. Add AccountStatus to frontend enums/classes

**Key User Experience Improvements:**
- Users know WHY they can't log in (locked, suspended, etc.)
- Users get clear instructions on what to do
- Admins can manage account status through UI
- Security events are visible and actionable

---

*Document created: December 16, 2025*  
*Author: Frontend Architecture Review*

