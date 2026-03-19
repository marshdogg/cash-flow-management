"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  active?: boolean;
  badge?: number;
  external?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "📊", active: true },
  { label: "Funnel", href: "/funnel", icon: "📈" },
  { label: "Projects", href: "/projects", icon: "🎨" },
  { label: "Calendar", href: "/calendar", icon: "📅" },
  { label: "Technicians", href: "/technicians", icon: "👷" },
  { label: "Customers", href: "/customers", icon: "👥" },
  { label: "Customer Care", href: "/customer-care", icon: "🔔" },
  { label: "Reports", href: "/reports", icon: "📋" },
  { label: "Tasks", href: "/tasks", icon: "✅", badge: 3 },
  { label: "Settings", href: "/settings", icon: "⚙️" },
  { label: "PaintScout", href: "https://app.paintscout.com", icon: "🖌️", external: true },
];

export function AppSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-60 flex-col border-r border-gray-200 bg-white lg:flex">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white font-bold text-sm">
          W
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">WOW OS</p>
          <p className="text-[11px] text-gray-500">Franchise Manager</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4" aria-label="Main navigation">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const linkClasses = cn(
              "flex items-center gap-3 rounded-md px-3 py-3 text-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
              item.active
                ? "bg-primary-50 text-primary-600 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            );

            const content = (
              <>
                <span aria-hidden="true">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.external && (
                  <span className="text-xs text-gray-400" aria-hidden="true">↗</span>
                )}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-600 px-1.5 text-[11px] font-medium text-white">
                    {item.badge}
                  </span>
                )}
              </>
            );

            return (
              <li key={item.href}>
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClasses}
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className={linkClasses}
                    aria-current={item.active ? "page" : undefined}
                  >
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer — User */}
      <div className="border-t border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
            SC
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-700">Sarah Chen</p>
            <p className="truncate text-[11px] text-gray-500">Franchise Partner</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
