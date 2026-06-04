"use client";
import { usePathname } from "next/navigation";
import CaregiverSidebar from "@/components/caregiver/CaregiverSidebar";

export default function CaregiverLayoutClient({ children }) {
  const pathname = usePathname();


  if (pathname === "/caregiver/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-care-bg flex">
      <CaregiverSidebar />
      <main className="flex-1 ml-0 md:ml-64 p-6 min-h-screen">
        {children}
      </main>
    </div>
  );
}