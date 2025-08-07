// src/components/Navbar.jsx  —— Category-only search
import { useState, useRef, useEffect, useContext, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaSearch, FaTimes, FaClock } from "react-icons/fa";
import logo from "../assets/logo/logo.png";
import { AuthContext } from "../context/AuthContext";

/* ── fixed categories ─────────────────────────────────────── */
const categoryKeys = [
  "civil_contractor",
  "waterproofing_applicator",
  "plumber",
  "carpenter",
  "painter",
  "borewell_drilling",
  "electrician",
  "solar_panel_installer",
  "real_estate",
  "construction_material_suppliers",
  "cleaning_worker",
  "furniture_contractor",
];

const slug = (s) => s.toLowerCase().replace(/_/g, "-");

/* Build static suggestion list (English only for matching) */
const categorySuggestions = categoryKeys.map((key, i) => ({
  id: i,
  text: key.replace(/_/g, " "), // “solar panel installer”
  category: key,
  type: "category",
}));

/* ─────────────────────────────────────────────────────────── */

export default function Navbar() {
  /* ── context & hooks ───────────────────────── */
  const { token, businessId, logout, ready } = useContext(AuthContext);
  const isLogged = !!token;
  const hasListing = !!businessId;
  const { t, i18n } = useTranslation();
  const nav = useNavigate();

  /* ── search state ──────────────────────────── */
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  /* ── menu/dropdown state ───────────────────── */
  const [mob, setMob] = useState(false);
  const [cats, setCats] = useState(false);
  const [mobCats, setMCat] = useState(false);
  const [userDD, setUserDD] = useState(false);
  const [langDD, setLang] = useState(false);

  /* ── refs ──────────────────────────────────── */
  const catR = useRef(null);
  const userR = useRef(null);
  const langR = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  /* ── load history (once) ───────────────────── */
  useEffect(() => {
    const h = localStorage.getItem("searchHistory");
    const r = localStorage.getItem("recentSearches");
    if (h) setSearchHistory(JSON.parse(h));
    if (r) setRecentSearches(JSON.parse(r));
  }, []);

  /* ── helpers ───────────────────────────────── */
  const saveSearchToHistory = useCallback(
    (term) => {
      const newItem = {
        id: Date.now(),
        text: term,
        ts: new Date().toISOString(),
      };
      const hist = [
        newItem,
        ...searchHistory.filter((s) => s.text !== term),
      ].slice(0, 10);
      const rec = [
        newItem,
        ...recentSearches.filter((s) => s.text !== term),
      ].slice(0, 5);
      setSearchHistory(hist);
      setRecentSearches(rec);
      localStorage.setItem("searchHistory", JSON.stringify(hist));
      localStorage.setItem("recentSearches", JSON.stringify(rec));
    },
    [searchHistory, recentSearches]
  );

  /* Debounced suggestion filter (English-only match) */
  const debouncedSearch = useCallback(
    debounce((term) => {
      if (term.length < 2) {
        setSuggestions([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      setTimeout(() => {
        const lower = term.toLowerCase();
        const filtered = categorySuggestions.filter((s) =>
          s.text.toLowerCase().includes(lower)
        );
        setSuggestions(filtered);
        setIsSearching(false);
      }, 200);
    }, 300),
    []
  );

  /* ── input handlers ────────────────────────── */
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQ(val);
    setSelectedSuggestion(-1);
    if (val.trim()) {
      debouncedSearch(val);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const performSearch = () => {
    const term = q.trim();
    if (!term) return;
    saveSearchToHistory(term);
    closeAll();
    nav(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleSuggestionClick = (sug) => {
    setQ(sug.text);
    saveSearchToHistory(sug.text);
    closeAll();
    nav(`/categories/${slug(sug.category)}?q=${encodeURIComponent(sug.text)}`);
  };

  /* ── key navigation ────────────────────────── */
  const handleKeyDown = (e) => {
    if (!showSuggestions) {
      if (e.key === "Enter") performSearch();
      return;
    }
    const total = suggestions.length + recentSearches.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestion((p) => (p < total - 1 ? p + 1 : p));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestion((p) => (p > -1 ? p - 1 : p));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const all = [...suggestions, ...recentSearches];
      const sel = all[selectedSuggestion];
      sel ? handleSuggestionClick(sel) : performSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
    }
  };

  /* ── misc ui helpers ───────────────────────── */
  const clearSearch = () => {
    setQ("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
    searchInputRef.current?.focus();
  };

  const removeFromRecent = (id) => {
    const rec = recentSearches.filter((s) => s.id !== id);
    setRecentSearches(rec);
    localStorage.setItem("recentSearches", JSON.stringify(rec));
  };

  const closeAll = () => {
    setMob(false);
    setCats(false);
    setMCat(false);
    setUserDD(false);
    setLang(false);
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
  };

  const handleLogout = () => {
    logout();
    closeAll();
    nav("/");
  };

  /* ── global click-outside ──────────────────── */
  useEffect(() => {
    const click = (e) => {
      if (catR.current && !catR.current.contains(e.target)) setCats(false);
      if (userR.current && !userR.current.contains(e.target)) setUserDD(false);
      if (langR.current && !langR.current.contains(e.target)) setLang(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
      }
    };
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, []);

  /* ── resize => close mobile drawer ─────────── */
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setMob(false);
        setMCat(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!ready) return <nav className="bg-white shadow-md h-16" />;

  /* ── suggestion dropdown UI ────────────────── */
  const renderSuggestions = () => {
    if (!showSuggestions && !q.trim()) return null;
    if (!suggestions.length && !recentSearches.length) return null;

    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-lg z-50 max-h-80 overflow-y-auto">
        {/* recent */}
        {recentSearches.length > 0 && !q.trim() && (
          <div className="p-2 border-b border-gray-100">
            <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
              <FaClock className="w-3 h-3" />
              {t("recent_searches", "Recent Searches")}
            </div>

            {recentSearches.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                  selectedSuggestion === i ? "bg-orange-50" : "hover:bg-gray-50"
                }`}
                onClick={() => handleSuggestionClick(s)}
              >
                <span className="text-sm text-gray-700">{s.text}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromRecent(s.id);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* category suggestions */}
        {suggestions.length > 0 && (
          <div className="p-2">
            {suggestions.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                  selectedSuggestion === recentSearches.length + i
                    ? "bg-orange-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleSuggestionClick(s)}
              >
                <FaSearch className="w-3 h-3 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {t(`category_names.${s.category}`)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* loading / empty */}
        {isSearching && (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
            <span className="text-sm mt-2">
              {t("searching", "Searching...")}
            </span>
          </div>
        )}
        {q.trim() && !isSearching && suggestions.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            <span className="text-sm">
              {t("no_suggestions", "No suggestions found")}
            </span>
          </div>
        )}
      </div>
    );
  };

  /* ── JSX trimmed for brevity ───────────────── */
  /*   ─ keep everything after this point as in your original file ─
       (logo, desktop search wrapper, menu links, mobile drawer, etc.)
     */

  return (
    <nav className="bg-white shadow-md fixed inset-x-0 top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* logo */}
        <Link
          to="/"
          onClick={closeAll}
          className="flex items-center bg-black rounded-md"
        >
          <img src={logo} alt="Bazaardial" className="w-40 h-12 object-cover" />
        </Link>

        {/* desktop search */}
        <div className="hidden md:block flex-grow text-center">
          <div
            className="relative inline-block w-full max-w-md"
            ref={searchRef}
          >
            <div className="relative">
              <input
                ref={searchInputRef}
                value={q}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                placeholder={t("search_placeholder")}
                className="w-full pl-4 pr-20 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                autoComplete="off"
              />
              {q && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              )}
              <button
                type="button"
                onClick={performSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-600 p-1"
              >
                <FaSearch className="w-4 h-4" />
              </button>
            </div>
            {renderSuggestions()}
          </div>
        </div>

        {/* desktop links */}
        <div className="hidden md:flex items-center space-x-6 ml-auto">
          <Link
            to="/"
            onClick={closeAll}
            className="text-gray-700 hover:text-orange-600"
          >
            {t("home")}
          </Link>
          <Link
            to="/about"
            onClick={closeAll}
            className="text-gray-700 hover:text-orange-600"
          >
            {t("about.heading")}
          </Link>

          {/* categories */}
          <div className="relative" ref={catR}>
            <button
              onClick={() => setCats(!cats)}
              className="flex items-center gap-1 text-gray-700 hover:text-orange-600"
            >
              {t("categories")}{" "}
              <span
                className={`transition-transform ${cats ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>
            {cats && (
              <ul className="absolute mt-2 w-64 bg-white shadow-lg rounded-md py-2 z-10">
                {categoryKeys.map((k) => (
                  <li key={k}>
                    <Link
                      to={`/categories/${slug(k)}`}
                      onClick={closeAll}
                      className="block px-4 py-2 text-gray-600 hover:bg-orange-100 hover:text-orange-700"
                    >
                      {t(`category_names.${k}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* language */}
          <div className="relative" ref={langR}>
            <button
              onClick={() => setLang(!langDD)}
              className="flex items-center gap-1 text-gray-700 hover:text-orange-600"
            >
              {t("language")}{" "}
              <span
                className={`transition-transform ${langDD ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>
            {langDD && (
              <ul className="absolute mt-2 w-32 bg-white shadow-lg rounded-md py-2 z-20">
                <li>
                  <button
                    onClick={() => {
                      i18n.changeLanguage("en");
                      setLang(false);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-600 hover:bg-orange-100 hover:text-orange-700"
                  >
                    English
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      i18n.changeLanguage("hi");
                      setLang(false);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-600 hover:bg-orange-100 hover:text-orange-700"
                  >
                    हिंदी
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* auth actions */}
          {!isLogged ? (
            <Link
              to="/signin"
              onClick={closeAll}
              className="border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-4 py-2 rounded-md transition"
            >
              {t("login")}
            </Link>
          ) : (
            <>
              {!hasListing ? (
                <Link
                  to="/add-business"
                  onClick={closeAll}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition"
                >
                  {t("add_business")}
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  onClick={closeAll}
                  className="text-gray-700 hover:text-orange-600"
                >
                  {t("dashboard.title")}
                </Link>
              )}

              {/* user dropdown */}
              <div className="relative" ref={userR}>
                <button
                  onClick={() => setUserDD(!userDD)}
                  className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-semibold flex
                             items-center justify-center border-2 border-orange-500 hover:bg-orange-200"
                >
                  U
                </button>
                {userDD && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-30">
                    <Link
                      to="/profile"
                      onClick={closeAll}
                      className="block px-4 py-2 text-gray-700 hover:bg-orange-100 hover:text-orange-600"
                    >
                      {t("profile.title")}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-100"
                    >
                      {t("logout")}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* mobile icon */}
        <button
          onClick={() => setMob(!mob)}
          className="md:hidden text-2xl text-gray-700 p-2"
          aria-label="Toggle mobile menu"
        >
          {mob ? "✖" : "☰"}
        </button>
      </div>

      {/* mobile drawer */}
      {mob && (
        <div className="md:hidden bg-white shadow-md py-4 px-6 space-y-4">
          {/* enhanced mobile search */}
          <div className="relative" ref={searchRef}>
            <div className="relative">
              <input
                value={q}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                placeholder={t("search_placeholder")}
                className="w-full pl-4 pr-20 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                autoComplete="off"
              />
              {q && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              )}
              <button
                type="button"
                onClick={performSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-600 p-1"
              >
                <FaSearch className="w-4 h-4" />
              </button>
            </div>
            {renderSuggestions()}
          </div>

          {/* rest of mobile links */}
          <Link
            to="/"
            onClick={closeAll}
            className="block text-gray-700 hover:text-orange-600"
          >
            {t("home")}
          </Link>
          <Link
            to="/about"
            onClick={closeAll}
            className="block text-gray-700 hover:text-orange-600"
          >
            {t("about.heading")}
          </Link>

          {/* categories accordion */}
          <div>
            <button
              onClick={() => setMCat(!mobCats)}
              className="flex justify-between items-center w-full text-gray-700 hover:text-orange-600"
            >
              <span>{t("categories")}</span>
              <span>{mobCats ? "▲" : "▼"}</span>
            </button>
            {mobCats && (
              <ul className="mt-2 pl-4 space-y-1">
                {categoryKeys.map((k) => (
                  <li key={k}>
                    <Link
                      to={`/categories/${slug(k)}`}
                      onClick={closeAll}
                      className="block text-gray-600 hover:text-orange-600"
                    >
                      {t(`category_names.${k}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* language */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              {t("language")}
            </label>
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="w-full border px-3 py-2 rounded-md text-gray-700"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>

          {/* auth actions */}
          {!isLogged ? (
            <Link
              to="/signin"
              onClick={closeAll}
              className="block border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-4 py-2 rounded-md text-center"
            >
              {t("login")}
            </Link>
          ) : (
            <>
              {!hasListing ? (
                <Link
                  to="/add-business"
                  onClick={closeAll}
                  className="block bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-center"
                >
                  {t("add_business")}
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  onClick={closeAll}
                  className="block text-gray-700 hover:text-orange-600 text-center py-2"
                >
                  {t("dashboard.title")}
                </Link>
              )}
              <Link
                to="/profile"
                onClick={closeAll}
                className="block text-gray-700 hover:text-orange-600 text-center py-2"
              >
                {t("profile.title")}
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-md text-center"
              >
                {t("logout")}
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

/* simple debounce */
function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
