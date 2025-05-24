import pdfplumber
import io
import spacy
from transformers import pipeline

# Load spaCy and transformers NER model
nlp = spacy.load("en_core_web_sm")
ner_pipeline = pipeline("ner", model="dslim/bert-base-NER")

def extract_text_from_pdf(pdf_bytes):
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    return text

def extract_cv_info(pdf_bytes):
    text = extract_text_from_pdf(pdf_bytes)
    doc = nlp(text)
    entities = {
        "PERSON": [],
        "ORG": [],
        "GPE": [],
        "DATE": [],
        "EMAIL": [],
        "PHONE": []
    }
    for ent in doc.ents:
        if ent.label_ in entities:
            entities[ent.label_].append(ent.text)
    advanced_ents = ner_pipeline(text)
    # Example: Extract skills from text (simple example, improve as needed)
    skills_keywords = ["python", "java", "machine learning", "sql", "communication", "teamwork"]
    skills = [skill for skill in skills_keywords if skill.lower() in text.lower()]
    return {
        "entities": entities,
        "advanced_ner": advanced_ents,
        "skills": skills,
        "raw_text": text[:1000]  # preview only
    }