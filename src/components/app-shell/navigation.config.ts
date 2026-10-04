import {
  Bike,
  Ellipsis,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Tags,
  User,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { ROLES, type UserRole } from "@/features/auth/constants";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  end?: boolean;
  mobile?: "tab" | "center" | "more";
  mobileOrder?: number;
  sidebar?: boolean;
}

const adminNavigation: NavItem[] = [
  { label: "POS", href: "/admin/pos", icon: ShoppingCart, mobile: "center", mobileOrder: 2 },
  { label: "Products", href: "/admin/products", icon: Package, mobile: "tab", mobileOrder: 1 },
  { label: "Categories", href: "/admin/categories", icon: Tags, mobile: "more" },
  { label: "Motor Brands", href: "/admin/motor-brands", icon: Bike, mobile: "more" },
  { label: "Motorcycles", href: "/admin/motors", icon: Bike, mobile: "more" },
  { label: "Services", href: "/admin/services", icon: Wrench, mobile: "more" },
  { label: "Users", href: "/admin/users", icon: Users, mobile: "tab", mobileOrder: 3 },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart, mobile: "more", sidebar: false },
  { label: "Revenue", href: "/admin/revenue", icon: LayoutDashboard, mobile: "more", sidebar: false },
  { label: "Settings", href: "/admin/settings", icon: Settings, mobile: "more", sidebar: false },
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, end: true, mobile: "tab", mobileOrder: 0 },
];

const staffNavigation: NavItem[] = [
  { label: "POS", href: "/staff/pos", icon: ShoppingCart, end: true },
  { label: "Services", href: "/staff/services", icon: Wrench },
  { label: "Profile", href: "/staff/profile", icon: User },
];

const memberNavigation: NavItem[] = [
  { label: "Profile", href: "/member/profile", icon: User, end: true },
];

export function getNavigation(role: UserRole): NavItem[] {
  if (role === ROLES.ADMIN) return adminNavigation.filter((item) => item.sidebar !== false);
  if (role === ROLES.STAFF) return staffNavigation;
  return memberNavigation;
}

export function getMoreNavigation(role: UserRole): NavItem[] {
  return role === ROLES.ADMIN ? adminNavigation.filter((item) => item.mobile === "more") : [];
}

export function getMobileTabs(role: UserRole): NavItem[] {
  if (role !== ROLES.ADMIN) return [];

  const navigation = getNavigation(role);
  const primaryTabs = navigation
    .filter((item) => item.mobile === "tab" || item.mobile === "center")
    .sort((left, right) => (left.mobileOrder ?? 0) - (right.mobileOrder ?? 0));

  return [
    ...primaryTabs,
    { label: "More", href: "/admin", icon: Ellipsis, mobile: "more", mobileOrder: 4 },
  ];
}
