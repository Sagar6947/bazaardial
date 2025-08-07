import { Input, Select } from "../ui/FormAtoms";
import {
  CATEGORY_OPTIONS,
  EXPERIENCE_OPTIONS,
} from "../hooks/useBusinessForm";

export default function Step1General({ data, errors, onChange }) {
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
}
