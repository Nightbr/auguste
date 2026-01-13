import { useState } from 'react';
import { Button } from '@auguste/ui/components/ui/button';
import { Input } from '@auguste/ui/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@auguste/ui/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@auguste/ui/components/ui/select';
import { Globe, Languages } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

const COUNTRIES = [
  { code: 'FR', name: 'France' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'ES', name: 'Spain' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
];

const LANGUAGES = [
  { code: 'fr', name: 'French' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'pt', name: 'Portuguese' },
];

interface CreateFamilyModalProps {
  onCreated: (familyId: string) => void;
}

export function CreateFamilyModal({ onCreated }: CreateFamilyModalProps) {
  const [name, setName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedCountry || !selectedLanguage) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const family = await apiClient.createFamily({
        name,
        country: selectedCountry,
        language: selectedLanguage,
      });
      onCreated(family.id);
    } catch (err) {
      setError('Failed to create family. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-2xl border-escoffier-green/10 bg-[#FAF9F6]">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-serif text-escoffier-green">
            Welcome to Auguste
          </CardTitle>
          <p className="text-escoffier-green/60 text-sm italic">
            "Good food is the foundation of genuine happiness."
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-escoffier-green/80 flex items-center gap-2">
                Family Name
              </label>
              <Input
                placeholder="e.g. The Smith Family"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white/50 border-escoffier-green/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-escoffier-green/80 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Country
                </label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="bg-white/50 border-escoffier-green/10">
                    <SelectValue placeholder="Select country..." />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-escoffier-green/80 flex items-center gap-2">
                  <Languages className="w-4 h-4" /> Language
                </label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="bg-white/50 border-escoffier-green/10">
                    <SelectValue placeholder="Select language..." />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.code} value={l.code}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <Button
              type="submit"
              disabled={!name || !selectedCountry || !selectedLanguage || isSubmitting}
              className="w-full bg-escoffier-green text-white hover:bg-escoffier-green/90 py-4 font-medium transition-all duration-300"
            >
              {isSubmitting ? 'Creating Family...' : 'Start Planning Together'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
