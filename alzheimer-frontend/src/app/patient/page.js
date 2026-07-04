

// "use client";
// import { useState, useEffect, useRef, useCallback } from "react";
// import { useSocket } from "@/hooks/useSocket";
// import api from "@/lib/api";
// import ReminderPopup from "@/components/patient/ReminderPopup";
// import HelpButton from "@/components/patient/HelpButton";
// import PhotoSlideshow from "@/components/patient/PhotoSlideshow";
// import DailySchedule from "@/components/patient/DailySchedule";
// import CaregiverMessage from "@/components/patient/CaregiverMessage";
// import PatientSelector from "@/components/patient/PatientSelector";  // ← ADD this import
// import toast from "react-hot-toast";

// // ← REMOVE the const PATIENT_ID = process.env.NEXT_PUBLIC_PATIENT_ID line

// function getTimeOfDay() {
//   const h = new Date().getHours();
//   if (h < 12) return "Good morning";
//   if (h < 17) return "Good afternoon";
//   return "Good evening";
// }

// function formatDateTime() {
//   const now = new Date();
//   return {
//     time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
//     date: now.toLocaleDateString("en-IN", {
//       weekday: "long",
//       day: "numeric",
//       month: "long",
//       year: "numeric",
//     }),
//   };
// }

// export default function PatientPage() {
//   // ← ADD patientId state, initialized from localStorage
//   const [patientId, setPatientId] = useState(null);

//   const [patient, setPatient] = useState(null);
//   const [dateTime, setDateTime] = useState(formatDateTime());
//   const [view, setView] = useState("home");
//   const [messages, setMessages] = useState([]);
//   const [sessionId, setSessionId] = useState(null);
//   const [isListening, setIsListening] = useState(false);
//   const [aiSpeaking, setAiSpeaking] = useState(false);
//   const [activeReminder, setActiveReminder] = useState(null);
//   const [caregiverMsg, setCaregiverMsg] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [inputText, setInputText] = useState("");

//   const recognitionRef = useRef(null);
//   const messagesEndRef = useRef(null);
//   const { socket } = useSocket(patientId, "patient");  // ← use patientId state

//   // ← ADD: on mount, read patientId from localStorage
//   useEffect(() => {
//     const stored = localStorage.getItem("selectedPatientId");
//     if (stored) {
//       setPatientId(stored);
//     } else {
//       setLoading(false); // no stored id → show selector
//     }
//   }, []);

//   useEffect(() => {
//     if (!patientId) return;
//     setLoading(true);
//     api.get(`/patient/${patientId}`)
//       .then((r) => setPatient(r.data))
//       .catch(() => toast.error("Could not load patient data"))
//       .finally(() => setLoading(false));
//   }, [patientId]);  // ← depends on patientId state now

//   useEffect(() => {
//     const timer = setInterval(() => setDateTime(formatDateTime()), 60000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     if (!socket) return;
//     socket.on("reminder", (data) => setActiveReminder(data));
//     socket.on("caregiver_message", (data) => setCaregiverMsg(data));
//     socket.on("emergency_alert", () => {});
//     return () => {
//       socket.off("reminder");
//       socket.off("caregiver_message");
//     };
//   }, [socket]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const speak = useCallback((text) => {
//     if (!window.speechSynthesis) return;
//     window.speechSynthesis.cancel();
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.rate = 0.85;
//     utterance.pitch = 1.0;
//     utterance.volume = 1;
//     utterance.onstart = () => setAiSpeaking(true);
//     utterance.onend = () => setAiSpeaking(false);
//     window.speechSynthesis.speak(utterance);
//   }, []);

//   const sendMessage = useCallback(async (text) => {
//     if (!text.trim() || !patientId) return;  // ← use patientId state
//     const userMsg = { role: "patient", content: text };
//     setMessages((prev) => [...prev, userMsg]);
//     setInputText("");

