// // components/FreeListingsPopup.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import {
//   X,
//   Star,
//   ArrowRight,
//   Zap,
//   Shield,
//   Heart,
//   Sparkles,
//   Crown,
//   Gift,
// } from "lucide-react";

// /* ---------- literal Tailwind classes so JIT never purges them ---------- */
// const BULLET = {
//   green: {
//     bg: "bg-green-50",
//     border: "border-green-300",
//     hover: "hover:border-green-400",
//     grad: "bg-gradient-to-r from-green-600 to-emerald-700",
//   },
//   blue: {
//     bg: "bg-blue-50",
//     border: "border-blue-300",
//     hover: "hover:border-blue-400",
//     grad: "bg-gradient-to-r from-blue-600 to-cyan-700",
//   },
//   purple: {
//     bg: "bg-purple-50",
//     border: "border-purple-300",
//     hover: "hover:border-purple-400",
//     grad: "bg-gradient-to-r from-purple-600 to-pink-700",
//   },
// };

// const EXIT_MS = 700; // matches transition duration-700

// export default function FreeListingsPopup() {
//   const navigate = useNavigate();

//   /* ----- State for mounted check ----- */
//   const [mounted, setMounted] = useState(false);

//   /* ----- JWT role detection with safety checks ----- */
//   const token =
//     typeof window !== "undefined" ? localStorage.getItem("token") : null;
//   const role = useMemo(() => {
//     if (!mounted || !token) return null;
//     try {
//       return jwtDecode(token).role;
//     } catch {
//       console.error("Invalid token in popup");
//       return null;
//     }
//   }, [token, mounted]);

//   /* ----- show-once-per-page-load flag with safety ----- */
//   const popupAlreadyShown =
//     mounted && typeof window !== "undefined"
//       ? Boolean(window.__freeListingShown)
//       : false;

//   const [open, setOpen] = useState(false);
//   const [anim, setAnim] = useState(false);
//   const [showBadge, setShowBadge] = useState(false); // Start with false to prevent hydration mismatch

//   /* ----- Mount effect to prevent hydration issues ----- */
//   useEffect(() => {
//     setMounted(true);
//     // Set badge state after mounting to prevent hydration mismatch
//     if (typeof window !== "undefined" && window.__freeListingShown) {
//       setShowBadge(true);
//     }
//   }, []);

//   /* ----- first-display timer ----- */
//   useEffect(() => {
//     if (!mounted) return; // Wait for component to mount
//     if (popupAlreadyShown) return; // already seen on this page-load

//     const id = setTimeout(() => {
//       setOpen(true);
//       setAnim(true);
//       if (typeof window !== "undefined") {
//         window.__freeListingShown = true;
//       }
//     }, 2000);
//     return () => clearTimeout(id);
//   }, [popupAlreadyShown, mounted]);

//   /* ----- close helper ----- */
//   const close = () => {
//     setAnim(false);
//     setTimeout(() => {
//       setOpen(false);
//       setShowBadge(true); // keep badge visible
//     }, EXIT_MS);
//   };

//   /* ----- CTA (popup button & badge) ----- */
//   const handleCTA = () => {
//     if (!mounted) return; // Prevent actions before mount

//     if (!token) {
//       navigate("/signin", { state: { from: { pathname: "/add-business" } } });
//     } else if (role === "user") {
//       navigate("/add-business");
//     } else if (role === "owner") {
//       alert("You've already listed a business.");
//     } else {
//       navigate("/signin");
//     }
//   };

//   // Don't render anything until mounted to prevent hydration mismatch
//   if (!mounted) {
//     return null;
//   }

//   /* ─────────── Render paths ─────────────────────────── */

//   /* 1. Enhanced persistent badge with tooltip */
//   if (showBadge && !open) {
//     return (
//       <div className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-[55] group">
//         {/* Permanent short label */}
//         <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-10">
//           {/* Short label - always visible */}
//           <div className="text-red-600 text-[10px] font-bold text-center animate-pulse group-hover:opacity-0 transition-opacity duration-300">
//             Limited Time! 🔥
//           </div>

