import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TestSite, TEST_SITES } from '@/types/navigation';

interface SiteSelectorProps {
  currentSite: TestSite;
  onSiteChange: (site: TestSite) => void;
}

export const SiteSelector = ({ currentSite, onSiteChange }: SiteSelectorProps) => {
  return (
    <div className="flex space-x-2">
      {Object.entries(TEST_SITES).map(([key, site]) => (
        <Button
          key={key}
          variant={currentSite === key ? "default" : "outline"}
          size="sm"
          onClick={() => {
            console.log('Site selector clicked:', key);
            onSiteChange(key as TestSite);
          }}
          className="text-xs"
        >
          <MapPin className="w-3 h-3 mr-1" />
          {site.name}
        </Button>
      ))}
    </div>
  );
};