//     try {
//       const res = await api.post("/ai/chat", {
//         patientId,  // ← use patientId state
//         message: text,
//         sessionId,
//       });
//       const { reply, sessionId: sid, isDistressed } = res.data;
//       if (!sessionId) setSessionId(sid);
//       setMessages((prev) => [...prev, { role: "ai", content: reply }]);
//       speak(reply);
//       if (isDistressed) {
//         toast("Your caregiver has been notified 💙", { icon: "🔔" });
//       }
//     } catch {
//       const fallback = "I'm here with you. How are you feeling?";
//       setMessages((prev) => [...prev, { role: "ai", content: fallback }]);
//       speak(fallback);
//     }
//   }, [patientId, sessionId, speak]);  // ← patientId in deps

//   const startListening = useCallback(() => {
//     if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
//       toast.error("Voice not supported in this browser. Please use Chrome.");
//       return;
//     }
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     const recognition = new SpeechRecognition();
//     recognition.lang = "en-IN";
//     recognition.continuous = false;
//     recognition.interimResults = false;
//     recognitionRef.current = recognition;

//     recognition.onstart = () => setIsListening(true);
//     recognition.onresult = (e) => {
//       const transcript = e.results[0][0].transcript;
//       setIsListening(false);
//       sendMessage(transcript);
//     };
//     recognition.onerror = () => setIsListening(false);
//     recognition.onend = () => setIsListening(false);
//     recognition.start();
//   }, [sendMessage]);

//   const stopListening = useCallback(() => {
//     recognitionRef.current?.stop();
//     setIsListening(false);
//   }, []);

//   const endSession = useCallback(async () => {
//     if (sessionId) {
//       await api.post("/ai/end-session", { patientId, sessionId }).catch(() => {});  // ← patientId state
//       setSessionId(null);
//     }
//     setMessages([]);
//     setView("home");
//   }, [patientId, sessionId]);  // ← patientId in deps

//   // ← ADD: handler when PatientSelector picks a patient
//   const handlePatientSelected = (id) => {
//     setPatientId(id);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-patient-bg flex items-center justify-center">
//         <div className="text-center animate-pulse">
//           <div className="text-6xl mb-4">🧠</div>
//           <p className="text-2xl font-bold text-patient-primary">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   // ← REPLACE the !PATIENT_ID env var check with: show selector if no patientId in state
//   if (!patientId) {
//     return <PatientSelector onSelectPatient={handlePatientSelected} />;
//   }

//   const patientName = patient?.name || "Friend";

//   return (
//     <div className="min-h-screen bg-patient-bg relative overflow-hidden">
//       <div className="absolute top-0 right-0 w-96 h-96 bg-patient-secondary/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
//       <div className="absolute bottom-0 left-0 w-64 h-64 bg-patient-accent/10 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

//       {activeReminder && (
//         <ReminderPopup
//           reminder={activeReminder}
//           patientName={patientName}
//           onDismiss={() => setActiveReminder(null)}
//           speak={speak}
//         />
//       )}

//       {caregiverMsg && (
//         <CaregiverMessage
//           message={caregiverMsg}
//           onDismiss={() => setCaregiverMsg(null)}
//           speak={speak}
//         />
//       )}

//       <div className="max-w-2xl mx-auto px-4 pt-8 pb-32 relative z-10">

//         {view === "home" && (
//           <div className="animate-slide-up">
//             <div className="bg-white rounded-3xl p-8 shadow-card mb-6 text-center border border-patient-border">
//               <div className="text-6xl mb-4">
//                 {new Date().getHours() < 12 ? "🌅" : new Date().getHours() < 17 ? "☀️" : "🌙"}
//               </div>
//               <h1 className="text-4xl md:text-5xl font-bold text-patient-primary mb-2 font-serif">
//                 {getTimeOfDay()},
//               </h1>
//               <h2 className="text-4xl md:text-5xl font-bold text-patient-text mb-5">
//                 {patientName}!
//               </h2>
//               <div className="bg-patient-bg rounded-2xl p-4">
//                 <p className="text-3xl font-bold text-patient-primary">{dateTime.time}</p>
//                 <p className="text-lg text-gray-500 mt-1">{dateTime.date}</p>
//               </div>
//             </div>