//           {/* Full version - show on hover */}
//           <div className="absolute top-0 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
//             <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
//               <div className="font-bold text-orange-300">
//                 🔥 First 500 Listings FREE!
//               </div>
//               <div className="text-gray-300">Hurry up - Limited time offer</div>
//               {/* Tooltip arrow */}
//               <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
//             </div>
//           </div>
//         </div>

//         {/* Main badge button */}
//         <button
//           onClick={handleCTA}
//           aria-label="First 500 listings free - Hurry up!"
//           className="
//             relative flex h-16 w-16 flex-col items-center justify-center
//             rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 
//             text-white shadow-2xl border-2 border-white
//             transition-all duration-300 hover:scale-110 hover:shadow-orange-500/50
//             focus:outline-none focus:ring-4 focus:ring-orange-300
//             animate-pulse hover:animate-bounce
//           "
//         >
//           {/* Pulsing ring effect */}
//           <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-20"></div>

//           {/* Gift icon and text */}
//           <div className="relative z-10 flex flex-col items-center">
//             <Gift size={14} className="mb-0.5 animate-bounce" />
//             <span className="text-[9px] leading-tight font-black tracking-tight">
//               500
//               <br />
//               FREE
//             </span>
//           </div>

//           {/* Sparkle effects */}
//           <div className="absolute -top-1 -right-1 text-yellow-300 animate-spin">
//             <Sparkles size={12} />
//           </div>
//           <div
//             className="absolute -bottom-1 -left-1 text-yellow-300 animate-spin"
//             style={{ animationDelay: "0.5s" }}
//           >
//             <Star size={10} />
//           </div>

//           {/* "NEW" badge */}
//           <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-white shadow-lg animate-pulse">
//             NEW
//           </div>
//         </button>
//       </div>
//     );
//   }

//   /* 2. Nothing rendered */
//   if (!open) return null;

//   /* 3. Full popup */
//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-start justify-center
//                  overflow-y-auto bg-black/80 p-4 pt-10 backdrop-blur-sm"
//     >
//       {/* helper so Tailwind keeps colour classes */}
//       <span
//         className="hidden bg-green-50 bg-blue-50 bg-purple-50
//                        border-green-300 border-blue-300 border-purple-300"
//       />

//       <div
//         className={`relative my-8 w-full max-w-sm sm:max-w-md lg:max-w-lg
//                     transform overflow-hidden rounded-2xl bg-white shadow-2xl
//                     transition-all duration-700
//                     ${anim ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
//         style={{
//           background:
//             "linear-gradient(135deg,#ffffff 0%,#f8fafc 50%,#ffffff 100%)",
//           boxShadow:
//             "0 32px 64px -12px rgba(0,0,0,.35),0 0 0 1px rgba(255,255,255,.1),inset 0 1px 0 rgba(255,255,255,.8)",
//         }}
//       >
//         {/* ───── Close button ───── */}
//         <button
//           aria-label="Close popup"
//           onClick={close}
//           className="absolute top-2 right-2 z-20 rounded-full border-2 border-gray-100
//                      bg-white p-2 text-gray-600 shadow-lg transition
//                      hover:scale-110 hover:rotate-90 hover:bg-red-50 hover:text-red-600
//                      hover:border-red-200"
//         >
//           <X size={18} />
//         </button>

//         {/* ───── Header ───── */}
//         <div
//           className="relative rounded-t-2xl bg-gradient-to-br
//                      from-orange-400 via-red-500 to-pink-500 p-6 text-white"
//         >
//           {/* blurred accents */}
//           <div className="absolute inset-0 opacity-15">
//             <div className="absolute top-6 left-6 h-40 w-40 animate-pulse rounded-full bg-white blur-sm" />
//             <div className="absolute bottom-6 right-6 h-32 w-32 animate-pulse rounded-full bg-white blur-sm delay-700" />
//           </div>

