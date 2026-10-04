import type { NavItem } from "./navigation.config";

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  const isRootRoute = item.href.split("/").filter(Boolean).length === 1;
  if (item.end || isRootRoute) return pathname === item.href;

  return pathname.startsWith(item.href);
}