//             <div className="text-center mb-6">
//               <button
//                 onClick={() => { setView("chat"); speak(`Hello ${patientName}! I'm here with you. How are you feeling today?`); }}
//                 className="bg-patient-primary text-white rounded-3xl px-12 py-7 text-3xl font-bold shadow-lg hover:bg-patient-secondary transition-all active:scale-95 w-full"
//                 style={{ minHeight: "90px" }}
//               >
//                 🎙️ Talk to Me
//               </button>
//             </div>

//             <div className="grid grid-cols-2 gap-4 mb-6">
//               <button
//                 onClick={() => setView("photos")}
//                 className="bg-white rounded-3xl p-6 shadow-card border border-patient-border text-center hover:bg-patient-bg transition-all active:scale-95"
//                 style={{ minHeight: "120px" }}
//               >
//                 <div className="text-4xl mb-2">📸</div>
//                 <p className="text-xl font-bold text-patient-text">My Family</p>
//               </button>
//               <button
//                 onClick={() => setView("schedule")}
//                 className="bg-white rounded-3xl p-6 shadow-card border border-patient-border text-center hover:bg-patient-bg transition-all active:scale-95"
//                 style={{ minHeight: "120px" }}
//               >
//                 <div className="text-4xl mb-2">📅</div>
//                 <p className="text-xl font-bold text-patient-text">My Day</p>
//               </button>
//             </div>

//             {patient?.cognitiveStage && (
//               <div className="bg-patient-primary/5 rounded-2xl p-4 text-center border border-patient-border">
//                 <p className="text-base text-gray-500">
//                   💙 Your care team is watching over you
//                 </p>
//               </div>
//             )}
//           </div>
//         )}

//         {view === "chat" && (
//           <div className="animate-slide-up">
//             <div className="flex items-center justify-between mb-6">
//               <button
//                 onClick={endSession}
//                 className="bg-white rounded-2xl px-5 py-3 text-lg font-bold text-patient-primary border border-patient-border shadow-sm"
//               >
//                 ← Home
//               </button>
//               <h2 className="text-2xl font-bold text-patient-primary">Chat with AI</h2>
//               <div className="w-20" />
//             </div>

//             <div className="bg-white rounded-3xl p-4 shadow-card border border-patient-border mb-4 min-h-[300px] max-h-[420px] overflow-y-auto">
//               {messages.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center h-full text-center py-10">
//                   <div className="text-5xl mb-3">💬</div>
//                   <p className="text-xl text-gray-400 font-medium">
//                     Press the microphone or type to start talking
//                   </p>
//                 </div>
//               ) : (
//                 <div className="space-y-4 p-2">
//                   {messages.slice(-5).map((m, i) => (
//                     <div
//                       key={i}
//                       className={`flex ${m.role === "patient" ? "justify-end" : "justify-start"}`}
//                     >
//                       <div
//                         className={`rounded-2xl px-5 py-4 max-w-[80%] text-xl leading-relaxed ${
//                           m.role === "patient"
//                             ? "bg-patient-primary text-white"
//                             : "bg-patient-bg text-patient-text border border-patient-border"
//                         }`}
//                       >
//                         {m.role === "ai" && (
//                           <span className="text-sm font-bold text-patient-secondary block mb-1">
//                             AI Companion
//                           </span>
//                         )}
//                         {m.content}
//                       </div>
//                     </div>
//                   ))}
//                   <div ref={messagesEndRef} />
//                 </div>
//               )}
//             </div>

//             {aiSpeaking && (
//               <div className="text-center mb-3">
//                 <span className="inline-flex items-center gap-2 bg-patient-primary/10 text-patient-primary rounded-full px-4 py-2 text-lg font-semibold">
//                   🔊 Speaking...
//                 </span>
//               </div>
//             )}

//             <div className="flex flex-col items-center gap-4">
//               <button
//                 onClick={isListening ? stopListening : startListening}
//                 className={`relative w-28 h-28 rounded-full text-5xl shadow-lg transition-all active:scale-95 ${
//                   isListening
//                     ? "bg-red-500 text-white mic-listening"
//                     : "bg-patient-primary text-white hover:bg-patient-secondary"
//                 }`}
//               >
//                 {isListening ? "⏹️" : "🎙️"}
//               </button>
//               <p className="text-lg font-semibold text-gray-500">
//                 {isListening ? "Listening... tap to stop" : "Tap to speak"}
//               </p>