//           {["✨", "⭐", "💫", "🌟", "⚡"].map((sym, i) => (
//             <div
//               key={sym}
//               className="absolute animate-ping text-white/40"
//               style={{
//                 top: ["2rem", "5rem", "auto", "8rem", "auto"][i],
//                 left: ["4rem", "auto", "6rem", "2rem", "auto"][i],
//                 right: ["auto", "5rem", "auto", "auto", "2rem"][i],
//                 bottom: ["auto", "auto", "4rem", "auto", "2rem"][i],
//                 fontSize: ["1.5rem", "1.25rem", "1rem", ".875rem", ".875rem"][
//                   i
//                 ],
//                 animationDelay: `${0.5 * i}s`,
//               }}
//             >
//               {sym}
//             </div>
//           ))}

//           <div className="relative z-10 text-center">
//             <div className="mb-4 flex items-center justify-center">
//               <span className="mr-3 rounded-full border border-white/30 bg-white/20 p-3 backdrop-blur-md shadow-lg">
//                 <Crown size={24} className="animate-bounce text-yellow-300" />
//               </span>
//               <div>
//                 <h2 className="mb-1 text-xl font-bold tracking-tight sm:text-2xl">
//                   Exclusive Offer!
//                 </h2>
//                 <div className="flex items-center justify-center text-xs font-medium opacity-90">
//                   <Sparkles
//                     size={12}
//                     className="mr-1 animate-spin text-yellow-300"
//                   />
//                   Limited Time Special
//                   <Sparkles
//                     size={12}
//                     className="ml-1 animate-spin text-yellow-300"
//                   />
//                 </div>
//               </div>
//             </div>

//             <span
//               className="inline-flex animate-pulse items-center rounded-full
//                          border border-white/30 bg-gradient-to-r
//                          from-yellow-400 to-orange-400 px-4 py-2
//                          text-sm font-bold shadow-xl"
//             >
//               <Star size={16} className="mr-2 animate-spin" />
//               🔥 PREMIUM DEAL 🔥
//             </span>
//           </div>
//         </div>

//         {/* ───── Body ───── */}
//         <div className="p-4 sm:p-6">
//           {/* Top section */}
//           <section className="mb-6 text-center">
//             <h3 className="mb-4 text-2xl font-bold sm:text-3xl">
//               <span
//                 className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600
//                            bg-clip-text text-transparent"
//               >
//                 First 500 Listings
//               </span>
//               <br />
//               <span className="animate-pulse text-green-600">100% FREE!</span>
//             </h3>
//             <p className="mb-4 text-sm font-medium text-gray-600 sm:text-base">
//               Transform your business with our premium listing service
//             </p>
//           </section>

//           {/* Feature bullets */}
//           <ul className="mb-6 grid grid-cols-1 gap-3">
//             {[
//               {
//                 text: "Zero setup fees • कोई सेटअप फीस नहीं",
//                 icon: Shield,
//                 colour: "green",
//               },
//               {
//                 text: "Instant activation • तत्काल सक्रियकरण",
//                 icon: Zap,
//                 colour: "blue",
//               },
//               {
//                 text: "Premium support • प्रीमियम सहायता",
//                 icon: Heart,
//                 colour: "purple",
//               },
//             ].map(({ text, icon: Icon, colour }) => {
//               const s = BULLET[colour];
//               return (
//                 <li
//                   key={text}
//                   className={`flex items-center rounded-xl p-3 shadow-md transition
//                               ${s.bg} ${s.border} hover:-translate-y-1 hover:scale-105
//                               ${s.hover} hover:shadow-lg`}
//                 >
//                   <span
//                     className={`mr-3 rounded-full p-2 text-white shadow-lg ${s.grad}`}
//                   >
//                     <Icon size={20} strokeWidth={2.25} />
//                   </span>
//                   <span className="text-sm font-bold text-gray-700">
//                     {text}
//                   </span>
//                 </li>
//               );
//             })}
//           </ul>

