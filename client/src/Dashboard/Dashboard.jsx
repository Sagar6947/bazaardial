import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { api } from "../utils/api";
import {
  HeroHeader,
  InfoSections,
  MediaGallery,
  StatsCard,
  QuickActions,
  EmptyState,
} from "./components";

export default function Dashboard() {
  const { role, ready, login } = useContext(AuthContext); // ← added login
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ── fetch owner’s listing once role is available ── */
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await api.get("/business/me");
        setBusiness(res.data);
        console.log("Business data loaded:", res.data);
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error("Failed to load business data:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (role === "owner") fetchBusiness();
  }, [role]);

  /* ─────────────── Loading / Empty ─────────────── */
  if (!ready || loading)
    return (
      <EmptyState
        title="Loading…"
        subtitle="Fetching your business details, please wait."
        spinner
      />
    );

  /* ─────────────── Handlers ─────────────── */
  const handleEdit = () => {
    console.log("EDIT-BTN object:", business); // ← should print full object
    navigate("/edit-business", { state: { business } });
  };

  const handleDelete = async () => {
    if (!business?._id) return;
    if (!window.confirm("Delete your listing permanently?")) return;

    try {
      const res = await api.delete(`/business/${business._id}`);
      console.log("Delete response:", res.data);

      const { token } = res.data;
      if (token) {
        console.log("Updating context with new token...");
        login(token); // Refresh role: "user", businessId: null
      }

      alert("Business deleted.");

      // Wait a moment for context to refresh before navigating
      setTimeout(() => {
        navigate("/");
      }, 300);
    } catch (err) {
      alert("Error deleting business.");
      console.error("Delete failed:", err);
    }
  };

  /* ─────────────── UI ─────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
      {/* floating blobs remain in main file for ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-bl*end-multiply filter blur-xl opacity-20 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000" />
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000" />
      </div>

      <div className="relative max-w-7xl mx-auto p-6 space-y-12">
        <HeroHeader business={business} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <InfoSections business={business} />
          </div>

          <div className="space-y-6">
            <StatsCard />
            <QuickActions onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        </div>

        <MediaGallery business={business} />
      </div>
    </div>
  );
}
