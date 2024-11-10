import axios from 'axios';

const RAPID_API_KEY = import.meta.env.VITE_RAPID_API_KEY;
const RAPID_API_HOST = 'linkedin-api8.p.rapidapi.com';

interface LinkedInProfile {
  imageUrl: string;
  jobTitle: string;
  about: string;
  name: string;
}

export async function fetchLinkedInProfile(profileUrl: string): Promise<LinkedInProfile> {
  try {
    const response = await axios.get(`https://${RAPID_API_HOST}/get-profile-data-by-url`, {
      params: {
        url: profileUrl
      },
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': RAPID_API_HOST,
      },
    });

    if (!response.data) {
      throw new Error('No data received from LinkedIn API');
    }

    const profile: LinkedInProfile = {
      imageUrl: response.data.profile_pic_url || 
                response.data.profilePicture || 
                response.data.image_url || '',
      jobTitle: response.data.headline || 
                response.data.current_job_title || 
                response.data.job_title || '',
      about: response.data.summary || 
             response.data.description || 
             response.data.about || '',
      name: response.data.full_name || 
            response.data.fullName || 
            response.data.name ||
            (response.data.firstName && response.data.lastName ? 
              `${response.data.firstName} ${response.data.lastName}` : '') ||
            (response.data.first_name && response.data.last_name ? 
              `${response.data.first_name} ${response.data.last_name}` : '') || ''
    };

    return profile;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('LinkedIn API Error:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    } else {
      console.error('LinkedIn fetch error:', error);
    }
    throw new Error('Failed to fetch LinkedIn profile. Please try again later.');
  }
}