//           {/* Action buttons */}
//           <div className="space-y-3">
//             <button
//               onClick={handleCTA}
//               className="group relative flex w-full items-center justify-center overflow-hidden
//                          rounded-2xl border border-white/20 bg-gradient-to-r
//                          from-orange-500 via-red-500 to-purple-600 px-6 py-4
//                          text-base font-bold text-white shadow-2xl transition
//                          hover:-translate-y-1 hover:scale-105 hover:shadow-pink-500/25"
//             >
//               {/* shine */}
//               <span
//                 className="absolute inset-0 -translate-x-full bg-gradient-to-r
//                            from-transparent via-white/30 to-transparent
//                            transition-transform duration-1000 group-hover:translate-x-full"
//               />
//               {/* glow */}
//               <span
//                 className="absolute inset-0 rounded-2xl bg-gradient-to-r
//                            from-orange-400 to-purple-500 opacity-0
//                            transition-opacity duration-300 group-hover:animate-pulse
//                            group-hover:opacity-20"
//               />
//               <span className="relative z-10 flex items-center">
//                 <Crown size={18} className="mr-2 animate-bounce" />
//                 Claim Your FREE Premium Listing
//                 <Sparkles size={16} className="ml-2 animate-spin" />
//               </span>
//               <ArrowRight
//                 size={20}
//                 className="relative z-10 ml-3 transition
//                            group-hover:translate-x-3 group-hover:scale-125"
//               />
//             </button>

//             <button
//               onClick={close}
//               className="w-full rounded-2xl border border-gray-200
//                          bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3
//                          font-bold text-gray-700 shadow-lg transition
//                          hover:-translate-y-1 hover:scale-105 hover:bg-gradient-to-r
//                          hover:from-gray-100 hover:to-gray-200 hover:shadow-xl"
//             >
//               Maybe Later
//             </button>
//           </div>

//           {/* footer note */}
//           <p
//             className="mt-6 rounded-xl border border-gray-200 bg-gradient-to-r
//                        from-gray-50 to-gray-100 p-3 text-center text-xs text-gray-500
//                        shadow-inner leading-relaxed"
//           >
//             * Exclusive offer for new users only.
//             <br />
//             🎯 Start building your success story today!
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// ---------- FreeListingsSection.jsx ----------
// import React, { useMemo, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import {
//   Star,
//   ArrowRight,
//   Zap,
//   Shield,
//   Heart,
//   Sparkles,
//   Crown,
//   Gift,
//   TrendingUp,
//   Users,
//   Award,
//   Rocket,
//   CheckCircle,
//   Clock,
//   Target,
//   Flame,
// } from "lucide-react";

// /* ---------- Enhanced color schemes ---------- */
// const BULLET = {
//   green: {
//     bg: "bg-gradient-to-r from-green-50 to-emerald-50",
//     border: "border-green-300",
//     hover: "hover:border-green-400 hover:shadow-green-200/50",
//     grad: "bg-gradient-to-r from-green-600 to-emerald-700",
//     text: "text-green-800",
//   },
//   blue: {
//     bg: "bg-gradient-to-r from-blue-50 to-cyan-50",
//     border: "border-blue-300",
//     hover: "hover:border-blue-400 hover:shadow-blue-200/50",
//     grad: "bg-gradient-to-r from-blue-600 to-cyan-700",
//     text: "text-blue-800",
//   },
//   purple: {
//     bg: "bg-gradient-to-r from-purple-50 to-pink-50",
//     border: "border-purple-300",
//     hover: "hover:border-purple-400 hover:shadow-purple-200/50",
//     grad: "bg-gradient-to-r from-purple-600 to-pink-700",
//     text: "text-purple-800",
//   },
//   orange: {
//     bg: "bg-gradient-to-r from-orange-50 to-red-50",
//     border: "border-orange-300",
//     hover: "hover:border-orange-400 hover:shadow-orange-200/50",
//     grad: "bg-gradient-to-r from-orange-600 to-red-700",
//     text: "text-orange-800",
//   },
// };

// export default function FreeListingsSection() {
//   const navigate = useNavigate();
//   const [mounted, setMounted] = useState(false);
//   const [currentStat, setCurrentStat] = useState(0);

