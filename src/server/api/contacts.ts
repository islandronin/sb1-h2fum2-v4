import express from 'express';
import { supabase } from '../../lib/supabase';
import { z } from 'zod';

const router = express.Router();

// Enhanced search parameters schema
const SearchParamsSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  keyword: z.string().optional(), // For full-text search across all fields
  conversationDate: z.string().optional(), // Search conversations by date
  transcriptText: z.string().optional(), // Search within conversation transcripts
  dateFrom: z.string().optional(), // For date range searches
  dateTo: z.string().optional(),
});

// Schema for contact creation/update
const ContactSchema = z.object({
  name: z.string(),
  jobTitle: z.string().optional(),
  imageUrl: z.string().url().optional(),
  about: z.string().optional(),
  website: z.string().url().optional(),
  calendarLink: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  contactMethods: z.array(z.object({
    type: z.enum(['email', 'phone']),
    value: z.string(),
    isPrimary: z.boolean().optional(),
  })).optional(),
  socialLinks: z.array(z.object({
    platform: z.string(),
    url: z.string().url(),
  })).optional(),
  conversations: z.array(z.object({
    date: z.string(),
    summary: z.string(),
    transcript: z.string().optional(),
  })).optional(),
});

// Enhanced search contacts
router.get('/search', async (req, res) => {
  try {
    const params = SearchParamsSchema.parse(req.query);
    
    let query = supabase
      .from('contacts')
      .select(`
        *,
        contact_methods (*),
        social_links (*),
        conversations (
          id,
          date,
          summary,
          transcript
        )
      `);

    // Apply filters based on search parameters
    if (params.email) {
      query = query.eq('contact_methods.value', params.email)
        .eq('contact_methods.type', 'email');
    }
    
    if (params.name) {
      query = query.ilike('name', `%${params.name}%`);
    }
    
    if (params.linkedinUrl) {
      query = query.eq('social_links.url', params.linkedinUrl)
        .eq('social_links.platform', 'linkedin');
    }
    
    if (params.tags && params.tags.length > 0) {
      query = query.contains('tags', params.tags);
    }

    // Full-text search across multiple fields
    if (params.keyword) {
      query = query.or(`
        name.ilike.%${params.keyword}%,
        about.ilike.%${params.keyword}%,
        job_title.ilike.%${params.keyword}%,
        conversations.summary.ilike.%${params.keyword}%,
        conversations.transcript.ilike.%${params.keyword}%
      `);
    }

    // Search within conversation transcripts
    if (params.transcriptText) {
      query = query.contains('conversations.transcript', params.transcriptText);
    }

    // Date range search for conversations
    if (params.dateFrom || params.dateTo) {
      if (params.dateFrom) {
        query = query.gte('conversations.date', params.dateFrom);
      }
      if (params.dateTo) {
        query = query.lte('conversations.date', params.dateTo);
      }
    }

    // Specific conversation date search
    if (params.conversationDate) {
      query = query.eq('conversations.date', params.conversationDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Post-process results to highlight matched text in transcripts
    if (data && (params.keyword || params.transcriptText)) {
      data.forEach(contact => {
        if (contact.conversations) {
          contact.conversations = contact.conversations.map(conv => {
            if (conv.transcript) {
              // Add metadata about matches in transcript
              const searchTerm = params.keyword || params.transcriptText;
              if (searchTerm && conv.transcript.toLowerCase().includes(searchTerm.toLowerCase())) {
                const matches = [...conv.transcript.matchAll(new RegExp(searchTerm, 'gi'))];
                conv.matchCount = matches.length;
                conv.matchPositions = matches.map(m => m.index);
              }
            }
            return conv;
          });
        }
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Search error:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Search failed' });
  }
});

// Create new contact with conversations
router.post('/', async (req, res) => {
  try {
    const contactData = ContactSchema.parse(req.body);
    
    // Start a transaction
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .insert([{
        name: contactData.name,
        job_title: contactData.jobTitle,
        image_url: contactData.imageUrl,
        about: contactData.about,
        website: contactData.website,
        calendar_link: contactData.calendarLink,
        tags: contactData.tags,
      }])
      .select()
      .single();

    if (contactError) throw contactError;
    if (!contact) throw new Error('Failed to create contact');

    // Add contact methods if provided
    if (contactData.contactMethods?.length) {
      const { error: methodsError } = await supabase
        .from('contact_methods')
        .insert(
          contactData.contactMethods.map(method => ({
            contact_id: contact.id,
            type: method.type,
            value: method.value,
            is_primary: method.isPrimary,
          }))
        );

      if (methodsError) throw methodsError;
    }

    // Add social links if provided
    if (contactData.socialLinks?.length) {
      const { error: linksError } = await supabase
        .from('social_links')
        .insert(
          contactData.socialLinks.map(link => ({
            contact_id: contact.id,
            platform: link.platform,
            url: link.url,
          }))
        );

      if (linksError) throw linksError;
    }

    // Add conversations if provided
    if (contactData.conversations?.length) {
      const { error: convsError } = await supabase
        .from('conversations')
        .insert(
          contactData.conversations.map(conv => ({
            contact_id: contact.id,
            date: conv.date,
            summary: conv.summary,
            transcript: conv.transcript,
          }))
        );

      if (convsError) throw convsError;
    }

    res.status(201).json(contact);
  } catch (error) {
    console.error('Create error:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Creation failed' });
  }
});

// Update existing contact with conversations
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const contactData = ContactSchema.parse(req.body);

    // Update main contact info
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .update({
        name: contactData.name,
        job_title: contactData.jobTitle,
        image_url: contactData.imageUrl,
        about: contactData.about,
        website: contactData.website,
        calendar_link: contactData.calendarLink,
        tags: contactData.tags,
      })
      .eq('id', id)
      .select()
      .single();

    if (contactError) throw contactError;
    if (!contact) throw new Error('Contact not found');

    // Update contact methods if provided
    if (contactData.contactMethods?.length) {
      await supabase
        .from('contact_methods')
        .delete()
        .eq('contact_id', id);

      const { error: methodsError } = await supabase
        .from('contact_methods')
        .insert(
          contactData.contactMethods.map(method => ({
            contact_id: id,
            type: method.type,
            value: method.value,
            is_primary: method.isPrimary,
          }))
        );

      if (methodsError) throw methodsError;
    }

    // Update social links if provided
    if (contactData.socialLinks?.length) {
      await supabase
        .from('social_links')
        .delete()
        .eq('contact_id', id);

      const { error: linksError } = await supabase
        .from('social_links')
        .insert(
          contactData.socialLinks.map(link => ({
            contact_id: id,
            platform: link.platform,
            url: link.url,
          }))
        );

      if (linksError) throw linksError;
    }

    // Update conversations if provided
    if (contactData.conversations?.length) {
      await supabase
        .from('conversations')
        .delete()
        .eq('contact_id', id);

      const { error: convsError } = await supabase
        .from('conversations')
        .insert(
          contactData.conversations.map(conv => ({
            contact_id: id,
            date: conv.date,
            summary: conv.summary,
            transcript: conv.transcript,
          }))
        );

      if (convsError) throw convsError;
    }

    res.json(contact);
  } catch (error) {
    console.error('Update error:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Update failed' });
  }
});

export default router;