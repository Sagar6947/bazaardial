/* src/components/AddBusinessForm/steps/Step2Images.jsx */
import { Input, ImagePreview } from "../ui/FormAtoms"; // ← fixed path

/**
 * Step-2 – Images & documents
 * • add-mode  : inputs active
 * • edit-mode : inputs disabled, previews only
 */
export default function Step2Images({
  data,
  errors,
  onChange,
  removeGallery,
  refs,
  isEditMode = false,
}) {
  const disabled = isEditMode;

  /* helper to render preview + name */
  const renderPreview = (file, removeCb) =>
    file && (
      <>
        <ImagePreview file={file} onRemove={!disabled ? removeCb : undefined} />
        <p className="text-xs mt-1 break-all">{file.name ?? file}</p>
      </>
    );

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
            disabled={disabled}
            allowCamera={true}
          />
          {renderPreview(data.logo, () => {
            refs.logo.current.value = "";
            onChange({ target: { id: "logo", type: "file", files: [] } });
          })}
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
            disabled={disabled}
            allowCamera={true}
          />
          {renderPreview(data.banner, () => {
            refs.banner.current.value = "";
            onChange({ target: { id: "banner", type: "file", files: [] } });
          })}
        </div>

        {/* Aadhaar / ID proof */}
        <div>
          <Input
            id="aadhar"
            label="Aadhaar / ID proof"
            type="file"
            required
            inputRef={refs.aadhar}
            onChange={onChange}
            error={errors.aadhar}
            disabled={disabled}
            allowCamera={true}
          />
          {renderPreview(data.aadhar, () => {
            refs.aadhar.current.value = "";
            onChange({ target: { id: "aadhar", type: "file", files: [] } });
          })}
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
          disabled={disabled}
          accept="image/*"
          allowCamera={false}
        />

        <div className="flex flex-wrap gap-3 mt-3">
          {data.gallery.map((img, idx) => (
            <div key={img instanceof File ? img.name + img.size : img ?? idx}>
              <ImagePreview
                file={img}
                onRemove={!disabled ? () => removeGallery(img) : undefined}
              />
              <p className="text-xs mt-1 break-all">
                {img.name ?? img /* url or filename */}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
