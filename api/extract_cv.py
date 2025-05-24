import pdfplumber
import io
import spacy
import re
from transformers import pipeline

# Load spaCy and transformers NER pipeline
nlp = spacy.load("en_core_web_sm")
ner_pipeline = pipeline("ner", model="dslim/bert-base-NER", aggregation_strategy="simple")

def extract_text_from_pdf(pdf_bytes):
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    return text

def extract_email(text):
    match = re.search(r'[\w\.-]+@[\w\.-]+', text)
    return match.group(0) if match else None

def extract_phone(text):
    match = re.search(r'(\+?\d{1,3})?[\s\-\.]?\(?\d{2,4}\)?[\s\-\.]?\d{3,4}[\s\-\.]?\d{3,4}', text)
    return match.group(0) if match else None

def extract_cv_info(pdf_bytes):
    text = extract_text_from_pdf(pdf_bytes)
    doc = nlp(text)

    # Basic entity extraction
    entities = {"names": [], "orgs": [], "dates": [], "gpes": []}
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            entities["names"].append(ent.text)
        elif ent.label_ == "ORG":
            entities["orgs"].append(ent.text)
        elif ent.label_ == "DATE":
            entities["dates"].append(ent.text)
        elif ent.label_ == "GPE":
            entities["gpes"].append(ent.text)

    # Advanced NER for skills, titles, etc.
    ner_results = ner_pipeline(text)
    skills_keywords = [
        "python", "java", "sql", "machine learning", "data analysis", "project management", "communication",
        "teamwork", "leadership", "javascript", "aws", "c++", "html", "css", "react", "node.js"
    ]
    skills = [kw for kw in skills_keywords if kw.lower() in text.lower()]

    return {
        "entities": entities,
        "email": extract_email(text),
        "phone": extract_phone(text),
        "skills": skills,
        "ner_results": ner_results[:20],  # sample only, limit for response brevity
        "raw_text": text[:1000]  # preview
    }