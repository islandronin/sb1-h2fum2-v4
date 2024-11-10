import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface TagsContextType {
  tags: string[];
  addTag: (tag: string) => void;
}

const TagsContext = createContext<TagsContextType | undefined>(undefined);

export function TagsProvider({ children }: { children: React.ReactNode }) {
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const { data: contacts } = await supabase
        .from('contacts')
        .select('tags');

      if (contacts) {
        const allTags = contacts
          .flatMap(contact => contact.tags || [])
          .filter(Boolean);
        
        // Get unique tags
        const uniqueTags = [...new Set(allTags)];
        setTags(uniqueTags);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  return (
    <TagsContext.Provider value={{ tags, addTag }}>
      {children}
    </TagsContext.Provider>
  );
}

export function useTags() {
  const context = useContext(TagsContext);
  if (context === undefined) {
    throw new Error('useTags must be used within a TagsProvider');
  }
  return context;
}