//   /* ----- JWT role detection ----- */
//   const token =
//     typeof window !== "undefined" ? localStorage.getItem("token") : null;
//   const role = useMemo(() => {
//     if (!mounted || !token) return null;
//     try {
//       return jwtDecode(token).role;
//     } catch {
//       console.error("Invalid token");
//       return null;
//     }
//   }, [token, mounted]);

//   /* ----- Mount effect ----- */
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   /* ----- Animated stats rotation ----- */
//   const stats = [
//     { number: "500+", label: "Free Listings", icon: Gift },
//     { number: "10K+", label: "Happy Customers", icon: Users },
//     { number: "95%", label: "Success Rate", icon: TrendingUp },
//     { number: "24/7", label: "Support", icon: Shield },
//   ];

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentStat((prev) => (prev + 1) % stats.length);
//     }, 2000);
//     return () => clearInterval(interval);
//   }, []);

//   /* ----- CTA handler ----- */
//   const handleCTA = () => {
//     if (!mounted) return;

//     if (!token) {
//       navigate("/signin", { state: { from: { pathname: "/add-business" } } });
//     } else if (role === "user") {
//       navigate("/add-business");
//     } else if (role === "owner") {
//       alert("You've already listed a business.");
//     } else {
//       navigate("/signin");
//     }
//   };

//   if (!mounted) return null;

//   return (
//     <div className="relative flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 overflow-hidden">
//       {/* Animated background elements */}
//       <div className="absolute inset-0 overflow-hidden">
//         {/* Floating orbs */}
//         <div className="absolute top-10 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
//         <div className="absolute top-32 right-16 w-32 h-32 bg-pink-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
//         <div className="absolute bottom-20 left-20 w-24 h-24 bg-blue-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
        
//         {/* Geometric shapes */}
//         <div className="absolute top-1/4 right-8 w-16 h-16 border-2 border-purple-400/30 rotate-45 animate-spin" style={{ animationDuration: '8s' }} />
//         <div className="absolute bottom-1/3 left-12 w-12 h-12 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rotate-12 animate-bounce" />
        
//         {/* Sparkles */}
//         {[...Array(8)].map((_, i) => (
//           <div
//             key={i}
//             className="absolute text-yellow-400/40 animate-ping"
//             style={{
//               top: `${Math.random() * 80 + 10}%`,
//               left: `${Math.random() * 80 + 10}%`,
//               animationDelay: `${Math.random() * 3}s`,
//               fontSize: `${Math.random() * 8 + 8}px`,
//             }}
//           >
//             ✨
//           </div>
//         ))}
//       </div>

//       {/* Main content */}
//       <div className="relative z-10 flex flex-col h-full p-6 lg:p-8">
//         {/* Header with animated badge */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center space-x-2">
//               <div className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
//                 <Flame size={20} className="text-white animate-bounce" />
//               </div>
//               <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
//                 LIMITED TIME
//               </div>
//             </div>
//             <div className="text-right">
//               <div className="text-yellow-400 text-sm font-semibold">⏰ Hurry Up!</div>
//               <div className="text-white/80 text-xs">Offer Expires Soon</div>
//             </div>
//           </div>

//           <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
//             <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
//               First 500 Listings
//             </span>
//             <br />
//             <span className="text-green-400 animate-pulse">100% FREE!</span>
//           </h1>
          
//           <p className="text-white/90 text-sm lg:text-base font-medium">
//             🚀 Transform your business with our premium listing service
//           </p>
//         </div>

//         {/* Animated stats counter */}
//         <div className="mb-8 p-4 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10">
//           <div className="text-center">
//             <div className="flex items-center justify-center mb-2">
//               {React.createElement(stats[currentStat].icon, {
//                 size: 24,
//                 className: "text-yellow-400 mr-2 animate-bounce"
//               })}
//               <div className="text-2xl font-bold text-white">
//                 {stats[currentStat].number}
//               </div>
//             </div>
//             <div className="text-white/80 text-sm font-medium">
//               {stats[currentStat].label}
//             </div>
//           </div>
//         </div>

