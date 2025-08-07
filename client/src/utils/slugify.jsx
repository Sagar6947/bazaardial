export default function slugify(str = "") {
  return str
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9]+/g, "-") // Replace spaces & symbols with "-"
    .replace(/(^-|-$)+/g, ""); // Remove leading/trailing dashes
}
