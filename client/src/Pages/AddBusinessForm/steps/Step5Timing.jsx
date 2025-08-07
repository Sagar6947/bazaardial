import { Input, Label } from "../ui/FormAtoms";

const hh = [...Array(12).keys()].map((i) => String(i + 1).padStart(2, "0"));
const mm = ["00", "15", "30", "45"];
const ap = ["AM", "PM"];

export default function Step5Timing({ data, errors, onChange }) {
  const timeSelect = (id, opts, val) => (
    <select
      id={id}
      value={val || ""}
      onChange={onChange}
      required
      className="border rounded-xl px-3 py-2 w-1/3 focus:ring-2 focus:ring-orange-400"
    >
      <option value="">
        {id.endsWith("A") ? "AM/PM" : id.endsWith("H") ? "HH" : "MM"}
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
          {timeSelect("openingHourH", hh, data.openingHourH)}
          {timeSelect("openingHourM", mm, data.openingHourM)}
          {timeSelect("openingHourA", ap, data.openingHourA)}
        </div>
      </div>

      {/* Closing */}
      <div className="flex flex-col space-y-1">
        <Label htmlFor="closingHourH" required>
          Closing Time
        </Label>
        <div className="flex gap-2">
          {timeSelect("closingHourH", hh, data.closingHourH)}
          {timeSelect("closingHourM", mm, data.closingHourM)}
          {timeSelect("closingHourA", ap, data.closingHourA)}
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
}
