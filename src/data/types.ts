export interface Service {
  id: string;
  name: string;
  categories: string[];
  region: string;
  contact: string;
  altContact?: string;
  url?: string;
  address?: string;
  hours?: string;
  availability?: string;
  crisis?: boolean;
  description: string;
  lastVerified: string;
}
