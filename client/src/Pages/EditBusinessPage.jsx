import React, { useLocation, Navigate } from "react-router-dom";
import AddBusinessForm from "./AddBusinessForm/AddBusinessForm"; // adjust path if different

export default function EditBusinessPage() {
  const businessData = useLocation().state?.business;

  // Dev-check: should NOT be undefined
  console.log("WRAPPER businessData:", businessData);

  // Safety: if user refreshes without state, bounce back
  if (!businessData) return <Navigate to="/dashboard" replace />;
  return <AddBusinessForm businessData={businessData} />;
}
