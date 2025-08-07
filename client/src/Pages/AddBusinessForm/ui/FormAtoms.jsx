import React, { useState, useEffect, useRef } from "react";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

/* Image Cropper Component */
const ImageCropper = React.memo(({ 
  imageSrc, 
  onCropComplete, 
  onCancel 
}) => {
  const [crop, setCrop] = useState({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [imageRef, setImageRef] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  };

  const handleCropComplete = async () => {
    if (imageRef && crop.width && crop.height) {
      setIsLoading(true);
      try {
        const croppedImageBlob = await getCroppedImg(imageRef, crop);
        onCropComplete(croppedImageBlob);
      } catch (error) {
        console.error('Error cropping image:', error);
        onCropComplete(null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Crop Image</h3>
          <p className="text-sm text-gray-600 mt-1">
            Drag the corners to resize or move the crop area. Tap and drag to adjust.
          </p>
        </div>
        
        <div className="p-4">
          <div className="relative max-h-96 overflow-hidden rounded-lg">
            <ReactCrop
              crop={crop}
              onChange={c => setCrop(c)}
              aspect={undefined}
              minWidth={50}
              minHeight={50}
              keepSelection={true}
              ruleOfThirds={true}
            >
              <img
                ref={setImageRef}
                src={imageSrc}
                alt="Crop preview"
                className="max-w-full max-h-80 object-contain"
                onLoad={(e) => {
                  // Set initial crop to center of image
                  const { width, height } = e.target;
                  const size = Math.min(width, height) * 0.8;
                  const x = (width - size) / 2;
                  const y = (height - size) / 2;
                  setCrop({
                    unit: 'px',
                    width: size,
                    height: size,
                    x: x,
                    y: y
                  });
                }}
              />
            </ReactCrop>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCropComplete}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              'Apply Crop'
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

/* Label with optional "*" */
export const Label = ({ htmlFor, children, required }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
    {children}
    {required && <span className="text-red-500"> *</span>}
  </label>
);

/* Mobile Image Input with camera/gallery options and cropping */
/* Mobile Image Input with camera/gallery options and cropping */
const MobileImageInput = React.memo(({ 
  id, 
  label, 
  required = false, 
  error, 
  onChange, 
  inputRef, 
  multiple = false,
  allowCamera = true,
  ...rest 
}) => {
  console.log('MobileImageInput received props:', { id, error, allowCamera });
  const [isMobile, setIsMobile] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [isFromCamera, setIsFromCamera] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      // More comprehensive mobile detection
      const isMobileDevice = window.innerWidth <= 768 || 
                           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showOptions]);

  const handleOptionClick = (capture = false) => {
    setShowOptions(false);
    setIsFromCamera(capture);
    
    // Update the actual file input with the appropriate attributes
    if (inputRef.current) {
      const input = inputRef.current;
      input.accept = 'image/*';
      input.multiple = multiple;
      
      if (capture && allowCamera) {
        input.capture = 'environment';
      } else {
        input.removeAttribute('capture');
      }
      
      // Trigger the file input
      input.click();
    } else {
      console.error('Mobile: inputRef.current is null for', id);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    console.log('handleFileChange called:', { 
      isFromCamera, 
      isMobile, 
      fileName: file?.name, 
      fileSize: file?.size 
    });
    
    if (!file) return;

    // Check file size BEFORE showing cropper
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    const formatFileSize = (bytes) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    console.log('Original file size check:', {
      fileSize: file.size,
      maxSize: MAX_FILE_SIZE,
      isOversized: file.size > MAX_FILE_SIZE,
      formattedSize: formatFileSize(file.size)
    });

    // If original file is already oversized, don't even show cropper
    if (file.size > MAX_FILE_SIZE) {
      console.log('Original file too large, showing error immediately');
      // Pass the oversized file to onChange to trigger validation
      onChange(event);
      // Reset the file input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      return;
    }

    // If it's from camera and on mobile, show cropper
    if (isFromCamera && isMobile) {
      console.log('Showing cropper for camera capture');
      const reader = new FileReader();
      reader.onload = (e) => {
        setCropImageSrc(e.target.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    } else {
      // For gallery or desktop, use normal onChange
      console.log('Using normal onChange for gallery/desktop');
      onChange(event);
    }
    
    // Reset the file input for next use
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleCropComplete = (croppedBlob) => {
    setShowCropper(false);
    setCropImageSrc(null);
    
    if (!croppedBlob) {
      console.log('No cropped blob received');
      return;
    }

    // Create a new file from the cropped blob
    const croppedFile = new File([croppedBlob], `cropped-${id}-${Date.now()}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });
    
    console.log('Cropped file created:', {
      name: croppedFile.name,
      size: croppedFile.size,
      type: croppedFile.type,
      isFile: croppedFile instanceof File,
      isBlob: croppedFile instanceof Blob
    });
    
    // Check file size after cropping
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    const formatFileSize = (bytes) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };
    
    console.log('Cropped file size check:', {
      fileSize: croppedFile.size,
      maxSize: MAX_FILE_SIZE,
      isOversized: croppedFile.size > MAX_FILE_SIZE,
      formattedSize: formatFileSize(croppedFile.size)
    });
    
    // Create a synthetic event to pass to onChange
    const syntheticEvent = {
      target: {
        id: id,
        files: [croppedFile],
        name: id,
        type: 'file'
      }
    };
    
    console.log('Synthetic event created for cropped file:', syntheticEvent);
    
    // Always pass the file to onChange - let the validation logic handle size checking
    // This ensures the error state is properly updated in the parent component
    onChange(syntheticEvent);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setCropImageSrc(null);
    // Clear the file input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  if (!isMobile) {
    // Desktop: Show regular file input
    return (
      <div className="flex flex-col space-y-1">
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
        <input
          id={id}
          name={id}
          type="file"
          ref={inputRef}
          onChange={onChange}
          required={required}
          accept="image/*"
          multiple={multiple}
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
    );
  }

  // Mobile: Show custom upload button with options
  return (
    <>
      <div className="flex flex-col space-y-1">
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
        
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className={`w-full border rounded-xl px-4 py-3 bg-white text-left focus:ring-2 focus:ring-orange-400 focus:outline-none transition flex items-center justify-between ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          >
            <span className="text-gray-600">📷 Choose image...</span>
            <span className="text-gray-400">▼</span>
          </button>
          
          {showOptions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-10 overflow-hidden">
              {allowCamera && (
                <button
                  type="button"
                  onClick={() => handleOptionClick(true)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-200 transition-colors"
                >
                  📸 Capture from Camera
                </button>
              )}
              <button
                type="button"
                onClick={() => handleOptionClick(false)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                🖼️ Choose from Gallery
              </button>
            </div>
          )}
        </div>
        
        {console.log('MobileImageInput rendering error for', id, ':', error)}
        {error && (
          <p id={`${id}-error`} className="text-sm text-red-500">
            {error}
          </p>
        )}
        
        {/* Hidden input that will be triggered by the mobile options */}
        <input
          id={id}
          name={id}
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          required={required}
          accept="image/*"
          multiple={multiple}
          className="hidden"
          {...rest}
        />
      </div>

      {/* Image Cropper Modal */}
      {showCropper && cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
});

/* Text / file input */
export const Input = React.memo(
  ({
    id,
    label,
    type = "text",
    required = false,
    error,
    value,
    onChange,
    inputRef,
    multiple = false,
    allowCamera = true,
    ...rest
  }) => {
    // Use MobileImageInput for file inputs on mobile
    if (type === "file") {
      return (
        <MobileImageInput
          id={id}
          label={label}
          required={required}
          error={error}
          onChange={onChange}
          inputRef={inputRef}
          multiple={multiple}
          allowCamera={allowCamera}
          {...rest}
        />
      );
    }

    // Regular input for non-file types
    return (
      <div className="flex flex-col space-y-1">
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
        <input
          id={id}
          name={id}
          type={type}
          ref={inputRef}
          value={value || ""}
          onChange={onChange}
          required={required}
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
    );
  }
);

/* Select dropdown */
export const Select = React.memo(
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
            "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"%239CA3AF\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M19 9l-7 7-7-7\"/></svg>')",
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

/* Tiny preview for image/file inputs
   – works for both File/Blob and existing URL strings */
export const ImagePreview = React.memo(({ file, onRemove }) => {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    console.log('ImagePreview received file:', file);
    if (!file) return;

    /* Case 1: new upload (File or Blob) */
    if (file instanceof Blob) {
      console.log('Processing Blob file:', file.name, file.size, file.type);
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('FileReader loaded, setting src');
        setSrc(e.target.result);
      };
      reader.readAsDataURL(file);
      return () => reader.abort?.();
    }

    /* Case 2: existing file name or full URL */
    if (typeof file === "string") {
      console.log('Processing string file:', file);
      const url =
        file.startsWith("http") || file.startsWith("/")
          ? file
          : `/uploads/${file}`;
      setSrc(url);
    }
  }, [file]);

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

/* Progress bar */
export const StepIndicator = ({ step, total }) => (
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
