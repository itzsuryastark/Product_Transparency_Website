import { useEffect, useMemo, useState } from "react";

type QuestionOption = { value: string; label: string };

type Question = {
  id: string;
  text: string;
  type?: string;
  required?: boolean;
  options?: QuestionOption[];
  placeholder?: string;
  help_text?: string;
};

export function MultiStepForm() {
  const [name, setName] = useState("Example Product");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const validateAnswers = () => {
    const newErrors: Record<string, string> = {};

    questions.forEach((question) => {
      if (
        question.required &&
        (!answers[question.id] || answers[question.id].trim() === "")
      ) {
        newErrors[question.id] = "This field is required";
      }

      // Email validation
      if (question.type === "email" && answers[question.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(answers[question.id])) {
          newErrors[question.id] = "Please enter a valid email address";
        }
      }

      // Number validation
      if (question.type === "number" && answers[question.id]) {
        if (isNaN(Number(answers[question.id]))) {
          newErrors[question.id] = "Please enter a valid number";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    if (!validateAnswers()) {
      return;
    }
    await fetchNext();
  };

  const submitAll = async () => {
    if (!validateAnswers()) {
      return;
    }
    const product = await saveProduct();
    await generateReport(product.id);
  };

  const renderQuestionInput = (question: Question) => {
    const commonProps = {
      value: answers[question.id] || "",
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      ) => updateAnswer(question.id, e.target.value),
      className: `mt-1 w-full border rounded px-3 py-2 ${
        errors[question.id] ? "border-red-500" : "border-gray-300"
      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`,
      placeholder: question.placeholder,
    };

    switch (question.type) {
      case "textarea":
        return (
          <textarea
            {...commonProps}
            rows={4}
            className={`${commonProps.className} resize-vertical`}
          />
        );

      case "multiple_choice":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={answers[question.id] === option.value}
                  onChange={(e) => updateAnswer(question.id, e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case "dropdown":
        return (
          <select {...commonProps}>
            <option value="">Select an option...</option>
            {question.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "file_upload":
        return (
          <div className="space-y-2">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  updateAnswer(question.id, file.name);
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {answers[question.id] && (
              <p className="text-sm text-green-600">
                ✓ {answers[question.id]} selected
              </p>
            )}
          </div>
        );

      case "number":
        return <input {...commonProps} type="number" step="any" />;

      case "email":
        return <input {...commonProps} type="email" />;

      case "date":
        return <input {...commonProps} type="date" />;

      default:
        return <input {...commonProps} type="text" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Product Transparency Assessment
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your product name..."
          />
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300 ease-out"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        {questions.map((question) => (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.text}
              {question.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>

            {renderQuestionInput(question)}

            {question.help_text && (
              <p className="text-sm text-gray-500 italic">
                {question.help_text}
              </p>
            )}

            {errors[question.id] && (
              <p className="text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={next}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Continue
          </button>
          <button
            onClick={submitAll}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            Save & Generate Report
          </button>
        </div>

        {/* Summary */}
        {Object.keys(answers).length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Completed Questions:
            </h3>
            <div className="text-sm text-gray-600">
              {Object.keys(answers).length} of ~15 questions answered
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
