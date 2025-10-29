import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/main';
import { Link } from 'react-router-dom';
import { FaUserEdit, FaUserSlash, FaCheckCircle, FaTimesCircle, FaImage } from 'react-icons/fa';

const UV_Profile: React.FC = () => {
  // Zustand store access
  const user = useAppStore(state => state.authentication_state.current_user);
  const fetchUserProfile = useAppStore(state => state.fetchUserProfile);
  const update_user_profile = useAppStore(state => state.update_user_profile);
  const logout_user = useAppStore(state => state.logout_user);
  const error_message = useAppStore(state => state.authentication_state.error_message);
  const clear_auth_error = useAppStore(state => state.clear_auth_error);

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
  });
  const [profilePicture, setProfilePicture] = useState(user?.profile_picture || '');
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    if (!user) return;
    fetchUserProfile();
  }, [user, fetchUserProfile]);

  // Reset form on user change
  useEffect(() => {
    if (user) {
      setFormValues({
        username: user.username,
        email: user.email,
        password: '',
      });
      setProfilePicture(user.profile_picture || '');
      setPictureFile(null);
    }
  }, [user]);

  // Handle form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({...prev, [name]: value }));
    clearAuthError();
  };

  // Handle profile picture upload
  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a JPEG or PNG image');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }

    setPictureFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfilePicture(event.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Save profile changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    
    try {
      await update_user_profile({
        username: formValues.username,
        email: formValues.email,
        password: formValues.password,
        profile_picture: pictureFile? pictureFile.name : undefined,
      });
      
      // Reset edit mode
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      // Simulate deletion process
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Actual deletion would use DELETE /users/{user_id}
      logout_user();
      setDeleteConfirm(false);
    } catch (error) {
      console.error('Account deletion failed:', error);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormValues({
      username: user?.username || '',
      email: user?.email || '',
      password: '',
    });
    setProfilePicture(user?.profile_picture || '');
    setPictureFile(null);
    clearAuthError();
  };

  // Display logic
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {user.username}'s Profile
            </h1>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Profile Section */}
          <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-12">
            <div className="flex items-center justify-between border-b border-gray-200 pb-6">
              <div className="flex items-center">
                <div className="relative w-24 h-24 rounded-full overflow-hidden">
                  {profilePicture? (
                    <img 
                      src={profilePicture} 
                      alt="Profile picture" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FaUserEdit size={40} />
                    </div>
                  )}
                  <label htmlFor="profilePicture" className="absolute inset-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full cursor-pointer transition-all">
                    <span className="absolute inset-0 flex items-center justify-center">
                      <FaImage size={20} className="mr-1" />
                      Upload
                    </span>
                  </label>
                </div>
                <input 
                  type="file" 
                  id="profilePicture" 
                  className="hidden" 
                  onChange={handlePictureUpload} 
                  accept=".jpg,.jpeg,.png"
                />
                <div className="ml-6">
                  <h2 className="text-2xl font-semibold text-gray-900">{user.username}</h2>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                {isEditing? (
                  <FaTimesCircle size={20} className="mr-1" />
                ) : (
                  <FaUserEdit size={20} className="mr-1" />
                )}
                {isEditing? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-700">Total Plays</h3>
                <p className="text-gray-600 mt-1">{user.total_plays || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-700">Highest Score</h3>
                <p className="text-gray-600 mt-1">{user.highest_score || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-700">Levels Completed</h3>
                <p className="text-gray-600 mt-1">{user.levels_completed || 0}</p>
              </div>
            </div>

            {/* Badges */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-700">Badges</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {user.badges?.map((badge, index) => (
                  <div 
                    key={`badge-${index}`}
                    className="bg-gray-100 p-3 rounded-full flex items-center justify-center"
                  >
                    <span className="text-sm text-gray-600">{badge}</span>
                  </div>
                ))}
                {!user.badges || user.badges.length === 0? (
                  <div className="col-span-4 text-center text-gray-500">
                    No badges earned yet
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          {/* Edit Form */}
          {isEditing && (
            <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-12">
              <form onSubmit={handleSave} className="space-y-6">
                {/* Error Message */}
                {error_message && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 0v-4l.01-12M12 20.94m-9.3-6.47a12 12 0 0115.4 0.75h3a10.5 10.5 0 011 10.293l5.147 4.145a.75.75 0 01.08 1.072l-71 2.15a.75.75 0 01-.53-.662l-2.15-4.147a11.02 11.02 0 01-.16-11.38M18.75 18.75l-1.07-1.07M15.8 7.21l-2.94 2.94a.75.75 0 01-1.06 0l-2.94-2.94M14.31 21.75a10 10 0 01-2.14 1.02l-2.2 2.2a.75.75 0 01-1.08 0l-2.2-2.2a11.99 11.99 0 013.7-3.7z" />
                      </svg>
                      <span>{error_message}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formValues.username}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formValues.email}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    New Password (optional)
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formValues.password}
                    onChange={handleInputChange}
                    placeholder="•••••••"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 mr-3 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isEditing}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Danger Zone */}
          <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="bg-red-50 p-4 rounded-md">
              <h3 className="text-lg font-semibold text-red-800">Danger Zone</h3>
              <div className="mt-4">
                <div className="bg-red-100 p-3 rounded-md mb-4">
                  <h4 className="text-sm font-medium text-red-800">Delete Account</h4>
                  <p className="text-sm text-red-700 mt-1">
                    This action is permanent and cannot be undone.
                  </p>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(true)}
                    className="mt-3 bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Confirmation Modal */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-900">Delete Account</h2>
                <p className="text-gray-600 mt-3">Are you sure you want to delete your account?</p>
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(false)}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 mr-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default UV_Profile;