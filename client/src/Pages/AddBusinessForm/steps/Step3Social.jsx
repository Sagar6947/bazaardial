import { Input } from "../ui/FormAtoms";

export default function Step3Social({ data, errors, onChange }) {
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
        required
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
}
