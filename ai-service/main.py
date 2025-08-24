from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os

app = FastAPI(title="AI Question Generator Service")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ProductData(BaseModel):
    name: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    answers: Optional[Dict[str, Any]] = None


class Question(BaseModel):
    id: str
    text: str
    type: str = "text"
    required: bool = True


class QuestionsResponse(BaseModel):
    nextQuestions: List[Question]
    progress: float


@app.post("/generate-questions", response_model=QuestionsResponse)
def generate_questions(payload: ProductData):
    # Mock LLM-like logic based on product metadata/answers
    base_questions = [
        Question(id="origin_country", text="What is the country of origin?"),
        Question(id="materials", text="List primary materials used."),
        Question(id="certifications", text="Any sustainability certifications?"),
    ]

    answers = payload.answers or {}
    next_questions: List[Question] = []

    if not answers.get("origin_country"):
        next_questions.append(base_questions[0])
    elif not answers.get("materials"):
        next_questions.append(base_questions[1])
    elif not answers.get("certifications"):
        next_questions.append(base_questions[2])

    progress = 1.0 - (len(next_questions) / 3.0)
    if not next_questions:
        # Add a generic follow-up
        next_questions.append(Question(id="notes", text="Any additional notes for transparency report?", required=False))
        progress = 1.0

    return QuestionsResponse(nextQuestions=next_questions, progress=progress)


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8001"))
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=port, reload=True)


