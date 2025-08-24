import { useEffect, useMemo, useState } from "react";

type Question = { id: string; text: string; type?: string; required?: boolean };

export function MultiStepForm() {
  const [name, setName] = useState("Example Product");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [progress, setProgress] = useState(0);
  const token = useMemo(() => localStorage.getItem("token"), []);

  useEffect(() => {
    fetchNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchNext() {
    const res = await fetch("http://localhost:8001/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, metadata: {}, answers }),
    });
    const data = await res.json();
    setQuestions(data.nextQuestions);
    setProgress(data.progress);
  }

  const updateAnswer = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const saveProduct = async () => {
    const res = await fetch("http://localhost:8000/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, metadata: answers }),
    });
    if (!res.ok) throw new Error("Failed to save product");
    const product = await res.json();
    return product;
  };

  const generateReport = async (productId: number) => {
    const res = await fetch("http://localhost:8000/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId,
        name,
        metadata: answers,
      }),
    });
    if (!res.ok) throw new Error("Report generation failed");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const next = async () => {
    await fetchNext();
  };

  const submitAll = async () => {
    const product = await saveProduct();
    await generateReport(product.id);
  };

  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Product Details</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm">Product Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>
        <div className="h-2 bg-gray-200 rounded">
          <div
            className="h-2 bg-blue-600 rounded"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>

        {questions.map((q) => (
          <div key={q.id}>
            <label className="block text-sm">{q.text}</label>
            <input
              value={answers[q.id] || ""}
              onChange={(e) => updateAnswer(q.id, e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
        ))}

        <div className="flex gap-3">
          <button
            onClick={next}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Next
          </button>
          <button
            onClick={submitAll}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Save & Download Report
          </button>
        </div>
      </div>
    </div>
  );
}
