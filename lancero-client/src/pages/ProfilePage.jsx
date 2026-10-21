import { useState } from 'react';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const inputClasses = 'field';

const cardClasses = 'card';

const formatMemberSince = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('en-PH', { year: 'numeric', month: 'long' });
};

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: user.name, email: user.email });
  const [profileStatus, setProfileStatus] = useState({ error: '', success: '', submitting: false });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState({ error: '', success: '', submitting: false });

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileStatus({ error: '', success: '', submitting: true });

    try {
      await updateProfile(profileForm);
      setProfileStatus({ error: '', success: 'Profile updated successfully.', submitting: false });
    } catch (err) {
      setProfileStatus({
        error: err.response?.data?.message || 'Could not update profile. Please try again.',
        success: '',
        submitting: false,
      });
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ error: 'New password and confirmation do not match.', success: '', submitting: false });
      return;
    }

    setPasswordStatus({ error: '', success: '', submitting: true });

    try {
      await changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStatus({ error: '', success: 'Password changed successfully.', submitting: false });
    } catch (err) {
      setPasswordStatus({
        error: err.response?.data?.message || 'Could not change password. Please try again.',
        success: '',
        submitting: false,
      });
    }
  };

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const memberSince = formatMemberSince(user.createdAt);

  return (
    <>
      <section className="hero">
        <div className="wrap flex flex-wrap items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400 shadow-lg text-2xl font-bold text-zinc-900">
            {initials}
          </div>
          <div>
            <p className="eyebrow-light">
              My Account
            </p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-50 sm:text-3xl">{user.name}</h1>
            <p className="mt-1 text-sm text-zinc-100">
              {user.email} · <span className="capitalize">{user.role}</span>
              {memberSince ? ` · Member since ${memberSince}` : ''}
            </p>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap grid gap-6 lg:grid-cols-2">
          <div className={cardClasses}>
            <p className="eyebrow">
              Account Details
            </p>
            <h2 className="mt-2 text-lg font-semibold text-zinc-900">Edit Profile</h2>

            {profileStatus.error && (
              <div className="alert-error mt-4">
                {profileStatus.error}
              </div>
            )}
            {profileStatus.success && (
              <div className="alert-success mt-4">
                {profileStatus.success}
              </div>
            )}

            <form className="mt-5 space-y-4" onSubmit={handleProfileSubmit}>
              <div>
                <label htmlFor="profile-name" className="field-label">
                  Full Name
                </label>
                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  className={inputClasses}
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="profile-email" className="field-label">
                  Email Address
                </label>
                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  className={inputClasses}
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <Button type="submit" variant="primary" className="w-full rounded-xl py-3 text-[11px] tracking-[0.2em]" disabled={profileStatus.submitting}>
                {profileStatus.submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>

          <div className={cardClasses}>
            <p className="eyebrow">
              Security
            </p>
            <h2 className="mt-2 text-lg font-semibold text-zinc-900">Change Password</h2>

            {passwordStatus.error && (
              <div className="alert-error mt-4">
                {passwordStatus.error}
              </div>
            )}
            {passwordStatus.success && (
              <div className="alert-success mt-4">
                {passwordStatus.success}
              </div>
            )}

            <form className="mt-5 space-y-4" onSubmit={handlePasswordSubmit}>
              <div>
                <label htmlFor="current-password" className="field-label">
                  Current Password
                </label>
                <input
                  id="current-password"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  className={inputClasses}
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="new-password" className="field-label">
                  New Password
                </label>
                <input
                  id="new-password"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  className={inputClasses}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="field-label">
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  className={inputClasses}
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <Button type="submit" variant="primary" className="w-full rounded-xl py-3 text-[11px] tracking-[0.2em]" disabled={passwordStatus.submitting}>
                {passwordStatus.submitting ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProfilePage;