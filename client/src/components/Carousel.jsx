// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaArrowRight } from "react-icons/fa";
// import { jwtDecode } from "jwt-decode";
// import { useTranslation } from "react-i18next";

// import img1 from "../assets/carousel1.jpg";
// import img2 from "../assets/carousel2.jpg";
// import img3 from "../assets/carousel3.jpg";
// import img4 from "../assets/carousel4.jpg";
// import img5 from "../assets/carousel5.jpg";
// import img7 from "../assets/carousel7.jpg";
// import img9 from "../assets/carousel9.jpg";

// const images = [img1, img2, img3, img4, img5, img7, img9];

// export default function Carousel() {
//   const { t, i18n } = useTranslation();
//   const navigate = useNavigate();

//   const phrases = useMemo(
//     () => [
//       t("carousel_phrase_1"),
//       t("carousel_phrase_2"),
//       t("carousel_phrase_3"),
//     ],
//     [t, i18n.language]
//   );
//   const token = localStorage.getItem("token");

//   let role = null;

//   if (token) {
//     try {
//       const decoded = jwtDecode(token);
//       role = decoded.role;
//     } catch (err) {
//       console.error("Invalid token in HowItWorks.jsx", err);
//     }
//   }

//   const [current, setCurrent] = useState(0);
//   const [displayedText, setDisplayedText] = useState("");
//   const [phraseIndex, setPhraseIndex] = useState(0);
//   const [charIndex, setCharIndex] = useState(0);
//   const [deleting, setDeleting] = useState(false);

//   // Background image rotation
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrent((prev) => (prev + 1) % images.length);
//     }, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   // Typing animation
//   useEffect(() => {
//     const phrase = phrases[phraseIndex] || "";
//     let timeout;

//     if (!deleting && charIndex < phrase.length) {
//       timeout = setTimeout(() => {
//         setDisplayedText((prev) => prev + phrase.charAt(charIndex));
//         setCharIndex((prev) => prev + 1);
//       }, 150);
//     } else if (deleting && charIndex > 0) {
//       timeout = setTimeout(() => {
//         setDisplayedText((prev) => prev.slice(0, -1));
//         setCharIndex((prev) => prev - 1);
//       }, 100);
//     } else {
//       timeout = setTimeout(() => {
//         if (!deleting) {
//           setDeleting(true);
//         } else {
//           setDeleting(false);
//           setPhraseIndex((prev) => (prev + 1) % phrases.length);
//           setCharIndex(0);
//         }
//       }, 1200);
//     }

//     return () => clearTimeout(timeout);
//   }, [charIndex, deleting, phraseIndex, phrases]);

//   // Button logic
//   const handleButtonClick = () => {
//     if (!token) {
//       navigate("/signin", { state: { from: { pathname: "/add-business" } } });
//     } else if (role === "user") {
//       navigate("/add-business");
//     } else if (role === "owner") {
//       alert(t("howitworks.already_listed_alert"));
//     } else {
//       navigate("/signin");
//     }
//   };

//   return (
//     <div className="w-full h-screen relative overflow-hidden">
//       {images.map((img, index) => (
//         <div
//           key={index}
//           className={`absolute top-0 left-0 w-full h-full bg-center bg-cover transition-opacity duration-[2000ms] ease-in-out transform ${
//             index === current
//              ? "opacity-100 scale-105 blur-0"
//               : "opacity-0 scale-100 blur-sm"
//           }`}
//           style={{
//             backgroundImage: `url(${img})`,
//             zIndex: index === current ? 0 : -1,
//           }}
//         />
//       ))}

//       <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black/60 via-gray-900/50 to-gray-800/30 z-10" />

//       <div className="relative z-20 flex flex-col items-center justify-center h-full text-white text-center px-6 max-w-4xl mx-auto">
//         <h1 className="text-4xl md:text-6xl font-extrabold mb-6 drop-shadow-lg tracking-tight min-h-[4.5rem]">
//           {displayedText}
//           <span className="ml-1 text-orange-400 animate-pulse">|</span>
//         </h1>
//         <p className="text-lg md:text-2xl mb-10 drop-shadow-lg font-medium md:font-semibold">
//           {t("carousel_description")}
//         </p>
//         <button
//           onClick={handleButtonClick}
//           className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full text-lg md:text-xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-2 animate-bounce"
//           aria-label={t("list_button_label")}
//         >
//           {t("list_button_label")}
//           <FaArrowRight className="text-white text-lg" />
//         </button>
//       </div>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";

import img1 from "../assets/carousel1.jpg";
import img2 from "../assets/carousel2.jpg";
import img3 from "../assets/carousel3.jpg";
import img4 from "../assets/carousel4.jpg";
import img5 from "../assets/carousel5.jpg";
import img7 from "../assets/carousel7.jpg";
import img9 from "../assets/carousel9.jpg";

const images = [img1, img2, img3, img4, img5, img7, img9];

export default function Carousel() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const phrases = useMemo(
    () => [
      t("carousel_phrase_1"),
      t("carousel_phrase_2"),
      t("carousel_phrase_3"),
    ],
    [t, i18n.language]
  );
  const token = localStorage.getItem("token");

  let role = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded.role;
    } catch (err) {
      console.error("Invalid token in HowItWorks.jsx", err);
    }
  }

  const [current, setCurrent] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  // Background image rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Typing animation
  useEffect(() => {
    const phrase = phrases[phraseIndex] || "";
    let timeout;

    if (!deleting && charIndex < phrase.length) {
      timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + phrase.charAt(charIndex));
        setCharIndex((prev) => prev + 1);
      }, 150);
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setDisplayedText((prev) => prev.slice(0, -1));
        setCharIndex((prev) => prev - 1);
      }, 100);
    } else {
      timeout = setTimeout(() => {
        if (!deleting) {
          setDeleting(true);
        } else {
          setDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
          setCharIndex(0);
        }
      }, 1200);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, phraseIndex, phrases]);

  // Button logic
  const handleButtonClick = () => {
    if (!token) {
      navigate("/signin", { state: { from: { pathname: "/add-business" } } });
    } else if (role === "user") {
      navigate("/add-business");
    } else if (role === "owner") {
      alert(t("howitworks.already_listed_alert"));
    } else {
      navigate("/signin");
    }
  };

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {images.map((img, index) => (
        <div
          key={index}
          className={`absolute top-0 left-0 w-full h-full bg-center bg-cover transition-opacity duration-[2000ms] ease-in-out transform ${
            index === current
              ? "opacity-100 scale-105 blur-0"
              : "opacity-0 scale-100 blur-sm"
          }`}
          style={{
            backgroundImage: `url(${img})`,
            zIndex: index === current ? 0 : -1,
          }}
        />
      ))}

      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black/60 via-gray-900/50 to-gray-800/30 z-10" />

      <div className="relative z-20 flex flex-col items-center justify-center h-full text-white text-center px-6 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-6 drop-shadow-lg tracking-tight min-h-[3rem] md:min-h-[4.5rem]">
          {displayedText}
          <span className="ml-1 text-orange-400 animate-pulse">|</span>
        </h1>
        <p className="text-base md:text-lg lg:text-xl xl:text-2xl mb-8 lg:mb-10 drop-shadow-lg font-medium md:font-semibold">
          {t("carousel_description")}
        </p>
        <button
          onClick={handleButtonClick}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 lg:px-8 lg:py-4 rounded-full text-base md:text-lg lg:text-xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-2 animate-bounce"
          aria-label={t("list_button_label")}
        >
          {t("list_button_label")}
          <FaArrowRight className="text-white text-sm md:text-base lg:text-lg" />
        </button>
      </div>
    </div>
  );
}
