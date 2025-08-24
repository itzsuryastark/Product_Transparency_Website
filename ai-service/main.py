from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
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


class QuestionOption(BaseModel):
    value: str
    label: str


class Question(BaseModel):
    id: str
    text: str
    type: str = "text"  # text, textarea, multiple_choice, dropdown, file_upload, number, email, date
    required: bool = True
    options: Optional[List[QuestionOption]] = None
    placeholder: Optional[str] = None
    validation: Optional[Dict[str, Any]] = None
    help_text: Optional[str] = None


class QuestionsResponse(BaseModel):
    nextQuestions: List[Question]
    progress: float


def generate_smart_questions(product_name: str, answers: Dict[str, Any]) -> List[Question]:
    """Generate context-aware questions based on product type and previous answers"""
    
    questions = []
    
    # Basic product information
    if not answers.get("product_name"):
        questions.append(Question(
            id="product_name",
            text="What is the name of your product?",
            type="text",
            required=True,
            placeholder="e.g., Organic Cotton T-Shirt"
        ))
    
    if not answers.get("product_category"):
        questions.append(Question(
            id="product_category",
            text="What category does your product belong to?",
            type="dropdown",
            required=True,
            options=[
                QuestionOption(value="clothing", label="Clothing & Apparel"),
                QuestionOption(value="electronics", label="Electronics"),
                QuestionOption(value="food", label="Food & Beverages"),
                QuestionOption(value="cosmetics", label="Cosmetics & Personal Care"),
                QuestionOption(value="furniture", label="Furniture & Home"),
                QuestionOption(value="automotive", label="Automotive"),
                QuestionOption(value="other", label="Other")
            ]
        ))
    
    if not answers.get("origin_country"):
        questions.append(Question(
            id="origin_country",
            text="What is the country of origin for your product?",
            type="dropdown",
            required=True,
            options=[
                QuestionOption(value="usa", label="United States"),
                QuestionOption(value="china", label="China"),
                QuestionOption(value="india", label="India"),
                QuestionOption(value="bangladesh", label="Bangladesh"),
                QuestionOption(value="vietnam", label="Vietnam"),
                QuestionOption(value="turkey", label="Turkey"),
                QuestionOption(value="mexico", label="Mexico"),
                QuestionOption(value="other", label="Other")
            ]
        ))
    
    if not answers.get("materials"):
        questions.append(Question(
            id="materials",
            text="What are the primary materials used in your product?",
            type="textarea",
            required=True,
            placeholder="List the main materials and their percentages if known...",
            help_text="Be as specific as possible for better transparency"
        ))
    
    if not answers.get("sustainability_rating"):
        questions.append(Question(
            id="sustainability_rating",
            text="How would you rate your product's sustainability?",
            type="multiple_choice",
            required=True,
            options=[
                QuestionOption(value="excellent", label="Excellent - Leading industry standards"),
                QuestionOption(value="good", label="Good - Above average practices"),
                QuestionOption(value="average", label="Average - Meets basic requirements"),
                QuestionOption(value="below_average", label="Below Average - Needs improvement"),
                QuestionOption(value="unknown", label="Unknown - Still evaluating")
            ]
        ))
    
    if not answers.get("certifications"):
        questions.append(Question(
            id="certifications",
            text="What sustainability certifications does your product have?",
            type="multiple_choice",
            required=False,
            options=[
                QuestionOption(value="organic", label="Organic Certification"),
                QuestionOption(value="fair_trade", label="Fair Trade"),
                QuestionOption(value="gots", label="Global Organic Textile Standard (GOTS)"),
                QuestionOption(value="oeko_tex", label="OEKO-TEX Standard 100"),
                QuestionOption(value="b_corp", label="B Corp Certification"),
                QuestionOption(value="leed", label="LEED Certification"),
                QuestionOption(value="none", label="No certifications yet"),
                QuestionOption(value="other", label="Other certifications")
            ]
        ))
    
    if not answers.get("carbon_footprint"):
        questions.append(Question(
            id="carbon_footprint",
            text="What is the estimated carbon footprint per unit? (in kg CO2e)",
            type="number",
            required=False,
            placeholder="e.g., 2.5",
            help_text="Leave blank if not calculated yet"
        ))
    
    if not answers.get("supplier_info"):
        questions.append(Question(
            id="supplier_info",
            text="Do you have supplier transparency information?",
            type="file_upload",
            required=False,
            help_text="Upload supplier list, audit reports, or compliance documents"
        ))
    
    if not answers.get("recyclability"):
        questions.append(Question(
            id="recyclability",
            text="Is your product recyclable?",
            type="multiple_choice",
            required=True,
            options=[
                QuestionOption(value="fully_recyclable", label="Fully Recyclable"),
                QuestionOption(value="partially_recyclable", label="Partially Recyclable"),
                QuestionOption(value="not_recyclable", label="Not Recyclable"),
                QuestionOption(value="unknown", label="Unknown")
            ]
        ))
    
    if not answers.get("packaging_type"):
        questions.append(Question(
            id="packaging_type",
            text="What type of packaging do you use?",
            type="multiple_choice",
            required=True,
            options=[
                QuestionOption(value="recyclable", label="Recyclable Packaging"),
                QuestionOption(value="biodegradable", label="Biodegradable Packaging"),
                QuestionOption(value="reusable", label="Reusable Packaging"),
                QuestionOption(value="minimal", label="Minimal Packaging"),
                QuestionOption(value="standard", label="Standard Packaging"),
                QuestionOption(value="unknown", label="Unknown")
            ]
        ))
    
    if not answers.get("contact_email"):
        questions.append(Question(
            id="contact_email",
            text="What email should customers use for transparency inquiries?",
            type="email",
            required=False,
            placeholder="transparency@yourcompany.com"
        ))
    
    if not answers.get("manufacturing_date"):
        questions.append(Question(
            id="manufacturing_date",
            text="When was this product manufactured?",
            type="date",
            required=False
        ))
    
    # Conditional questions based on previous answers
    if answers.get("product_category") == "clothing" and not answers.get("fabric_composition"):
        questions.append(Question(
            id="fabric_composition",
            text="What is the fabric composition?",
            type="textarea",
            required=True,
            placeholder="e.g., 100% Organic Cotton, 95% Cotton 5% Elastane"
        ))
    
    if answers.get("product_category") == "electronics" and not answers.get("energy_efficiency"):
        questions.append(Question(
            id="energy_efficiency",
            text="What is the energy efficiency rating?",
            type="dropdown",
            required=False,
            options=[
                QuestionOption(value="a_plus_plus", label="A++ (Most Efficient)"),
                QuestionOption(value="a_plus", label="A+"),
                QuestionOption(value="a", label="A"),
                QuestionOption(value="b", label="B"),
                QuestionOption(value="c", label="C"),
                QuestionOption(value="d", label="D"),
                QuestionOption(value="e", label="E"),
                QuestionOption(value="f", label="F"),
                QuestionOption(value="g", label="G (Least Efficient)"),
                QuestionOption(value="unknown", label="Unknown")
            ]
        ))
    
    if answers.get("product_category") == "food" and not answers.get("ingredients_source"):
        questions.append(Question(
            id="ingredients_source",
            text="Are your ingredients locally sourced?",
            type="multiple_choice",
            required=False,
            options=[
                QuestionOption(value="all_local", label="All ingredients are locally sourced"),
                QuestionOption(value="mostly_local", label="Most ingredients are locally sourced"),
                QuestionOption(value="some_local", label="Some ingredients are locally sourced"),
                QuestionOption(value="not_local", label="Ingredients are not locally sourced"),
                QuestionOption(value="unknown", label="Unknown")
            ]
        ))
    
    # Final question
    if len(answers) >= 8 and not answers.get("additional_notes"):
        questions.append(Question(
            id="additional_notes",
            text="Any additional information for transparency?",
            type="textarea",
            required=False,
            placeholder="Share any other relevant information about your product's sustainability, ethical practices, or transparency initiatives..."
        ))
    
    return questions


@app.post("/generate-questions", response_model=QuestionsResponse)
def generate_questions(payload: ProductData):
    answers = payload.answers or {}
    
    # Generate smart questions based on product and previous answers
    next_questions = generate_smart_questions(payload.name, answers)
    
    # Calculate progress based on total possible questions
    total_possible_questions = 15  # Approximate total questions in the system
    answered_questions = len(answers)
    progress = min(1.0, answered_questions / total_possible_questions)
    
    # If no more questions, add a completion message
    if not next_questions:
        next_questions.append(Question(
            id="completion",
            text="Great! You've completed the transparency questionnaire. You can now generate your report.",
            type="text",
            required=False
        ))
        progress = 1.0
    
    return QuestionsResponse(nextQuestions=next_questions, progress=progress)


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8001"))
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=port, reload=True)


