import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloseOutline, IoImageOutline } from 'react-icons/io5';
import { toast } from 'react-hot-toast';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdate: (updatedData: any) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(user?.profileImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      if (fileInputRef.current?.files?.[0]) {
        formDataToSend.append('profileImage', fileInputRef.current.files[0]);
      }

      const response = await fetch('http://localhost:3145/users/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const updatedUser = await response.json();
      onUpdate(updatedUser);
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full max-w-md shadow-xl
                     border border-white/20"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <IoCloseOutline className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IoImageOutline className="text-3xl text-white/60" />
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2
                             shadow-lg hover:bg-blue-600 transition-colors"
                  >
                    <IoImageOutline className="text-white text-lg" />
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg
                           text-white placeholder-white/60 focus:outline-none focus:ring-2
                           focus:ring-blue-500 focus:border-transparent"
                  placeholder="Name"
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg
                           text-white placeholder-white/60 focus:outline-none focus:ring-2
                           focus:ring-blue-500 focus:border-transparent"
                  placeholder="Email"
                />
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg
                           text-white placeholder-white/60 focus:outline-none focus:ring-2
                           focus:ring-blue-500 focus:border-transparent resize-none h-24"
                  placeholder="Bio"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className="w-full py-2 bg-blue-500 text-white rounded-lg shadow-lg
                         hover:bg-blue-600 transition-colors disabled:opacity-50
                         disabled:cursor-not-allowed"
                type="submit"
              >
                {isLoading ? 'Updating...' : 'Save Changes'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 