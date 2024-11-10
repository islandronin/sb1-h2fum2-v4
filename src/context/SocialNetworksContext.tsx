import React, { createContext, useContext, useState, useEffect } from 'react';

interface SocialNetworksContextType {
  networks: string[];
  addNetwork: (network: string) => void;
}

const DEFAULT_NETWORKS = [
  'twitter',
  'linkedin',
  'github',
  'facebook',
  'instagram',
  'youtube',
  'skype',
  'telegram',
  'discord',
  'medium',
  'behance',
  'dribbble',
  'stackoverflow',
  'twitch',
  'tiktok',
  'mastodon',
  'threads',
  'whatsapp',
  'signal',
];

const SocialNetworksContext = createContext<SocialNetworksContextType | undefined>(undefined);

export function SocialNetworksProvider({ children }: { children: React.ReactNode }) {
  const [networks, setNetworks] = useState<string[]>(() => {
    const stored = localStorage.getItem('socialNetworks');
    return stored ? JSON.parse(stored) : DEFAULT_NETWORKS;
  });

  useEffect(() => {
    localStorage.setItem('socialNetworks', JSON.stringify(networks));
  }, [networks]);

  const addNetwork = (network: string) => {
    if (!networks.includes(network.toLowerCase())) {
      setNetworks([...networks, network.toLowerCase()]);
    }
  };

  return (
    <SocialNetworksContext.Provider value={{ networks, addNetwork }}>
      {children}
    </SocialNetworksContext.Provider>
  );
}

export function useSocialNetworks() {
  const context = useContext(SocialNetworksContext);
  if (context === undefined) {
    throw new Error('useSocialNetworks must be used within a SocialNetworksProvider');
  }
  return context;
}