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
  MessageSquare,
  Award: Award,
};

// Named export for headerLinks
export const headerLinks = {
  common: [
    { to: '/profile', text: 'My Profile', icon: 'User' },
    { to: '/history', text: 'Donation History', icon: 'History' },
    { to: '/account/settings', text: 'Account Settings', icon: 'Settings' },
  ],
  individual_donor: [
    { to: '/certificates', text: 'My Certificates', icon: 'Award' },
  ],
  organization_donor: [
    { to: '/post-donation', text: 'Post Donation', icon: 'PlusCircle' },
    { to: '/certificates', text: 'My Certificates', icon: 'Award' },
  ],
  volunteer: [{ to: '/certificates', text: 'My Certificates', icon: 'Award' }],
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
