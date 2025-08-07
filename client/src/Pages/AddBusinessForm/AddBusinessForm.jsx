/* src/components/AddBusinessForm/AddBusinessForm.jsx */
import React from "react";
import { StepIndicator } from "./ui/FormAtoms";
import useBusinessForm from "./hooks/useBusinessForm";

/* lazy-load each step to keep bundle size down */
import Step1 from "./steps/Step1General";
import Step2 from "./steps/Step2Images";
import Step3 from "./steps/Step3Social";
import Step4 from "./steps/Step4Address";
import Step5 from "./steps/Step5Timing";

const STEP_COMPONENTS = [Step1, Step2, Step3, Step4, Step5];

/**
 * Wizard for adding **or** editing a business.
 * If `businessData` is supplied (Edit page) the hook switches to edit-mode.
 */
export default function AddBusinessForm({ businessData = null }) {
  /* key: pass the object (or null) to the hook */
  const form = useBusinessForm(businessData);
  const Step = STEP_COMPONENTS[form.step - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-12 px-4">
      <form
        encType="multipart/form-data"
        onSubmit={form.submit}
        className="w-full max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-orange-100"
      >
        {form.alert && (
          <div className="text-center text-red-600 mb-4" role="alert">
            {form.alert}
          </div>
        )}

        <StepIndicator step={form.step} total={form.TOTAL_STEPS} />

        {/* All helpers + flags (isEditMode, onChange, refs, …) */}
        <Step {...form} />

        <div className="flex flex-col sm:flex-row justify-between mt-10 border-t pt-6 gap-4">
          <button
            type="button"
            onClick={form.prev}
            disabled={form.step === 1}
            className="w-full sm:w-auto px-6 py-2 border rounded-xl text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Previous
          </button>

          <button
            type={form.step === form.TOTAL_STEPS ? "submit" : "button"}
            onClick={
              form.step === form.TOTAL_STEPS ? (e) => form.submit(e) : form.next
            }
            disabled={form.busy}
            className={`w-full sm:w-auto px-6 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition ${
              form.busy ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {form.busy
              ? "Submitting..."
              : form.step === form.TOTAL_STEPS
              ? "Submit"
              : "Next"}
          </button>
        </div>
      </form>
    </div>
  );
}
