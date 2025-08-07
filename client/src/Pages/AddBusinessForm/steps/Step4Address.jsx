import { Input, Select } from "../ui/FormAtoms";
import { LOCALITY_OPTIONS } from "../hooks/useBusinessForm";

export default function Step4Address({ data, errors, onChange }) {
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
}
