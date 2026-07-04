"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";

function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

const AVATAR_COLORS = ["#2C7873", "#52AB98", "#F7B731", "#3A0CA3", "#F72585"];

export default function PatientLoginPage() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState(null);

  useEffect(() => {
    api
      .get("/patient")
      .then((r) => setPatients(r.data))
      .catch(() => toast.error("Could not load profiles. Please check your connection."))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (patientId) => {
    setSelectingId(patientId);
    localStorage.setItem("memorycare_patient_id", patientId);
    setTimeout(() => router.push("/patient"), 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-patient-bg flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="text-6xl mb-4">🧠</div>
          <p className="text-2xl font-bold text-patient-primary">Loading profiles...</p>
        </div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="min-h-screen bg-patient-bg flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl p-10 text-center max-w-md shadow-card border border-patient-border">
          <div className="text-5xl mb-4">👋</div>
          <h2 className="text-2xl font-bold text-patient-text mb-3">No Profiles Yet</h2>
          <p className="text-gray-500 text-lg">
            Ask your caregiver to set up a profile first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-patient-bg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-patient-secondary/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-patient-accent/10 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4 pt-16 pb-16 relative z-10 text-center">
        <div className="text-6xl mb-4">👋</div>
        <h1 className="text-4xl md:text-5xl font-bold text-patient-primary mb-3 font-serif">
          Hello!
        </h1>
        <p className="text-xl text-gray-500 mb-10">Tap your photo to continue</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {patients.map((patient, i) => (
            <button
              key={patient._id}
              onClick={() => handleSelect(patient._id)}
              disabled={selectingId !== null}
              className={`bg-white rounded-3xl p-6 shadow-card border-2 text-center transition-all active:scale-95 flex flex-col items-center gap-3 ${
                selectingId === patient._id
                  ? "border-patient-primary ring-4 ring-patient-primary/30"
                  : "border-patient-border hover:border-patient-secondary hover:shadow-card-hover"
              }`}
              style={{ minHeight: "220px" }}
            >
              {patient.profilePhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={patient.profilePhoto}
                  alt={patient.name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-patient-border"
                />
              ) : (
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold text-white"
                  style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                >
                  {initials(patient.name)}
                </div>
              )}
              <p className="text-2xl font-bold text-patient-text">{patient.name}</p>
              {selectingId === patient._id && (
                <p className="text-patient-primary font-semibold">Welcome, {patient.name}! 💙</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}