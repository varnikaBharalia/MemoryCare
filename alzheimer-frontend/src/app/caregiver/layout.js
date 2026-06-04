import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import CaregiverLayoutClient from "@/components/caregiver/CaregiverLayoutClient";

export const metadata = { title: "MemoryCare — Caregiver Dashboard" };

export default async function CaregiverLayout({ children }) {
  const session = await getServerSession();

  return <CaregiverLayoutClient>{children}</CaregiverLayoutClient>;
}
