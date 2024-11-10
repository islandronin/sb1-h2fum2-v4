import React, { useState, useRef, useEffect } from 'react';
import { useTags } from '../context/TagsContext';
import { X } from 'lucide-react';

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TagInput({ value, onChange }: TagInputProps) {
  const { tags: existingTags } = useTags();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const currentTags = value.split(',').map(tag => tag.trim()).filter(Boolean);
  
  const suggestions = existingTags.filter(tag => 
    !currentTags.includes(tag) && 
    tag.toLowerCase().includes(value.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputFocus = () => {
    setInputFocused(true);
    setShowSuggestions(true);
  };

  const handleTagClick = (tag: string) => {
    const newTags = [...currentTags, tag];
    onChange(newTags.join(', '));
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = currentTags.filter(tag => tag !== tagToRemove);
    onChange(newTags.join(', '));
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-2">
        {currentTags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 inline-flex items-center"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleInputFocus}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Add tags (comma-separated)"
      />
      
      {showSuggestions && suggestions.length > 0 && inputFocused && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-48 overflow-y-auto"
        >
          {suggestions.map((tag, index) => (
            <button
              key={index}
              onClick={() => handleTagClick(tag)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}