//         {/* Enhanced feature bullets - 2x2 Grid */}
//         <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
//           {[
//             {
//               text: "Zero setup fees",
//               subtext: "कोई सेटअप फीस नहीं",
//               icon: Shield,
//               colour: "green",
//             },
//             {
//               text: "Instant activation",
//               subtext: "तत्काल सक्रियकरण",
//               icon: Zap,
//               colour: "blue",
//             },
//             {
//               text: "Premium support",
//               subtext: "प्रीमियम सहायता",
//               icon: Heart,
//               colour: "purple",
//             },
//             {
//               text: "Boost visibility",
//               subtext: "बेहतर दिखाई देना",
//               icon: TrendingUp,
//               colour: "orange",
//             },
//           ].map(({ text, subtext, icon: Icon, colour }, index) => {
//             const s = BULLET[colour];
//             return (
//               <div
//                 key={text}
//                 className={`group flex items-center p-3 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 ${s.hover}`}
//                 style={{ animationDelay: `${index * 0.1}s` }}
//               >
//                 <div className={`mr-3 p-2 rounded-full ${s.grad} shadow-lg group-hover:scale-110 transition-transform`}>
//                   <Icon size={16} className="text-white" strokeWidth={2.5} />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="text-white font-bold text-xs lg:text-sm">{text}</div>
//                   <div className="text-white/70 text-[10px] lg:text-xs truncate">{subtext}</div>
//                 </div>
//                 <CheckCircle size={14} className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
//               </div>
//             );
//           })}
//         </div>

//         {/* Urgency indicators */}
//         <div className="mb-8 space-y-3">
//           <div className="flex items-center justify-between p-3 bg-red-500/20 rounded-lg border border-red-500/30">
//             <div className="flex items-center">
//               <Clock size={16} className="text-red-400 mr-2 animate-pulse" />
//               <span className="text-red-200 text-sm font-medium">Limited Time Offer</span>
//             </div>
//             <div className="text-red-100 text-xs bg-red-500/30 px-2 py-1 rounded-full">
//               Only 127 left!
//             </div>
//           </div>
          
//           <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg border border-green-500/30">
//             <div className="flex items-center">
//               <Target size={16} className="text-green-400 mr-2" />
//               <span className="text-green-200 text-sm font-medium">Success Guarantee</span>
//             </div>
//             <div className="text-green-100 text-xs bg-green-500/30 px-2 py-1 rounded-full">
//               95% Success Rate
//             </div>
//           </div>
//         </div>

//         {/* Enhanced CTA button */}
//         <div className="mt-auto">
//           <button
//             onClick={handleCTA}
//             className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 p-1 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-orange-500/50 focus:outline-none focus:ring-4 focus:ring-orange-300"
//           >
//             {/* Animated shine effect */}
//             <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            
//             {/* Button content */}
//             <div className="relative flex items-center justify-center space-x-3 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 px-6 py-4 rounded-xl">
//               <Crown size={20} className="text-white animate-bounce" />
//               <div className="text-center">
//                 <div className="text-white font-bold text-lg">Claim Your FREE Listing</div>
//                 <div className="text-white/90 text-xs">Join 10,000+ successful businesses</div>
//               </div>
//               <ArrowRight size={20} className="text-white transition-transform group-hover:translate-x-2 group-hover:scale-125" />
//             </div>
            
//             {/* Glow effect */}
//             <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400 to-purple-500 opacity-0 transition-opacity duration-300 group-hover:animate-pulse group-hover:opacity-20" />
//           </button>

//           {/* Trust indicators */}
//           <div className="mt-4 flex items-center justify-center space-x-6 text-white/70 text-xs">
//             <div className="flex items-center">
//               <Award size={12} className="mr-1" />
//               <span>Premium Quality</span>
//             </div>
//             <div className="flex items-center">
//               <Shield size={12} className="mr-1" />
//               <span>Secure & Safe</span>
//             </div>
//             <div className="flex items-center">
//               <Rocket size={12} className="mr-1" />
//               <span>Instant Setup</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Bottom gradient overlay */}
//       <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
//     </div>
//   );
// }

