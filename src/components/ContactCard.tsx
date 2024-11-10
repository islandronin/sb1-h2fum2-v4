import React, { useState } from 'react';
import { ContactProfile } from './ContactProfile';
import { UserCircle, Mail, Phone } from 'lucide-react';
import type { Contact } from '../types/Contact';

interface ContactCardProps {
  contact: Contact;
  onUpdateContact: (contact: Contact) => void;
}

export function ContactCard({ contact, onUpdateContact }: ContactCardProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const primaryEmail = contact.contactMethods?.find(
    method => method.type === 'email' && method.isPrimary
  );
  const primaryPhone = contact.contactMethods?.find(
    method => method.type === 'phone' && method.isPrimary
  );

  return (
    <>
      <div
        onClick={() => setShowProfile(true)}
        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div className="flex items-start space-x-4">
          {imageError || !contact.imageUrl ? (
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <UserCircle className="w-12 h-12 text-gray-400" />
            </div>
          ) : (
            <img
              src={contact.imageUrl}
              alt={contact.name}
              onError={handleImageError}
              className="w-16 h-16 rounded-full object-cover bg-gray-100"
            />
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
            {contact.jobTitle && (
              <p className="text-gray-600 text-sm mb-2">{contact.jobTitle}</p>
            )}
            <div className="space-y-1">
              {primaryEmail && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Mail className="w-4 h-4" />
                  <span>{primaryEmail.value}</span>
                </div>
              )}
              {primaryPhone && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Phone className="w-4 h-4" />
                  <span>{primaryPhone.value}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showProfile && (
        <ContactProfile
          contact={contact}
          onClose={() => setShowProfile(false)}
          onUpdate={onUpdateContact}
        />
      )}
    </>
  );
}