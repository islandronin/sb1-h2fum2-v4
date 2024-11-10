import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

export class ApiError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  contacts: {
    async getAll(userId: string) {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select(`
            *,
            contact_methods (*),
            social_links (*),
            conversations (*)
          `)
          .eq('user_id', userId);

        if (error) throw new ApiError(error.message, error.code, error.details);
        return data || [];
      } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to fetch contacts', undefined, error);
      }
    },

    async create(contact: Database['public']['Tables']['contacts']['Insert']) {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .insert([contact])
          .select()
          .single();

        if (error) throw new ApiError(error.message, error.code, error.details);
        return data;
      } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to create contact', undefined, error);
      }
    },

    async update(id: string, contact: Database['public']['Tables']['contacts']['Update'], userId: string) {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .update(contact)
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw new ApiError(error.message, error.code, error.details);
        return data;
      } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to update contact', undefined, error);
      }
    },

    async delete(id: string, userId: string) {
      try {
        const { error } = await supabase
          .from('contacts')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw new ApiError(error.message, error.code, error.details);
      } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to delete contact', undefined, error);
      }
    }
  },

  auth: {
    async signUp(email: string, password: string, name: string) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name }
          }
        });

        if (error) throw new ApiError(error.message, error.code, error.details);
        return data;
      } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to sign up', undefined, error);
      }
    },

    async signIn(email: string, password: string) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw new ApiError(error.message, error.code, error.details);
        return data;
      } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to sign in', undefined, error);
      }
    },

    async signOut() {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw new ApiError(error.message, error.code, error.details);
      } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to sign out', undefined, error);
      }
    },

    async getSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw new ApiError(error.message, error.code, error.details);
        return data.session;
      } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to get session', undefined, error);
      }
    }
  }
};