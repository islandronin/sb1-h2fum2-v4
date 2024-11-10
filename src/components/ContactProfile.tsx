import React, { useState } from 'react';
import { X, Mail, Phone, Calendar, Globe, Twitter, Linkedin, Github, MessageCircle, Edit2, Plus, UserCircle } from 'lucide-react';
import type { Contact, Conversation } from '../types/Contact';
import { ConversationModal } from './ConversationModal';
import { EditContactModal } from './EditContactModal';

interface ContactProfileProps {
  contact: Contact;
  onClose: () => void;
  onUpdate: (contact: Contact) => void;
}

export function ContactProfile({ contact, onClose, onUpdate }: ContactProfileProps) {
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const socialLinks = Array.isArray(contact.socialLinks) ? contact.socialLinks : [];
  const contactMethods = Array.isArray(contact.contactMethods) ? contact.contactMethods : [];
  const conversations = Array.isArray(contact.conversations) ? contact.conversations : [];
  const tags = Array.isArray(contact.tags) ? contact.tags : [];

  const handleAddConversation = (data: { date: string; summary: string; transcript: string }) => {
    const newConversation: Conversation = {
      date: data.date,
      summary: data.summary,
      transcript: data.transcript,
    };

    const updatedContact = {
      ...contact,
      conversations: [...conversations, newConversation],
    };

    onUpdate(updatedContact);
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return Twitter;
      case 'linkedin': return Linkedin;
      case 'github': return Github;
      default: return Globe;
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 m-4">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            {imageError || !contact.imageUrl ? (
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <UserCircle className="w-16 h-16 text-gray-400" />
              </div>
            ) : (
              <img
                src={contact.imageUrl}
                alt={contact.name}
                onError={handleImageError}
                className="w-20 h-20 rounded-full object-cover bg-gray-100"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{contact.name}</h2>
              {contact.jobTitle && (
                <p className="text-gray-600">{contact.jobTitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="text-gray-500 hover:text-gray-700 p-2"
              title="Edit Contact"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-4">
              {contactMethods.filter(method => method.type === 'email').map((email, index) => (
                <div key={`email-${index}`} className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <a href={`mailto:${email.value}`} className="text-blue-600 hover:text-blue-800">
                    {email.value}
                  </a>
                  {email.isPrimary && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Primary</span>
                  )}
                </div>
              ))}

              {contactMethods.filter(method => method.type === 'phone').map((phone, index) => (
                <div key={`phone-${index}`} className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <a href={`tel:${phone.value}`} className="text-blue-600 hover:text-blue-800">
                    {phone.value}
                  </a>
                  {phone.isPrimary && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Primary</span>
                  )}
                </div>
              ))}

              {contact.calendarLink && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <a
                    href={contact.calendarLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Schedule Meeting
                  </a>
                </div>
              )}

              {contact.website && (
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <a
                    href={contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {contact.website}
                  </a>
                </div>
              )}
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-4">Social Networks</h3>
            <div className="space-y-4">
              {socialLinks.map((social, index) => {
                const Icon = getSocialIcon(social.platform);
                return (
                  <div key={`social-${index}`} className="flex items-center space-x-2">
                    <Icon className="w-5 h-5 text-gray-500" />
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}
                    </a>
                  </div>
                );
              })}
              {socialLinks.length === 0 && (
                <p className="text-gray-500 italic">No social networks added</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            {contact.about ? (
              <p className="text-gray-700 whitespace-pre-wrap mb-6">{contact.about}</p>
            ) : (
              <p className="text-gray-500 italic">No description available</p>
            )}

            {tags.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-semibold mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={`tag-${index}`}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Conversation History</h3>
                <button
                  onClick={() => setShowConversationModal(true)}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Conversation</span>
                </button>
              </div>
              
              {conversations.length > 0 ? (
                <div className="space-y-4">
                  {conversations.map((conversation, index) => (
                    <div
                      key={`conversation-${index}`}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {new Date(conversation.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{conversation.summary}</p>
                      {conversation.transcript && (
                        <details className="mt-2">
                          <summary className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                            View Transcript
                          </summary>
                          <div className="mt-2 p-3 bg-white rounded border text-sm text-gray-600">
                            <pre className="whitespace-pre-wrap font-sans">{conversation.transcript}</pre>
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No conversations recorded</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showConversationModal && (
        <ConversationModal
          onClose={() => setShowConversationModal(false)}
          onSave={handleAddConversation}
        />
      )}

      {showEditModal && (
        <EditContactModal
          contact={contact}
          onClose={() => setShowEditModal(false)}
          onSave={onUpdate}
        />
      )}
    </div>
  );
}