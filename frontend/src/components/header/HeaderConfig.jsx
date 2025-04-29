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
} from "lucide-react";

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
    { to: "/dashboard", text: "Dashboard", icon: "Home" },
    { to: "/profile", text: "My Profile", icon: "User" },
    { to: "/donations", text: "My Donations", icon: "Heart" },
    { to: "/history", text: "Donation History", icon: "History" },
    { to: "/account/settings", text: "Account Settings", icon: "Settings" },
  ],
  individual_donor: [
    { to: "/favorites", text: "Favorites", icon: "Star" },
    { to: "/certificates", text: "My Certificates", icon: "Award" },
  ],
  organization_donor: [
    { to: "/post-donation", text: "Post Donation", icon: "PlusCircle" },
    { to: "/inventory", text: "Inventory", icon: "Package" },
    { to: "/certificates", text: "My Certificates", icon: "Award" },
  ],
  volunteer: [
    { to: "/volunteer-opportunities", text: "Opportunities", icon: "Calendar" },
    { to: "/my-shifts", text: "My Shifts", icon: "Clock" },
    { to: "/certificates", text: "My Certificates", icon: "Award" },
  ],
  ngo: [
    { to: "/manage-donations", text: "Manage Donations", icon: "List" },
    { to: "/reports", text: "Reports", icon: "FileText" },
    { to: "/volunteers", text: "Volunteers", icon: "Users" },
  ],
};

// Default export combining both if needed
export default {
  icons,
  headerLinks,
};
