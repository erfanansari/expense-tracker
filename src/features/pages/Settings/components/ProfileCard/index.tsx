import { useState } from 'react';

import { Loader2, User } from 'lucide-react';

import Button from '@components/Button';
import { useToast } from '@components/Toast/ToastProvider';

import { useAuth } from '@hooks/use-auth';
import { useUpdateUserProfile } from '@hooks/use-user-profile';

import { ensureError } from '@utils';

const ProfileCard = () => {
  // States
  const [editedName, setEditedName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Customs
  const { user } = useAuth();
  const { showToast } = useToast();
  const updateProfile = useUpdateUserProfile();

  // Variables
  const nameValue = isEditing ? editedName : (user?.name ?? '');

  // Callbacks
  const handleEdit = () => {
    setEditedName(user?.name ?? '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedName.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    if (editedName.trim() === user?.name) {
      setIsEditing(false);
      return;
    }

    try {
      await updateProfile.mutateAsync(editedName.trim());
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (err) {
      showToast(ensureError(err).message, 'error');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="border-border-subtle bg-background rounded-xl border shadow-sm">
      <div className="border-border-subtle border-b p-6">
        <div className="flex items-center gap-3">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2">
            <User className="text-text-secondary h-5 w-5" />
          </div>
          <div>
            <h2 className="text-text-primary text-lg font-semibold">Profile</h2>
            <p className="text-text-muted text-sm">Update your personal information</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid max-w-2xl gap-4">
          {/* Email - Read Only */}
          <div>
            <label className="text-text-secondary mb-2 block text-sm font-medium">Email</label>
            <div className="border-border-subtle bg-background-secondary text-text-muted w-full rounded-lg border px-4 py-2.5">
              {user?.email || 'Loading...'}
            </div>
            <p className="text-text-muted mt-1 text-xs">Your email cannot be changed</p>
          </div>

          {/* Name - Editable */}
          <div>
            <label className="text-text-secondary mb-2 block text-sm font-medium">Name</label>
            <input
              type="text"
              value={nameValue}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="Enter your name"
              disabled={!isEditing}
              className="border-border-subtle bg-background text-text-primary focus:border-blue w-full rounded-lg border px-4 py-2.5 transition-[opacity,border-color] duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex min-h-[42px] gap-3 pt-2">
            {!isEditing ? (
              <Button variant="outline" onClick={handleEdit}>
                Edit Profile
              </Button>
            ) : (
              <>
                <Button variant="primary" onClick={handleSave} disabled={updateProfile.isPending}>
                  {updateProfile.isPending && <Loader2 className="h-4 w-4 shrink-0 animate-spin" />}
                  <span>{updateProfile.isPending ? 'Saving...' : 'Save Changes'}</span>
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={updateProfile.isPending}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
