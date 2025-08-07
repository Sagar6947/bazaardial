import { useState, useRef, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../utils/api";
import { AuthContext } from "../../../context/AuthContext";

/* ── static option lists ─────────────────────────────────────────── */
export const CATEGORY_OPTIONS = [
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
export const EXPERIENCE_OPTIONS = [
  "0-1 year",
  "1-2 years",
  "2-5 years",
  "5-10 years",
  "10+ years",
];
export const LOCALITY_OPTIONS = [
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

/* ── constants ───────────────────────────────────────────────────── */
const TOTAL_STEPS = 5;
const PHONE_RGX = /^\d{10}$/;
const ZIP_RGX = /^\d{6}$/;
const URL_RGX = /^https?:\/\/.+/i;
const GSTIN_RGX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

/* required fields when **creating** */
const REQUIRED_BY_STEP_ADD = {
  1: [
    "businessName",
    "category",
    "primaryPhone",
    "experience",
    "shortDesc",
    "fullDesc",
  ],
  2: ["aadhar"],
  3: ["whatsappUrl"],
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

/* ── blank model ────────────────────────────────────────────────── */
const INITIAL_DATA = {
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
};

/* helper: "14:30" → ["02","30","PM"] */
const from24h = (t = "") => {
  const [hh = "", mm = ""] = t.split(":");
  if (!hh) return ["", "", "AM"];
  const h = parseInt(hh, 10);
  const A = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return [String(h12).padStart(2, "0"), mm, A];
};

/* helper: format file size for display */
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/* ──────────────────────────────────────────────────────────────── */
// Key for localStorage
const STORAGE_KEY = "addBusinessFormData";

function filterPersistable(data) {
  // Exclude File objects (logo, banner, aadhar, gallery)
  const { logo, banner, aadhar, gallery, ...rest } = data;
  return {
    ...rest,
    gallery: Array.isArray(gallery)
      ? gallery.filter((f) => !(f instanceof File))
      : [],
  };
}

function loadPersistedData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function useBusinessForm(businessData = null) {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  /* mode & required-map */
  const isEditMode = !!businessData?._id;
  const REQUIRED = isEditMode
    ? { ...REQUIRED_BY_STEP_ADD, 2: [] } // Aadhaar not mandatory while editing
    : REQUIRED_BY_STEP_ADD;

  /* initial data (prefill in edit-mode) */
  const [data, setData] = useState(() => {
    if (!businessData?._id) {
      const persisted = loadPersistedData();
      if (persisted && typeof persisted === "object") {
        return { ...INITIAL_DATA, ...persisted.data };
      }
    }
    if (!isEditMode) return INITIAL_DATA;
    const [oH, oM, oA] = from24h(businessData.openingHour);
    const [cH, cM, cA] = from24h(businessData.closingHour);
    return {
      ...INITIAL_DATA,
      ...businessData,
      openingHourH: oH,
      openingHourM: oM,
      openingHourA: oA,
      closingHourH: cH,
      closingHourM: cM,
      closingHourA: cA,
      gallery: businessData.galleryUrls || [],
    };
  });

  /* ui state */
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(() => {
    if (!businessData?._id) {
      const persisted = loadPersistedData();
      if (persisted && typeof persisted === "object" && persisted.step) {
        return persisted.step;
      }
    }
    return 1;
  });

  /* refs for hidden inputs */
  const refs = {
    logo: useRef(),
    banner: useRef(),
    aadhar: useRef(),
    gallery: useRef(),
  };

  /* helpers */
  const to24h = (h, m, a) => {
    if (!h || !m || !a) return "";
    let hh = parseInt(h, 10) % 12;
    if (a === "PM") hh += 12;
    return `${hh.toString().padStart(2, "0")}:${m}`;
  };

  /* validation --------------------------------------------------- */
  const validateField = useCallback(
    (id, val) => {
      const v = typeof val === "string" ? val.trim() : val;

      if (REQUIRED[step]?.includes(id) && !v) return "Required";

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

      if (id === "whatsappUrl") {
        if (REQUIRED[step]?.includes(id) && !v) return "Required";
        if (v && !PHONE_RGX.test(v)) return "Enter 10-digit number";
        // Always validate format if value exists, regardless of step
        if (v && v.trim() !== "" && !PHONE_RGX.test(v)) return "Enter 10-digit number";
      }

      // File size validation for single files
      if (
        ["logo", "banner", "aadhar"].includes(id) &&
        v &&
        v.size > MAX_FILE_SIZE
      ) {
        return `File size must be under 5MB (current: ${formatFileSize(
          v.size
        )})`;
      }

      // Gallery validation
      if (id === "gallery") {
        if (v.length > 12) return "Max 12 images";

        // Check each file in gallery for size
        const oversizedFiles = v.filter(
          (file) => file instanceof File && file.size > MAX_FILE_SIZE
        );
        if (oversizedFiles.length > 0) {
          const oversizedFile = oversizedFiles[0];
          return `Image "${oversizedFile.name}" is too large (${formatFileSize(
            oversizedFile.size
          )}). Max size is 5MB.`;
        }
      }

      return "";
    },
    [step, REQUIRED]
  );

  const validateStep = useCallback(() => {
    const errs = {};
    let ok = true;
    (REQUIRED[step] || []).forEach((f) => {
      const e = validateField(f, data[f]);
      if (e) {
        errs[f] = e;
        ok = false;
      }
    });
    setErrors((p) => ({ ...p, ...errs }));
    return ok;
  }, [step, data, validateField, REQUIRED]);

  const validateAllFields = useCallback(() => {
    const errs = {};
    let ok = true;
    
    // Validate all required fields across all steps
    Object.values(REQUIRED).flat().forEach((field) => {
      const e = validateField(field, data[field]);
      if (e) {
        errs[field] = e;
        ok = false;
      }
    });
    
    // Additional validation for time fields
    const openingTime = to24h(data.openingHourH, data.openingHourM, data.openingHourA);
    const closingTime = to24h(data.closingHourH, data.closingHourM, data.closingHourA);
    
    if (!openingTime) {
      errs.openingHourH = "Opening time is required";
      ok = false;
    }
    
    if (!closingTime) {
      errs.closingHourH = "Closing time is required";
      ok = false;
    }
    
    // Validate required files
    if (!data.aadhar) {
      errs.aadhar = "Aadhaar/ID proof is required";
      ok = false;
    }
    
    setErrors((p) => ({ ...p, ...errs }));
    return ok;
  }, [data, validateField, REQUIRED]);

  const validateFormData = useCallback(() => {
    const requiredFields = [
      "businessName", "category", "primaryPhone", "experience", 
      "shortDesc", "fullDesc", "street", "city", "state", "zipCode", 
      "whatsappUrl"
    ];
    
    const missingFields = requiredFields.filter(field => {
      const value = data[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });
    
    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      return { valid: false, missing: missingFields };
    }
    
    // Check time fields
    const openingTime = to24h(data.openingHourH, data.openingHourM, data.openingHourA);
    const closingTime = to24h(data.closingHourH, data.closingHourM, data.closingHourA);
    
    if (!openingTime || !closingTime) {
      console.error("Invalid time format");
      return { valid: false, missing: ["openingHour", "closingHour"] };
    }
    
    // Check required files
    if (!data.aadhar) {
      console.error("Missing required file: aadhar");
      return { valid: false, missing: ["aadhar"] };
    }
    
    return { valid: true };
  }, [data]);

  /* change handlers -------------------------------------------- */
 /* change handlers -------------------------------------------- */
const onChange = (e) => {
  const { id, type, value, files } = e.target;
  setAlert("");
  
  console.log('onChange called:', { id, type, value, filesCount: files?.length });

  if (type === "file") {
    
    if (id === "gallery") {
      const newFiles = Array.from(files);

      // Check each new file for size before adding
      const oversizedFile = newFiles.find(
        (file) => file.size > MAX_FILE_SIZE
      );
      if (oversizedFile) {
        const errorMessage = `Image "${oversizedFile.name}" is too large (${formatFileSize(oversizedFile.size)}). Max size is 5MB.`;
        console.log('Gallery file size validation failed:', errorMessage);
        setErrors((p) => ({
          ...p,
          gallery: errorMessage,
        }));
        // Reset the file input
        e.target.value = "";
        return;
      }

      const imgs = [...data.gallery, ...newFiles].slice(0, 12);
      setDataAndPersist((d) => ({ ...d, gallery: imgs }));
      // Clear any previous gallery errors if validation passes
      setErrors((p) => ({ ...p, gallery: "" }));
    } else {
      const file = files[0];
      console.log('Processing single file:', { id, fileName: file?.name, fileSize: file?.size, fileType: file?.type });

      // Always check file size first, before any other processing
      if (file && file.size > MAX_FILE_SIZE) {
        console.log('Single file size validation failed:', {
          fileSize: file.size,
          maxSize: MAX_FILE_SIZE,
          formattedSize: formatFileSize(file.size)
        });
        const errorMessage = `File size must be under 5MB (current: ${formatFileSize(file.size)})`;
        console.log('Setting error for', id, ':', errorMessage);
        
        // Set the error immediately
        setErrors((p) => ({
          ...p,
          [id]: errorMessage,
        }));
        
        // Reset the file input to prevent the oversized file from being stored
        e.target.value = "";
        
        // Don't proceed with setting the file data
        return;
      }

      // File size is acceptable, proceed with setting the file
      console.log('File size validation passed for:', id);
      setDataAndPersist((d) => {
        console.log('Setting file data for:', id, file);
        return { ...d, [id]: file };
      });
      
      // Clear any previous error for this field since validation passed
      setErrors((p) => ({ ...p, [id]: "" }));
    }
    return;
  }

  // Handle non-file inputs
  const sanitized = ["primaryPhone", "secondaryPhone", "whatsappUrl", "zipCode"].includes(id)
    ? value.replace(/\D/g, "")
    : id === "gstin"
    ? value.toUpperCase()
    : value;

  setDataAndPersist((d) => ({ ...d, [id]: sanitized }));
  setErrors((p) => ({ ...p, [id]: validateField(id, sanitized) }));
};

  const removeGallery = (file) =>
    setDataAndPersist((d) => ({ ...d, gallery: d.gallery.filter((f) => f !== file) }));

  /* wizard nav */
  const next = () => {
    if (validateStep()) {
      setStepAndPersist((s) => Math.min(s + 1, TOTAL_STEPS));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const prev = () => setStepAndPersist((s) => Math.max(s - 1, 1));

  /* submit ------------------------------------------------------- */
  const submit = async (e) => {
    e.preventDefault();
    
    // Comprehensive validation before submission
    if (!validateAllFields()) {
      setAlert("Please fix all validation errors before submitting");
      return;
    }

    // Additional pre-submission checks using the new validation function
    const formValidation = validateFormData();
    if (!formValidation.valid) {
      setAlert(`Missing required fields: ${formValidation.missing.join(", ")}`);
      return;
    }

    setBusy(true);
    try {
      const fd = new FormData();

      // Convert time pickers to 24h format
      const openingHour = to24h(data.openingHourH, data.openingHourM, data.openingHourA);
      const closingHour = to24h(data.closingHourH, data.closingHourM, data.closingHourA);
      
      if (!openingHour || !closingHour) {
        throw new Error("Invalid time format");
      }

      const body = {
        ...data,
        openingHour,
        closingHour,
      };

      // Debug: Log the data being sent
      console.log("Submitting form data:", {
        businessName: body.businessName,
        category: body.category,
        primaryPhone: body.primaryPhone,
        whatsappUrl: body.whatsappUrl,
        openingHour: body.openingHour,
        closingHour: body.closingHour,
        hasLogo: !!data.logo,
        hasBanner: !!data.banner,
        hasAadhar: !!data.aadhar,
        galleryCount: data.gallery?.length || 0
      });

      // Define keys to skip when appending to FormData
      const FILE_KEYS = new Set(["logo", "banner", "aadhar", "gallery"]);
      const TEMP_KEYS = new Set([
        "openingHourH", "openingHourM", "openingHourA",
        "closingHourH", "closingHourM", "closingHourA",
      ]);

      // Add scalar fields to FormData
      Object.entries(body).forEach(([k, v]) => {
        if (FILE_KEYS.has(k) || TEMP_KEYS.has(k)) return;
        if (v !== undefined && v !== null && v !== "") {
          fd.append(k, v);
        }
      });

      // Add file fields to FormData with validation
      const maybeFile = (key, file) => {
        if (file instanceof File) {
          console.log(`Adding file: ${key}`, file.name, file.size);
          fd.append(key, file);
        } else {
          console.log(`No file for: ${key}`);
        }
      };

      maybeFile("logo", data.logo);
      maybeFile("banner", data.banner);
      maybeFile("aadhar", data.aadhar);

      // Add gallery files (filter out non-File objects)
      if (Array.isArray(data.gallery)) {
        const galleryFiles = data.gallery.filter((file) => file instanceof File);
        console.log(`Adding ${galleryFiles.length} gallery files`);
        galleryFiles.forEach((file) => fd.append("gallery", file));
      }

      // API call with proper error handling
      console.log("Sending request to server...");
      const res = isEditMode
        ? await api.put(`/business/${businessData._id}`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          })
        : await api.post("/business", fd, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          });

      console.log("Server response:", res.data);

      // Handle token refresh
      const newToken = res.data?.token || res.data?.accessToken;
      if (newToken) {
        try {
          login(newToken);
        } catch (loginError) {
          console.warn("Token refresh failed:", loginError);
          // Don't fail the entire operation for token refresh issues
        }
      }

      // Success message and navigation
      const successMessage = isEditMode
        ? "Business updated successfully!"
        : "Business successfully added!";
      window.alert(successMessage);

      // Navigate after a short delay to ensure state updates complete
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);
      clearPersisted(); // Clear persisted data on successful submit
    } catch (err) {
      console.error("Submit error:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        request: err.request
      });

      // More detailed error handling
      let errorMessage = "Something went wrong";

      if (err.response) {
        // Server responded with error status
        const serverMessage = err.response.data?.message;
        if (serverMessage) {
          errorMessage = serverMessage;
        } else if (err.response.status === 400) {
          errorMessage = "Invalid data submitted. Please check all required fields.";
        } else if (err.response.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else if (err.response.status === 409) {
          errorMessage = "Business with this phone number already exists.";
        } else {
          errorMessage = `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = "Network error. Please check your connection and try again.";
      } else {
        // Something else happened
        errorMessage = err.message || "An unexpected error occurred";
      }

      setAlert(errorMessage);
    } finally {
      setBusy(false);
    }
  };

  /* exposed API -------------------------------------------------- */
  const persist = (newData, newStep = step) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ data: filterPersistable(newData), step: newStep })
      );
    } catch {}
  };

  // Patch setData to persist
  const setDataAndPersist = (updater) => {
    setData((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      persist(next);
      return next;
    });
  };

  // Patch setStep to persist
  const setStepAndPersist = (updater) => {
    setStep((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      persist(data, next);
      return next;
    });
  };

  // Clear persisted data on successful submit
  const clearPersisted = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return {
    data,
    errors,
    alert,
    busy,
    step,
    TOTAL_STEPS,
    refs,
    isEditMode,
    onChange,
    removeGallery,
    next,
    prev,
    submit,
    validateFormData,
  };
}
