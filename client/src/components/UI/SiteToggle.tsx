import React from 'react';
import { MapPin } from 'lucide-react';
import { TestSite } from '@/types';

interface SiteToggleProps {
  currentSite: TestSite;
  onSiteChange: (site: TestSite) => void;
}

const SITE_NAMES: Record<TestSite, string> = {
  kamperland: 'Kamperland (NL)',
  zuhause: 'Zuhause (DE)'
};

export function SiteToggle({ currentSite, onSiteChange }: SiteToggleProps) {
  const sites = Object.keys(SITE_NAMES) as TestSite[];

  return (
    <div className="bg-white/90 backdrop-blur-md border border-white/20 rounded-xl shadow-lg p-1 flex">
      {sites.map((site) => (
        <button
          key={site}
          onClick={() => onSiteChange(site)}
          className={`
            px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
            ${currentSite === site 
              ? 'bg-blue-500 text-white shadow-md' 
              : 'text-gray-600 hover:bg-white/50'
            }
          `}
        >
          <MapPin className="w-4 h-4" />
          {SITE_NAMES[site]}
        </button>
      ))}
    </div>
  );
}