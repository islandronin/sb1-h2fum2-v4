import React from 'react';
import type { Conversation } from '../types/Contact';
import { MessageSquare } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  onAddConversation: () => void;
}

export function ConversationList({ conversations, onAddConversation }: ConversationListProps) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900">Conversations</h4>
        <button
          onClick={onAddConversation}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Conversation
        </button>
      </div>
      
      {conversations.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No conversations recorded yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-500">{conversation.date}</span>
              </div>
              <p className="text-gray-900 font-medium mb-2">Summary:</p>
              <p className="text-gray-600 text-sm mb-4">{conversation.summary}</p>
              <details className="text-sm">
                <summary className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                  View Transcript
                </summary>
                <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                  <pre className="text-gray-600 whitespace-pre-wrap">{conversation.transcript}</pre>
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}