export interface ContactMethod {
  type: 'email' | 'phone';
  value: string;
  isPrimary: boolean;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface Conversation {
  id?: string;
  date: string;
  summary: string;
  transcript?: string;
}

export interface Contact {
  id?: string;
  name: string;
  jobTitle?: string;
  imageUrl?: string;
  about?: string;
  website?: string;
  calendarLink?: string;
  contactMethods: ContactMethod[];
  socialLinks: SocialLink[];
  conversations: Conversation[];
  tags: string[];
}