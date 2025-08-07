/* src/Pages/AddBusiness.jsx */
import React from "react";
import AddBusinessForm from "./AddBusinessForm/AddBusinessForm";

export default function AddBusinessPage() {
  /* always open the wizard in “add” mode (no pre-fill) */
  return <AddBusinessForm businessData={null} />;
}