//               <div className="flex gap-3 w-full">
//                 <input
//                   type="text"
//                   value={inputText}
//                   onChange={(e) => setInputText(e.target.value)}
//                   onKeyDown={(e) => e.key === "Enter" && sendMessage(inputText)}
//                   placeholder="Or type here..."
//                   className="flex-1 bg-white border-2 border-patient-border rounded-2xl px-5 py-4 text-xl font-medium outline-none focus:border-patient-primary transition-colors"
//                 />
//                 <button
//                   onClick={() => sendMessage(inputText)}
//                   disabled={!inputText.trim()}
//                   className="bg-patient-primary text-white rounded-2xl px-6 py-4 text-xl font-bold disabled:opacity-40"
//                 >
//                   Send
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {view === "photos" && (
//           <div className="animate-slide-up">
//             <div className="flex items-center mb-6">
//               <button
//                 onClick={() => setView("home")}
//                 className="bg-white rounded-2xl px-5 py-3 text-lg font-bold text-patient-primary border border-patient-border shadow-sm mr-4"
//               >
//                 ← Home
//               </button>
//               <h2 className="text-2xl font-bold text-patient-primary">My Family</h2>
//             </div>
//             <PhotoSlideshow patientId={patientId} speak={speak} />  {/* ← patientId state */}
//           </div>
//         )}

//         {view === "schedule" && (
//           <div className="animate-slide-up">
//             <div className="flex items-center mb-6">
//               <button
//                 onClick={() => setView("home")}
//                 className="bg-white rounded-2xl px-5 py-3 text-lg font-bold text-patient-primary border border-patient-border shadow-sm mr-4"
//               >
//                 ← Home
//               </button>
//               <h2 className="text-2xl font-bold text-patient-primary">My Day</h2>
//             </div>
//             <DailySchedule patientId={patientId} />  {/* ← patientId state */}
//           </div>
//         )}
//       </div>

//       <HelpButton patientId={patientId} patientName={patientName} speak={speak} />  {/* ← patientId state */}
//     </div>
//   );
// }



"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import api from "@/lib/api";
import ReminderPopup from "@/components/patient/ReminderPopup";
import HelpButton from "@/components/patient/HelpButton";
import PhotoSlideshow from "@/components/patient/PhotoSlideshow";
import DailySchedule from "@/components/patient/DailySchedule";
import CaregiverMessage from "@/components/patient/CaregiverMessage";
import toast from "react-hot-toast";

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDateTime() {
  const now = new Date();
  return {
    time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
    date: now.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
}

export default function PatientPage() {
  const router = useRouter();
  const [patientId, setPatientId] = useState(null);
  const [patient, setPatient] = useState(null);
  const [dateTime, setDateTime] = useState(formatDateTime());
  const [view, setView] = useState("home"); // home | chat | photos | schedule
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [activeReminder, setActiveReminder] = useState(null);
  const [caregiverMsg, setCaregiverMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket(patientId, "patient");

  // Figure out which patient this device belongs to.
  useEffect(() => {
    const storedId =
      localStorage.getItem("memorycare_patient_id") ||
      process.env.NEXT_PUBLIC_PATIENT_ID ||
      null;

    if (!storedId) {
      router.replace("/patient/login");
      return;
    }
    setPatientId(storedId);
  }, [router]);

  useEffect(() => {
    if (!patientId) return;
    api.get(`/patient/${patientId}`)
      .then((r) => setPatient(r.data))
      .catch(() => toast.error("Could not load patient data"))
      .finally(() => setLoading(false));
  }, [patientId]);


  useEffect(() => {
    const timer = setInterval(() => setDateTime(formatDateTime()), 60000);
    return () => clearInterval(timer);
  }, []);


  useEffect(() => {
    if (!socket) return;
    socket.on("reminder", (data) => setActiveReminder(data));
    socket.on("caregiver_message", (data) => setCaregiverMsg(data));
    socket.on("emergency_alert", () => {});
    return () => {
      socket.off("reminder");
      socket.off("caregiver_message");
    };
  }, [socket]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1;
    utterance.onstart = () => setAiSpeaking(true);
    utterance.onend = () => setAiSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || !patientId) return;
    const userMsg = { role: "patient", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    try {
      const res = await api.post("/ai/chat", {
        patientId: patientId,
        message: text,
        sessionId,
      });
      const { reply, sessionId: sid, isDistressed } = res.data;
      if (!sessionId) setSessionId(sid);
      setMessages((prev) => [...prev, { role: "ai", content: reply }]);
      speak(reply);
      if (isDistressed) {
        toast("Your caregiver has been notified 💙", { icon: "🔔" });
      }
    } catch {
      const fallback = "I'm here with you. How are you feeling?";
      setMessages((prev) => [...prev, { role: "ai", content: fallback }]);
      speak(fallback);
    }
  }, [sessionId, speak]);

  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      toast.error("Voice not supported in this browser. Please use Chrome.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setIsListening(false);
      sendMessage(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }, [sendMessage]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const endSession = useCallback(async () => {
    if (sessionId) {
      await api.post("/ai/end-session", { patientId: patientId, sessionId }).catch(() => {});
      setSessionId(null);
    }
    setMessages([]);
    setView("home");
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-patient-bg flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="text-6xl mb-4">🧠</div>
          <p className="text-2xl font-bold text-patient-primary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!patientId) {
    return (
      <div className="min-h-screen bg-patient-bg flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="text-6xl mb-4">🧠</div>
          <p className="text-2xl font-bold text-patient-primary">Loading...</p>
        </div>
      </div>
    );
  }

  const patientName = patient?.name || "Friend";

  return (
    <div className="min-h-screen bg-patient-bg relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-patient-secondary/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-patient-accent/10 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

    
      {activeReminder && (
        <ReminderPopup
          reminder={activeReminder}
          patientName={patientName}
          onDismiss={() => setActiveReminder(null)}
          speak={speak}
        />
      )}

      {caregiverMsg && (
        <CaregiverMessage
          message={caregiverMsg}
          onDismiss={() => setCaregiverMsg(null)}
          speak={speak}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 pt-8 pb-32 relative z-10">

   
        {view === "home" && (
          <div className="animate-slide-up">
            {/* Greeting */}
            <div className="bg-white rounded-3xl p-8 shadow-card mb-6 text-center border border-patient-border">
              <div className="text-6xl mb-4">
                {new Date().getHours() < 12 ? "🌅" : new Date().getHours() < 17 ? "☀️" : "🌙"}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-patient-primary mb-2 font-serif">
                {getTimeOfDay()},
              </h1>
              <h2 className="text-4xl md:text-5xl font-bold text-patient-text mb-5">
                {patientName}!
              </h2>
              <div className="bg-patient-bg rounded-2xl p-4">
                <p className="text-3xl font-bold text-patient-primary">{dateTime.time}</p>
                <p className="text-lg text-gray-500 mt-1">{dateTime.date}</p>
              </div>
            </div>

        
            <div className="text-center mb-6">
              <button
                onClick={() => { setView("chat"); speak(`Hello ${patientName}! I'm here with you. How are you feeling today?`); }}
                className="bg-patient-primary text-white rounded-3xl px-12 py-7 text-3xl font-bold shadow-lg hover:bg-patient-secondary transition-all active:scale-95 w-full"
                style={{ minHeight: "90px" }}
              >
                🎙️ Talk to Me
              </button>
            </div>

      
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setView("photos")}
                className="bg-white rounded-3xl p-6 shadow-card border border-patient-border text-center hover:bg-patient-bg transition-all active:scale-95"
                style={{ minHeight: "120px" }}
              >
                <div className="text-4xl mb-2">📸</div>
                <p className="text-xl font-bold text-patient-text">My Family</p>
              </button>
              <button
                onClick={() => setView("schedule")}
                className="bg-white rounded-3xl p-6 shadow-card border border-patient-border text-center hover:bg-patient-bg transition-all active:scale-95"
                style={{ minHeight: "120px" }}
              >
                <div className="text-4xl mb-2">📅</div>
                <p className="text-xl font-bold text-patient-text">My Day</p>
              </button>
            </div>

            {patient?.cognitiveStage && (
              <div className="bg-patient-primary/5 rounded-2xl p-4 text-center border border-patient-border">
                <p className="text-base text-gray-500">
                  💙 Your care team is watching over you
                </p>
              </div>
            )}

            <div className="text-center mt-6">
              <button
                onClick={() => {
                  localStorage.removeItem("memorycare_patient_id");
                  router.push("/patient/login");
                }}
                className="text-sm text-gray-400 underline"
              >
                Not you? Switch profile
              </button>
            </div>
          </div>
        )}

     
        {view === "chat" && (
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={endSession}
                className="bg-white rounded-2xl px-5 py-3 text-lg font-bold text-patient-primary border border-patient-border shadow-sm"
              >
                ← Home
              </button>
              <h2 className="text-2xl font-bold text-patient-primary">Chat with AI</h2>
              <div className="w-20" />
            </div>


            <div className="bg-white rounded-3xl p-4 shadow-card border border-patient-border mb-4 min-h-[300px] max-h-[420px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <div className="text-5xl mb-3">💬</div>
                  <p className="text-xl text-gray-400 font-medium">
                    Press the microphone or type to start talking
                  </p>
                </div>
              ) : (
                <div className="space-y-4 p-2">
                  {messages.slice(-5).map((m, i) => (
                    <div
                      key={i}
                      className={`flex ${m.role === "patient" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`rounded-2xl px-5 py-4 max-w-[80%] text-xl leading-relaxed ${
                          m.role === "patient"
                            ? "bg-patient-primary text-white"
                            : "bg-patient-bg text-patient-text border border-patient-border"
                        }`}
                      >
                        {m.role === "ai" && (
                          <span className="text-sm font-bold text-patient-secondary block mb-1">
                            AI Companion
                          </span>
                        )}
                        {m.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

    
            {aiSpeaking && (
              <div className="text-center mb-3">
                <span className="inline-flex items-center gap-2 bg-patient-primary/10 text-patient-primary rounded-full px-4 py-2 text-lg font-semibold">
                  🔊 Speaking...
                </span>
              </div>
            )}


            <div className="flex flex-col items-center gap-4">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`relative w-28 h-28 rounded-full text-5xl shadow-lg transition-all active:scale-95 ${
                  isListening
                    ? "bg-red-500 text-white mic-listening"
                    : "bg-patient-primary text-white hover:bg-patient-secondary"
                }`}
              >
                {isListening ? "⏹️" : "🎙️"}
              </button>
              <p className="text-lg font-semibold text-gray-500">
                {isListening ? "Listening... tap to stop" : "Tap to speak"}
              </p>


              <div className="flex gap-3 w-full">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(inputText)}
                  placeholder="Or type here..."
                  className="flex-1 bg-white border-2 border-patient-border rounded-2xl px-5 py-4 text-xl font-medium outline-none focus:border-patient-primary transition-colors"
                />
                <button
                  onClick={() => sendMessage(inputText)}
                  disabled={!inputText.trim()}
                  className="bg-patient-primary text-white rounded-2xl px-6 py-4 text-xl font-bold disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}


        {view === "photos" && (
          <div className="animate-slide-up">
            <div className="flex items-center mb-6">
              <button
                onClick={() => setView("home")}
                className="bg-white rounded-2xl px-5 py-3 text-lg font-bold text-patient-primary border border-patient-border shadow-sm mr-4"
              >
                ← Home
              </button>
              <h2 className="text-2xl font-bold text-patient-primary">My Family</h2>
            </div>
            <PhotoSlideshow patientId={patientId} speak={speak} />
          </div>
        )}


        {view === "schedule" && (
          <div className="animate-slide-up">
            <div className="flex items-center mb-6">
              <button
                onClick={() => setView("home")}
                className="bg-white rounded-2xl px-5 py-3 text-lg font-bold text-patient-primary border border-patient-border shadow-sm mr-4"
              >
                ← Home
              </button>
              <h2 className="text-2xl font-bold text-patient-primary">My Day</h2>
            </div>
            <DailySchedule patientId={patientId} />
          </div>
        )}
      </div>

      {/* Help Button - always visible */}
      <HelpButton patientId={patientId} patientName={patientName} speak={speak} />
    </div>
  );
}