import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Star,
  ArrowRight,
  Zap,
  Shield,
  Heart,
  Sparkles,
  Crown,
  Gift,
  TrendingUp,
  Users,
  Award,
  Rocket,
  CheckCircle,
  Clock,
  Target,
  Flame,
} from "lucide-react";

/* ---------- Enhanced color schemes ---------- */
const BULLET = {
  green: {
    bg: "bg-gradient-to-r from-green-50 to-emerald-50",
    border: "border-green-300",
    hover: "hover:border-green-400 hover:shadow-green-200/50",
    grad: "bg-gradient-to-r from-green-600 to-emerald-700",
    text: "text-green-800",
  },
  blue: {
    bg: "bg-gradient-to-r from-blue-50 to-cyan-50",
    border: "border-blue-300",
    hover: "hover:border-blue-400 hover:shadow-blue-200/50",
    grad: "bg-gradient-to-r from-blue-600 to-cyan-700",
    text: "text-blue-800",
  },
  purple: {
    bg: "bg-gradient-to-r from-purple-50 to-pink-50",
    border: "border-purple-300",
    hover: "hover:border-purple-400 hover:shadow-purple-200/50",
    grad: "bg-gradient-to-r from-purple-600 to-pink-700",
    text: "text-purple-800",
  },
  orange: {
    bg: "bg-gradient-to-r from-orange-50 to-red-50",
    border: "border-orange-300",
    hover: "hover:border-orange-400 hover:shadow-orange-200/50",
    grad: "bg-gradient-to-r from-orange-600 to-red-700",
    text: "text-orange-800",
  },
};

