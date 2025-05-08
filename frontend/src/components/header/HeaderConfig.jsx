import {
  Calendar,
  Clock,
  FileText,
  Heart,
  History,
  Home,
  List,
  LogOut,
  MessageSquare,
  Package,
  PlusCircle,
  Settings,
  Star,
  User,
  Users,
  Award,
  Shield,
} from 'lucide-react';

// Named export for icons
export const icons = {
  Home: Home,
  User: User,
  Heart: Heart,
  History: History,
  Settings: Settings,
  LogOut: LogOut,
  PlusCircle: PlusCircle,
  Package: Package,
  Calendar: Calendar,
  Clock: Clock,
  List: List,
  FileText: FileText,
  Users: Users,
  Star: Star,
  MessageSquare: MessageSquare,
  Award: Award,
  Shield: Shield,
};

// Named export for headerLinks
export const headerLinks = {
  common: [
    { to: '/profile', text: 'My Profile', icon: 'User' },
    { to: '/account/settings', text: 'Account Settings', icon: 'Settings' },
    { to: '/terms-of-service', text: 'Terms of Service', icon: 'FileText' },
    { to: '/privacy-policy', text: 'Privacy Policy', icon: 'Shield' },
  ],
  individual_donor: [
    { to: '/history', text: 'Donation History', icon: 'History' },
    { to: '/certificates', text: 'My Certificates', icon: 'Award' },
  ],
  organization_donor: [
    // { to: '/post-donation', text: 'Post Donation', icon: 'PlusCircle' },
    { to: '/certificates', text: 'My Certificates', icon: 'Award' },
    { to: '/history', text: 'Donation History', icon: 'History' },
    { to: '/certificates', text: 'My Certificates', icon: 'Award' },
  ],
  volunteer: [
    { to: '/history', text: 'Donation History', icon: 'History' },
    { to: '/certificates', text: 'My Certificates', icon: 'Award' },
  ],
  ngo: [
    { to: '/reports', text: 'Reports', icon: 'FileText' },
    { to: '/volunteers', text: 'Volunteers', icon: 'Users' },
  ],
};

// Default export combining both if needed
export default {
  icons,
  headerLinks,
};
