"use client";

import { useState } from "react";
import { MobileNavToggle } from "./MobileNavToggle";
import { SidebarOverlay } from "./SidebarOverlay";
import { AppSidebar } from "./AppSidebar";

export function MobileSidebarWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <MobileNavToggle isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      <SidebarOverlay isOpen={isOpen} onClose={() => setIsOpen(false)} />
      {/* Mobile sidebar — slides in from left */}
      {isOpen && (
        <div className="fixed inset-y-0 left-0 z-30 w-60 lg:hidden">
          <AppSidebar />
        </div>
      )}
    </>
  );
}
