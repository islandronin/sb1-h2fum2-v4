import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import type { Contact, ContactMethod, SocialLink } from '../types/Contact';
import { useSocialNetworks } from '../context/SocialNetworksContext';
import { TagInput } from './TagInput';

interface EditContactModalProps {
  contact: Contact;
  onClose: () => void;
  onSave: (contact: Contact) => void;
}

export function EditContactModal({ contact, onClose, onSave }: EditContactModalProps) {
  const { networks } = useSocialNetworks();
  const [formData, setFormData] = useState({
    name: contact.name || '',
    jobTitle: contact.jobTitle || '',
    imageUrl: contact.imageUrl || '',
    about: contact.about || '',
    website: contact.website || '',
    calendarLink: contact.calendarLink || '',
    contactMethods: Array.isArray(contact.contactMethods) ? [...contact.contactMethods] : [],
    socialLinks: Array.isArray(contact.socialLinks) ? [...contact.socialLinks] : [],
    tags: Array.isArray(contact.tags) ? contact.tags.join(', ') : '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedContact: Contact = {
      ...contact,
      name: formData.name,
      jobTitle: formData.jobTitle,
      imageUrl: formData.imageUrl,
      about: formData.about,
      website: formData.website,
      calendarLink: formData.calendarLink,
      contactMethods: formData.contactMethods,
      socialLinks: formData.socialLinks,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    onSave(updatedContact);
    onClose();
  };

  const addContactMethod = (type: 'email' | 'phone') => {
    const newMethod: ContactMethod = {
      type,
      value: '',
      isPrimary: formData.contactMethods.filter(m => m.type === type).length === 0,
    };
    setFormData(prev => ({
      ...prev,
      contactMethods: [...prev.contactMethods, newMethod],
    }));
  };

  const removeContactMethod = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contactMethods: prev.contactMethods.filter((_, i) => i !== index),
    }));
  };

  const updateContactMethod = (index: number, field: keyof ContactMethod, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      contactMethods: prev.contactMethods.map((method, i) => {
        if (i === index) {
          if (field === 'isPrimary' && value === true) {
            // Ensure only one primary per type
            return {
              ...method,
              isPrimary: true,
            };
          }
          return { ...method, [field]: value };
        }
        if (field === 'isPrimary' && value === true && method.type === prev.contactMethods[index].type) {
          return { ...method, isPrimary: false };
        }
        return method;
      }),
    }));
  };

  const addSocialLink = () => {
    const newLink: SocialLink = {
      platform: networks[0],
      url: '',
    };
    setFormData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, newLink],
    }));
  };

  const removeSocialLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Edit Contact</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
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
              Profile Image URL
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
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
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Contact Methods
              </label>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => addContactMethod('email')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Add Email
                </button>
                <button
                  type="button"
                  onClick={() => addContactMethod('phone')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Add Phone
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {formData.contactMethods.map((method, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type={method.type === 'email' ? 'email' : 'tel'}
                    value={method.value}
                    onChange={(e) => updateContactMethod(index, 'value', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder={method.type === 'email' ? 'Email address' : 'Phone number'}
                  />
                  <label className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={method.isPrimary}
                      onChange={(e) => updateContactMethod(index, 'isPrimary', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">Primary</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeContactMethod(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Social Networks
              </label>
              <button
                type="button"
                onClick={addSocialLink}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Add Social Link
              </button>
            </div>
            <div className="space-y-3">
              {formData.socialLinks.map((link, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <select
                    value={link.platform}
                    onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {networks.map((network) => (
                      <option key={network} value={network}>
                        {network.charAt(0).toUpperCase() + network.slice(1)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder={`${link.platform} URL`}
                  />
                  <button
                    type="button"
                    onClick={() => removeSocialLink(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <TagInput
              value={formData.tags}
              onChange={(value) => setFormData(prev => ({ ...prev, tags: value }))}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}