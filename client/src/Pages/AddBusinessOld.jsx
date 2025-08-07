import React, {
  useState,
  useRef,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { api } from "../utils/api";

/* ────────────────────────────────────────────────
   🧩  Small UI atoms
   ──────────────────────────────────────────────── */
const Label = ({ htmlFor, children, required }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
    {children}
    {required && <span className="text-red-500"> *</span>}
  </label>
);

const Input = React.memo(
  ({
    id,
    label,
    type = "text",
    required = false,
    error,
    value,
    onChange,
    inputRef,
    ...rest
  }) => (
    <div className="flex flex-col space-y-1">
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <input
        id={id}
        name={id}
        type={type}
        ref={inputRef}
        value={type === "file" ? undefined : value || ""}
        onChange={onChange}
        required={required}
        accept={type === "file" ? "image/*" : undefined}
        className={`border rounded-xl px-4 py-3 w-full bg-white focus:ring-2 focus:ring-orange-400 focus:outline-none transition ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        aria-invalid={!!error}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  )
);

const Select = React.memo(
  ({ id, label, required = false, error, value, onChange, children }) => (
    <div className="flex flex-col space-y-1">
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <select
        id={id}
        name={id}
        value={value || ""}
        onChange={onChange}
        required={required}
        aria-invalid={!!error}
        className={`border rounded-xl px-4 py-3 w-full bg-white appearance-none focus:ring-2 focus:ring-orange-400 focus:outline-none transition ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        style={{
          backgroundImage:
            'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="%239CA3AF"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>\')',
          backgroundPosition: "right 0.5rem center",
          backgroundSize: "1.5em",
          backgroundRepeat: "no-repeat",
        }}
      >
        {children}
      </select>
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  )
);

const ImagePreview = React.memo(({ file, onRemove }) => {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (file && !src) {
      const reader = new FileReader();
      reader.onloadend = () => setSrc(reader.result);
      reader.readAsDataURL(file);
    }
  }, [file, src]);

  if (!src) return null;
  return (
    <div className="relative w-32 h-32">
      <img
        src={src}
        alt="preview"
        className="object-cover w-full h-full rounded border"
      />
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1"
        >
          ×
        </button>
      )}
    </div>
  );
});

const StepIndicator = ({ step, total }) => (
  <div className="text-center text-sm font-medium text-gray-600 mb-8">
    <div className="mb-2">
      Step {step} of {total}
    </div>
    <div className="w-full bg-gray-200 h-2 rounded-full">
      <div
        className="bg-orange-500 h-2 rounded-full transition-all"
        style={{ width: `${(step / total) * 100}%` }}
      />
    </div>
  </div>
);

/* ────────────────────────────────────────────────
   📋  Static option lists
   ──────────────────────────────────────────────── */
const CATEGORY_OPTIONS = [
  "Civil Contractor",
  "Waterproofing Applicator",
  "Plumber",
  "Carpenter",
  "Painter",
  "Borewell Drilling",
  "Electrician",
  "Solar Panel Installer",
  "Real Estate",
  "Construction Material Suppliers",
  "Cleaning Worker",
  "Furniture Contractor",
];

const EXPERIENCE_OPTIONS = [
  "0-1 year",
  "1-2 years",
  "2-5 years",
  "5-10 years",
  "10+ years",
];

const LOCALITY_OPTIONS = [
  "Rau",
  "Silicon City",
  "Rajendra Nagar",
  "Choithram mandi",
  "Bhawarkua Square",
  "Navlakha Square",
  "Geeta Bhawan",
  "Palasia",
  "LIG Square",
  "Vijay Nagar",
  "Dewas Naka",
  "Mangaliya",
  "Mhow Naka",
  "Chandan Nagar",
  "Hawa Bangla",
  "Bada ganpati",
  "Mari Mata",
  "Kalani Nagar",
  "Gandhi Nagar",
  "Chota Bangarda",
  "Near Aurobindo",
  "MR 10",
  "Tejaji Nagar",
  "Musakhedi",
  "Bangali Square",
  "Khajrana Square",
];

const TOTAL_STEPS = 5;

const REQUIRED_BY_STEP = {
  1: [
    "businessName",
    "category",
    "primaryPhone",
    "experience",
    "shortDesc",
    "fullDesc",
  ],
  2: ["aadhar"],
  3: [],
  4: ["street", "city", "state", "zipCode"],
  5: [
    "openingHourH",
    "openingHourM",
    "openingHourA",
    "closingHourH",
    "closingHourM",
    "closingHourA",
  ],
};

/* ────────────────────────────────────────────────
   🔧 Regex helpers
   ──────────────────────────────────────────────── */
