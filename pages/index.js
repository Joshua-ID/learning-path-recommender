import { useState } from "react";
import SkillForm from "../components/SkillForm";
import PathCard from "../components/PathCard";

export default function Home() {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleRecommend(payload) {
    setLoading(true);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setPaths(data.paths || []);
      } else {
        alert(data.error || "Recommendation failed");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex  bg-sky-50 p-6">
      <div className="w-full p-6">
        <SkillForm onRecommend={handleRecommend} loading={loading} />
      </div>

      {paths.length > 0 && (
        <section className="w-full max-w-5xl  grid gap-4">
          {paths.length > 0 &&
            paths.map((p, i) => <PathCard key={i} path={p} />)}
        </section>
      )}
    </div>
  );
}
