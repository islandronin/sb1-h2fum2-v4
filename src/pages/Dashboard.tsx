import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AddContactModal } from '../components/AddContactModal';
import { ContactCard } from '../components/ContactCard';
import { UserCircle, LogOut, Plus, AlertCircle } from 'lucide-react';
import { api, ApiError } from '../services/api';
import type { Contact } from '../types/Contact';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContacts();
  }, [user]);

  const loadContacts = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.contacts.getAll(user.id);
      setContacts(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load contacts';
      setError(message);
      console.error('Error loading contacts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = async (contactData: Partial<Contact>) => {
    if (!user?.id) return;

    try {
      const newContact = await api.contacts.create({
        user_id: user.id,
        name: contactData.name!,
        job_title: contactData.jobTitle || null,
        image_url: contactData.imageUrl || null,
        about: contactData.about || null,
        website: contactData.website || null,
        calendar_link: contactData.calendarLink || null,
        tags: contactData.tags || []
      });

      setContacts(prev => [...prev, newContact]);
      setShowAddModal(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to add contact';
      console.error('Error adding contact:', err);
      throw new Error(message);
    }
  };

  const handleUpdateContact = async (updatedContact: Contact) => {
    if (!user?.id || !updatedContact.id) return;

    try {
      const contact = await api.contacts.update(updatedContact.id, {
        name: updatedContact.name,
        job_title: updatedContact.jobTitle || null,
        image_url: updatedContact.imageUrl || null,
        about: updatedContact.about || null,
        website: updatedContact.website || null,
        calendar_link: updatedContact.calendarLink || null,
        tags: updatedContact.tags || []
      }, user.id);

      setContacts(prev =>
        prev.map(c => c.id === contact.id ? contact : c)
      );
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to update contact';
      console.error('Error updating contact:', err);
      throw new Error(message);
    }
  };

  const handleLogout = async () => {
    try {
      await api.auth.signOut();
      logout();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to sign out';
      console.error('Error signing out:', err);
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Networking CRM</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserCircle className="w-6 h-6 text-gray-600" />
                <span className="text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">My Contacts</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Contact</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : contacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onUpdateContact={handleUpdateContact}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts yet</h3>
            <p className="text-gray-500">Click the Add Contact button to get started</p>
          </div>
        )}
      </main>

      {showAddModal && (
        <AddContactModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddContact}
        />
      )}
    </div>
  );
}