export default function FreeListingsSection() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);

  /* ----- JWT role detection ----- */
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const role = useMemo(() => {
    if (!mounted || !token) return null;
    try {
      return jwtDecode(token).role;
    } catch {
      console.error("Invalid token");
      return null;
    }
  }, [token, mounted]);

  /* ----- Mount effect ----- */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* ----- Animated stats rotation ----- */
  const stats = [
    { number: "500+", label: "Free Listings", icon: Gift },
    { number: "10K+", label: "Happy Customers", icon: Users },
    { number: "95%", label: "Success Rate", icon: TrendingUp },
    { number: "24/7", label: "Support", icon: Shield },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  /* ----- CTA handler ----- */
  const handleCTA = () => {
    if (!mounted) return;

    if (!token) {
      navigate("/signin", { state: { from: { pathname: "/add-business" } } });
    } else if (role === "user") {
      navigate("/add-business");
    } else if (role === "owner") {
      alert("You've already listed a business.");
    } else {
      navigate("/signin");
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-32 right-16 w-32 h-32 bg-pink-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-blue-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Geometric shapes */}
        <div className="absolute top-1/4 right-8 w-16 h-16 border-2 border-purple-400/30 rotate-45 animate-spin" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/3 left-12 w-12 h-12 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rotate-12 animate-bounce" />
        
        {/* Sparkles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute text-yellow-400/40 animate-ping"
            style={{
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              animationDelay: `${Math.random() * 3}s`,
              fontSize: `${Math.random() * 8 + 8}px`,
            }}
          >
            ✨
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col h-full p-6 lg:p-8">
        {/* Header with animated badge */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
                <Flame size={20} className="text-white animate-bounce" />
              </div>
              <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                LIMITED TIME
              </div>
            </div>
            <div className="text-right">
              <div className="text-yellow-400 text-sm font-semibold">⏰ Hurry Up!</div>
              <div className="text-white/80 text-xs">Offer Expires Soon</div>
            </div>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              First 500 Listings
            </span>
            <br />
            <span className="text-green-400 animate-pulse">100% FREE!</span>
          </h1>
          
          <p className="text-white/90 text-sm lg:text-base font-medium">
            🚀 Transform your business with our premium listing service
          </p>
        </div>

        <div className="mb-8 p-4 bg-gradient-to-r from-white/85 to-slate-50/85 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              {React.createElement(stats[currentStat].icon, {
                size: 24,
                className: "text-yellow-600 mr-2 animate-bounce"
              })}
              <div className="text-2xl font-bold text-slate-800">
                {stats[currentStat].number}
              </div>
            </div>
            <div className="text-slate-700 text-sm font-medium">
              {stats[currentStat].label}
            </div>
          </div>
        </div>

        {/* Enhanced feature bullets - 2x2 Grid - LIGHTER */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              text: "Zero setup fees",
              subtext: "कोई सेटअप फीस नहीं",
              icon: Shield,
              colour: "green",
            },
            {
              text: "Instant activation",
              subtext: "तत्काल सक्रियकरण",
              icon: Zap,
              colour: "blue",
            },
            {
              text: "Premium support",
              subtext: "प्रीमियम सहायता",
              icon: Heart,
              colour: "purple",
            },
            {
              text: "Boost visibility",
              subtext: "बेहतर दिखाई देना",
              icon: TrendingUp,
              colour: "orange",
            },
          ].map(({ text, subtext, icon: Icon, colour }, index) => {
            const s = BULLET[colour];
            return (
              <div
                key={text}
                className={`group flex items-center p-3 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 bg-gradient-to-r from-white/75 to-slate-50/75 backdrop-blur-sm border border-white/60 hover:from-white/85 hover:to-slate-50/85 shadow-lg ${s.hover}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`mr-3 p-2 rounded-full ${s.grad} shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon size={16} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-800 font-bold text-xs lg:text-sm">{text}</div>
                  <div className="text-slate-600 text-[10px] lg:text-xs truncate">{subtext}</div>
                </div>
                <CheckCircle size={14} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            );
          })}
        </div>

        {/* Urgency indicators - LIGHTER */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-100/90 rounded-lg border border-red-200 shadow-sm">
            <div className="flex items-center">
              <Clock size={16} className="text-red-600 mr-2 animate-pulse" />
              <span className="text-red-800 text-sm font-medium">Limited Time Offer</span>
            </div>
            <div className="text-red-700 text-xs bg-red-200/80 px-2 py-1 rounded-full">
              Only 127 left!
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-100/90 rounded-lg border border-green-200 shadow-sm">
            <div className="flex items-center">
              <Target size={16} className="text-green-600 mr-2" />
              <span className="text-green-800 text-sm font-medium">Success Guarantee</span>
            </div>
            <div className="text-green-700 text-xs bg-green-200/80 px-2 py-1 rounded-full">
              95% Success Rate
            </div>
          </div>
        </div>

        {/* Enhanced CTA button */}
        <div className="mt-auto">
          <button
            onClick={handleCTA}
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 p-1 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-orange-500/50 focus:outline-none focus:ring-4 focus:ring-orange-300"
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            
            {/* Button content */}
            <div className="relative flex items-center justify-center space-x-3 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 px-6 py-4 rounded-xl">
              <Crown size={20} className="text-white animate-bounce" />
              <div className="text-center">
                <div className="text-white font-bold text-lg">Claim Your FREE Listing</div>
                <div className="text-white/90 text-xs">Join 10,000+ successful businesses</div>
              </div>
              <ArrowRight size={20} className="text-white transition-transform group-hover:translate-x-2 group-hover:scale-125" />
            </div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400 to-purple-500 opacity-0 transition-opacity duration-300 group-hover:animate-pulse group-hover:opacity-20" />
          </button>

          {/* Trust indicators */}
          <div className="mt-4 flex items-center justify-center space-x-6 text-white/70 text-xs">
            <div className="flex items-center">
              <Award size={12} className="mr-1" />
              <span>Premium Quality</span>
            </div>
            <div className="flex items-center">
              <Shield size={12} className="mr-1" />
              <span>Secure & Safe</span>
            </div>
            <div className="flex items-center">
              <Rocket size={12} className="mr-1" />
              <span>Instant Setup</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
    </div>
  );
}