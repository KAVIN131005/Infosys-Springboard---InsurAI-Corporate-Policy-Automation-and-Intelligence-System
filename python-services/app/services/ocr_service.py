from PIL import Image
import pytesseract
import io

def extract_text_from_document(content, filename):
    if filename.endswith('.pdf'):
        # Handle PDF, simplified
        return "OCR from PDF: placeholder text"
    else:
        image = Image.open(io.BytesIO(content))
        text = pytesseract.image_to_string(image)
        return text