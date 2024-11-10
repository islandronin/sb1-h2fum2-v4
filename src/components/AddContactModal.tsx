import React, { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { fetchLinkedInProfile } from '../services/linkedinApi';
import { uploadContactImage, uploadImageFromUrl } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import type { Contact } from '../types/Contact';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contact: Partial<Contact>) => void;
}

export function AddContactModal({ isOpen, onClose, onSubmit }: AddContactModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    jobTitle: '',
    imageUrl: '',
    about: '',
    website: '',
    calendarLink: '',
    linkedinUrl: '',
    tags: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const imageUrl = await uploadContactImage(file, user.id);
      if (imageUrl) {
        setFormData(prev => ({ ...prev, imageUrl }));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInFetch = async () => {
    if (!formData.linkedinUrl || !user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const profile = await fetchLinkedInProfile(formData.linkedinUrl);
      
      setFormData(prev => ({
        ...prev,
        name: profile.name || prev.name,
        jobTitle: profile.jobTitle || prev.jobTitle,
        about: profile.about || prev.about,
      }));

      if (profile.imageUrl) {
        const imageUrl = await uploadImageFromUrl(profile.imageUrl, user.id);
        if (imageUrl) {
          setFormData(prev => ({ ...prev, imageUrl }));
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch LinkedIn profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    
    const contactData: Partial<Contact> = {
      name: formData.name.trim(),
      jobTitle: formData.jobTitle.trim(),
      imageUrl: formData.imageUrl,
      about: formData.about.trim(),
      website: formData.website.trim(),
      calendarLink: formData.calendarLink.trim(),
      contactMethods: [],
      socialLinks: [],
      conversations: [],
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    try {
      onSubmit(contactData);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add contact');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add New Contact</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn Profile URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://www.linkedin.com/in/username"
              />
              <button
                type="button"
                onClick={handleLinkedInFetch}
                disabled={isLoading || !formData.linkedinUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Fetch'
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Image
            </label>
            <div className="mt-1 flex items-center space-x-4">
              {formData.imageUrl && (
                <img
                  src={formData.imageUrl}
                  alt="Profile preview"
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <label className="cursor-pointer bg-white px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2">
                <Upload className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700">Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              About
            </label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calendar Link
            </label>
            <input
              type="url"
              name="calendarLink"
              value={formData.calendarLink}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="https://calendly.com/username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter tags separated by commas"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Add Contact'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}