// src/Pages/Dashboard/components/StatsCard.jsx
import React from "react";

export default function StatsCard() {
  return (
    <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-6 rounded-3xl shadow-2xl text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <span className="text-lg">📊</span>
        </div>
        <h3 className="text-lg font-bold">Quick Stats</h3>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm opacity-90">Status</span>
          <span className="font-bold">Active</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm opacity-90">Visibility</span>
          <span className="font-bold">Public</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm opacity-90">Last Updated</span>
          <span className="font-bold">Recent</span>
        </div>
      </div>
    </div>
  );
}
