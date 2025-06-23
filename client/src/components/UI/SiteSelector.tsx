import React from 'react';
import { MapPin } from 'lucide-react';
import { TestSite } from '@/types';

interface SiteSelectorProps {
  currentSite: TestSite;
  onSiteChange: (site: TestSite) => void;
}

const SITES = {
  kamperland: { name: 'Kamperland', country: '(NL)' },
  zuhause: { name: 'Zuhause', country: '(DE)' }
};

export function SiteSelector({ currentSite, onSiteChange }: SiteSelectorProps) {
  return (
    <div className="flex space-x-2">
      {Object.entries(SITES).map(([key, site]) => (
        <button
          key={key}
          onClick={() => onSiteChange(key as TestSite)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
            currentSite === key
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span className="font-medium">{site.name}</span>
          <span className="text-sm opacity-75">{site.country}</span>
        </button>
      ))}
    </div>
  );
}