const PHONE_RGX = /^\d{10}$/;
const ZIP_RGX = /^\d{6}$/;
const URL_RGX = /^https?:\/\/.+/i;
const GSTIN_RGX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/* ────────────────────────────────────────────────
   🎯  Main component
   ──────────────────────────────────────────────── */
export default function AddBusinessForm() {
  const { token, ready, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState("");
  const [data, setData] = useState({
    businessName: "",
    category: "",
    primaryPhone: "",
    secondaryPhone: "",
    experience: "",
    shortDesc: "",
    fullDesc: "",
    logo: null,
    banner: null,
    aadhar: null,
    gallery: [],
    websiteUrl: "",
    facebookUrl: "",
    whatsappUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    youtubeUrl: "",
    xUrl: "",
    street: "",
    landmark: "",
    locality: "",
    city: "Indore",
    state: "Madhya Pradesh",
    zipCode: "",
    registrationNumber: "",
    gstin: "",
    openingHourH: "",
    openingHourM: "",
    openingHourA: "AM",
    closingHourH: "",
    closingHourM: "",
    closingHourA: "PM",
  });

  const refs = {
    logo: useRef(),
    banner: useRef(),
    aadhar: useRef(),
    gallery: useRef(),
  };

  /* ─── Utility helpers ─── */
  const to24h = (h, m, a) => {
    if (!h || !m || !a) return "";
    let hh = parseInt(h, 10) % 12;
    if (a === "PM") hh += 12;
    return `${hh.toString().padStart(2, "0")}:${m}`;
  };

  /* ─── Field validation ─── */
  const validateField = useCallback(
    (id, val) => {
      const v = typeof val === "string" ? val.trim() : val;

      if (REQUIRED_BY_STEP[step]?.includes(id) && !v) return "Required";

      if (
        ["primaryPhone", "secondaryPhone"].includes(id) &&
        v &&
        !PHONE_RGX.test(v)
      )
        return "Enter 10-digit phone";

      if (id === "locality" && v && !LOCALITY_OPTIONS.includes(v))
        return "Pick locality";

      if (id === "zipCode" && v && !ZIP_RGX.test(v))
        return "PIN must be 6 digits";

      if (id === "gstin" && v && !GSTIN_RGX.test(v)) return "Invalid GSTIN";

      if (
        [
          "websiteUrl",
          "facebookUrl",
          "instagramUrl",
          "linkedinUrl",
          "youtubeUrl",
          "xUrl",
        ].includes(id) &&
        v &&
        !URL_RGX.test(v)
      )
        return "Invalid URL";

      if (id === "whatsappUrl" && v && !PHONE_RGX.test(v))
        return "Enter 10-digit number";

      if (id === "gallery" && v.length > 12) return "Max 12 images";

      return "";
    },
    [step]
  );

  const validateStep = useCallback(() => {
    const newErr = {};
    let ok = true;
    (REQUIRED_BY_STEP[step] || []).forEach((f) => {
      const e = validateField(f, data[f]);
      if (e) {
        newErr[f] = e;
        ok = false;
      }
    });
    setErrors((prev) => ({ ...prev, ...newErr }));
    return ok;
  }, [step, data, validateField]);

  /* ─── Change handler ─── */
  const onChange = (e) => {
    const { id, type, value, files } = e.target;
    setAlert("");

    // file inputs
    if (type === "file") {
      if (id === "gallery") {
        const imgs = [...data.gallery, ...Array.from(files)].slice(0, 12);
        setData((d) => ({ ...d, gallery: imgs }));
        setErrors((p) => ({ ...p, gallery: validateField("gallery", imgs) }));
      } else {
        setData((d) => ({ ...d, [id]: files[0] }));
        setErrors((p) => ({ ...p, [id]: validateField(id, files[0]) }));
      }
      return;
    }

    // text inputs
    const sanitized = ["primaryPhone", "secondaryPhone", "zipCode"].includes(id)
      ? value.replace(/\D/g, "")
      : id === "gstin"
      ? value.toUpperCase()
      : value;

    setData((d) => ({ ...d, [id]: sanitized }));
    setErrors((p) => ({ ...p, [id]: validateField(id, sanitized) }));
  };

  /* ─── Gallery remove helper ─── */
  const removeGallery = (idx) =>
    setData((d) => ({ ...d, gallery: d.gallery.filter((_, i) => i !== idx) }));

  /* ─── Navigation buttons ─── */
  const next = () => {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  /* ─── Submit ─── */
  const submit = async (e) => {
    e.preventDefault();
    if (!validateStep()) {
      setAlert("Fix errors first");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      const body = {
        ...data,
        openingHour: to24h(
          data.openingHourH,
          data.openingHourM,
          data.openingHourA
        ),
        closingHour: to24h(
          data.closingHourH,
          data.closingHourM,
          data.closingHourA
        ),
      };
      if (/^\d{10}$/.test(body.whatsappUrl))
        body.whatsappUrl = `https://wa.me/91${body.whatsappUrl}`;

      Object.entries(body).forEach(([k, v]) => {
        if (
          [
            "gallery",
            "openingHourH",
            "openingHourM",
            "openingHourA",
            "closingHourH",
            "closingHourM",
            "closingHourA",
          ].includes(k)
        )
          return;
        if (v !== undefined && v !== null && v !== "") fd.append(k, v);
      });
      body.gallery.forEach((f) => fd.append("gallery", f));

      const res = await api.post("/business", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data?.token) login(res.data.token);

      alert("Business successfully added!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setAlert(err.response?.data?.message || "Something went wrong");
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  /* ─── Auth gates ─── */
  if (!ready) return null;
  if (!token)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-xl font-semibold mb-2">
            Authentication required
          </h2>
          <p>Please sign in to add a business.</p>
        </div>
      </div>
    );

  /* ─── Step-specific content renderer ─── */
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <Input
              id="businessName"
              label="Business Name"
              required
              value={data.businessName}
              onChange={onChange}
              error={errors.businessName}
            />
            <Select
              id="category"
              label="Category"
              required
              value={data.category}
              onChange={onChange}
              error={errors.category}
            >
              <option value="">Select Category</option>
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
            <Input
              id="primaryPhone"
              label="Primary Phone"
              required
              value={data.primaryPhone}
              onChange={onChange}
              error={errors.primaryPhone}
            />
            <Input
              id="secondaryPhone"
              label="Secondary Phone"
              value={data.secondaryPhone}
              onChange={onChange}
              error={errors.secondaryPhone}
            />
            <Select
              id="experience"
              label="Experience"
              required
              value={data.experience}
              onChange={onChange}
              error={errors.experience}
            >
              <option value="">Select Experience</option>
              {EXPERIENCE_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
            <Input
              id="shortDesc"
              label="Short Description"
              required
              value={data.shortDesc}
              onChange={onChange}
              error={errors.shortDesc}
            />
            <div className="md:col-span-2">
              <Input
                id="fullDesc"
                label="Full Description"
                required
                value={data.fullDesc}
                onChange={onChange}
                error={errors.fullDesc}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid gap-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Logo */}
              <div>
                <Input
                  id="logo"
                  label="Logo"
                  type="file"
                  inputRef={refs.logo}
                  onChange={onChange}
                  error={errors.logo}
                />
                {data.logo && (
                  <ImagePreview
                    file={data.logo}
                    onRemove={() => {
                      refs.logo.current.value = "";
                      setData((d) => ({ ...d, logo: null }));
                    }}
                  />
                )}
              </div>
              {/* Banner */}
              <div>
                <Input
                  id="banner"
                  label="Banner"
                  type="file"
                  inputRef={refs.banner}
                  onChange={onChange}
                  error={errors.banner}
                />
                {data.banner && (
                  <ImagePreview
                    file={data.banner}
                    onRemove={() => {
                      refs.banner.current.value = "";
                      setData((d) => ({ ...d, banner: null }));
                    }}
                  />
                )}
              </div>
              {/* Aadhar */}
              <div>
                <Input
                  id="aadhar"
                  label="Aadhar"
                  type="file"
                  required
                  inputRef={refs.aadhar}
                  onChange={onChange}
                  error={errors.aadhar}
                />
                {data.aadhar && (
                  <ImagePreview
                    file={data.aadhar}
                    onRemove={() => {
                      refs.aadhar.current.value = "";
                      setData((d) => ({ ...d, aadhar: null }));
                    }}
                  />
                )}
              </div>
            </div>

            {/* Gallery */}
            <div>
              <Input
                id="gallery"
                label="Gallery (max 12, ≤5 MB each)"
                type="file"
                multiple
                inputRef={refs.gallery}
                onChange={onChange}
                error={errors.gallery}
              />
              <div className="flex flex-wrap gap-3 mt-3">
                {data.gallery.map((img, i) => (
                  <ImagePreview
                    key={i}
                    file={img}
                    onRemove={() => removeGallery(i)}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <Input
              id="websiteUrl"
              label="Website"
              value={data.websiteUrl}
              onChange={onChange}
              error={errors.websiteUrl}
            />
            <Input
              id="facebookUrl"
              label="Facebook"
              value={data.facebookUrl}
              onChange={onChange}
              error={errors.facebookUrl}
            />
            <Input
              id="whatsappUrl"
              label="WhatsApp (10-digit)"
              value={data.whatsappUrl}
              onChange={onChange}
              error={errors.whatsappUrl}
            />
            <Input
              id="instagramUrl"
              label="Instagram"
              value={data.instagramUrl}
              onChange={onChange}
              error={errors.instagramUrl}
            />
            <Input
              id="linkedinUrl"
              label="LinkedIn"
              value={data.linkedinUrl}
              onChange={onChange}
              error={errors.linkedinUrl}
            />
            <Input
              id="youtubeUrl"
              label="YouTube"
              value={data.youtubeUrl}
              onChange={onChange}
              error={errors.youtubeUrl}
            />
            <Input
              id="xUrl"
              label="X (Twitter)"
              value={data.xUrl}
              onChange={onChange}
              error={errors.xUrl}
            />
          </div>
        );

      case 4:
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <Input
              id="street"
              label="Street"
              required
              value={data.street}
              onChange={onChange}
              error={errors.street}
            />
            <Input
              id="landmark"
              label="Landmark"
              value={data.landmark}
              onChange={onChange}
              error={errors.landmark}
            />
            <Select
              id="locality"
              label="Locality / Area"
              value={data.locality}
              onChange={onChange}
              error={errors.locality}
            >
              <option value="">Select Locality</option>
              {LOCALITY_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
            <Input
              id="city"
              label="City"
              required
              value={data.city}
              onChange={onChange}
              error={errors.city}
            />
            <Input
              id="state"
              label="State"
              required
              value={data.state}
              onChange={onChange}
              error={errors.state}
            />
            <Input
              id="zipCode"
              label="PIN Code"
              required
              value={data.zipCode}
              onChange={onChange}
              error={errors.zipCode}
            />
          </div>
        );

      case 5:
        const timeSelect = (base, opts, val) => (
          <select
            id={base}
            value={val || ""}
            onChange={onChange}
            required
            className="border rounded-xl px-3 py-2 w-1/3 focus:ring-2 focus:ring-orange-400"
          >
            <option value="">
              {base === "openingHourA" || base === "closingHourA"
                ? "AM/PM"
                : base.endsWith("H")
                ? "HH"
                : "MM"}
            </option>
            {opts.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        );

        return (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Opening */}
            <div className="flex flex-col space-y-1">
              <Label htmlFor="openingHourH" required>
                Opening Time
              </Label>
              <div className="flex gap-2">
                {timeSelect(
                  "openingHourH",
                  [...Array(12).keys()].map((i) =>
                    String(i + 1).padStart(2, "0")
                  ),
                  data.openingHourH
                )}
                {timeSelect(
                  "openingHourM",
                  ["00", "15", "30", "45"],
                  data.openingHourM
                )}
                {timeSelect("openingHourA", ["AM", "PM"], data.openingHourA)}
              </div>
            </div>
            {/* Closing */}
            <div className="flex flex-col space-y-1">
              <Label htmlFor="closingHourH" required>
                Closing Time
              </Label>
              <div className="flex gap-2">
                {timeSelect(
                  "closingHourH",
                  [...Array(12).keys()].map((i) =>
                    String(i + 1).padStart(2, "0")
                  ),
                  data.closingHourH
                )}
                {timeSelect(
                  "closingHourM",
                  ["00", "15", "30", "45"],
                  data.closingHourM
                )}
                {timeSelect("closingHourA", ["AM", "PM"], data.closingHourA)}
              </div>
            </div>
            <Input
              id="registrationNumber"
              label="Registration No."
              value={data.registrationNumber}
              onChange={onChange}
              error={errors.registrationNumber}
            />
            <Input
              id="gstin"
              label="GSTIN"
              value={data.gstin}
              onChange={onChange}
              error={errors.gstin}
            />
          </div>
        );

      default:
        return <p className="text-red-600">Invalid step</p>;
    }
  };

  /* ─── JSX ─── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-12 px-4">
      <form
        onSubmit={submit}
        encType="multipart/form-data"
        className="w-full max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-orange-100"
      >
        {alert && (
          <div role="alert" className="text-center text-red-600 mb-4">
            {alert}
          </div>
        )}
        <StepIndicator step={step} total={TOTAL_STEPS} />
        {renderStep()}
        <div className="flex flex-col sm:flex-row justify-between mt-10 border-t pt-6 gap-4">
          <button
            type="button"
            onClick={prev}
            disabled={step === 1}
            className="w-full sm:w-auto px-6 py-2 border border-gray-400 rounded-xl text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type={step === TOTAL_STEPS ? "submit" : "button"}
            onClick={step !== TOTAL_STEPS ? next : undefined}
            disabled={busy}
            className={`w-full sm:w-auto px-6 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition ${
              busy ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {busy ? "Submitting..." : step === TOTAL_STEPS ? "Submit" : "Next"}
          </button>
        </div>
      </form>
    </div>
  );
}
