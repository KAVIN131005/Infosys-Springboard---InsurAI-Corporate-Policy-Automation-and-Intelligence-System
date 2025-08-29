from app.services.nlp_service import nlp

def summarize_text(text):
    doc = nlp(text)
    # Simple summary: first 3 sentences
    sentences = list(doc.sents)[:3]
    return ' '.join([sent.text for sent in sentences])