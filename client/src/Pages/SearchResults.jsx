// src/pages/SearchResults.jsx
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../utils/api"; // your axios instance

export default function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!q) {
      setData([]);
      return;
    }
    (async () => {
      const { data } = await api.get("/business", { params: { q } });
      setData(data);
    })();
  }, [q]);

  if (data === null) return <p className="p-6">Loading…</p>;
  if (data.length === 0) return <p className="p-6">No matches for “{q}”.</p>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">
        Results for “{q}” ({data.length})
      </h2>

      <ul className="space-y-3">
        {data.map((b) => (
          <li key={b._id} className="border p-4 rounded">
            <h3 className="font-medium">{b.businessName}</h3>
            <p className="text-sm text-gray-600">{b.shortDesc}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
