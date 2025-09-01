import logging
from typing import Dict, List, Any, Optional, Tuple
import re
from pathlib import Path
import tempfile
import os
import io

# Try to import optional dependencies
try:
    import pytesseract
    PYTESSERACT_AVAILABLE = True
except ImportError:
    PYTESSERACT_AVAILABLE = False

try:
    import cv2
    import numpy as np
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

try:
    from PIL import Image, ImageEnhance, ImageFilter
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

try:
    from pdf2image import convert_from_bytes
    PDF2IMAGE_AVAILABLE = True
except ImportError:
    PDF2IMAGE_AVAILABLE = False

logger = logging.getLogger(__name__)

class OCRService:
    def __init__(self):
        self.setup_tesseract()
        self.supported_formats = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.bmp', '.gif']
        self.confidence_threshold = 30  # Minimum confidence for text extraction
    
    def setup_tesseract(self):
        """Setup Tesseract OCR configuration"""
        try:
            # Configure Tesseract path (Windows)
            tesseract_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
            if os.path.exists(tesseract_path):
                pytesseract.pytesseract.tesseract_cmd = tesseract_path
            
            # Test Tesseract installation
            version = pytesseract.get_tesseract_version()
            logger.info(f"Tesseract OCR initialized successfully. Version: {version}")
            
        except Exception as e:
            logger.error(f"Failed to initialize Tesseract OCR: {str(e)}")
            logger.warning("OCR functionality may be limited")
    
    async def extract_text_from_document(
        self, 
        file_content: bytes, 
        filename: str
    ) -> str:
        """
        Extract text from document using OCR
        """
        try:
            file_extension = Path(filename).suffix.lower()
            
            if file_extension not in self.supported_formats:
                raise ValueError(f"Unsupported file format: {file_extension}")
            
            # Handle PDF files
            if file_extension == '.pdf':
                return await self._extract_text_from_pdf(file_content)
            
            # Handle image files
            else:
                return await self._extract_text_from_image(file_content)
                
        except Exception as e:
            logger.error(f"Text extraction failed for {filename}: {str(e)}")
            return f"Error extracting text: {str(e)}"
    
    async def _extract_text_from_pdf(self, pdf_content: bytes) -> str:
        """Extract text from PDF file"""
        try:
            # Try to import pdf2image
            try:
                from pdf2image import convert_from_bytes
            except ImportError:
                logger.error("pdf2image not installed. Cannot process PDF files.")
                return "Error: PDF processing not available. Please install pdf2image."
            
            # Convert PDF to images
            images = convert_from_bytes(pdf_content, dpi=300)
            
            extracted_texts = []
            
            for i, image in enumerate(images):
                logger.info(f"Processing PDF page {i + 1}/{len(images)}")
                
                # Convert PIL image to numpy array for preprocessing
                img_array = np.array(image)
                
                # Preprocess the image
                processed_image = self._preprocess_image(img_array)
                
                # Extract text using OCR
                page_text = self._perform_ocr(processed_image)
                
                if page_text.strip():
                    extracted_texts.append(f"--- Page {i + 1} ---\n{page_text}")
            
            return "\n\n".join(extracted_texts) if extracted_texts else "No text could be extracted from PDF"
            
        except Exception as e:
            logger.error(f"PDF text extraction failed: {str(e)}")
            return f"Error processing PDF: {str(e)}"
    
    async def _extract_text_from_image(self, image_content: bytes) -> str:
        """Extract text from image file"""
        try:
            # Load image from bytes
            image = Image.open(io.BytesIO(image_content))
            
            # Convert to RGB if necessary
            if image.mode not in ('RGB', 'L'):
                image = image.convert('RGB')
            
            # Convert to numpy array for preprocessing
            img_array = np.array(image)
            
            # Preprocess the image
            processed_image = self._preprocess_image(img_array)
            
            # Extract text using OCR
            extracted_text = self._perform_ocr(processed_image)
            
            return extracted_text if extracted_text.strip() else "No text could be extracted from image"
            
        except Exception as e:
            logger.error(f"Image text extraction failed: {str(e)}")
            return f"Error processing image: {str(e)}"
    
    def _preprocess_image(self, img_array: np.ndarray) -> np.ndarray:
        """
        Preprocess image to improve OCR accuracy
        """
        try:
            # Convert to grayscale
            if len(img_array.shape) == 3:
                gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
            else:
                gray = img_array
            
            # Apply denoising
            denoised = cv2.fastNlMeansDenoising(gray)
            
            # Apply Gaussian blur to smooth the image
            blurred = cv2.GaussianBlur(denoised, (1, 1), 0)
            
            # Apply threshold to get a binary image
            _, threshold = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Morphological operations to clean up the image
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
            cleaned = cv2.morphologyEx(threshold, cv2.MORPH_CLOSE, kernel)
            
            # Dilation to make text thicker
            dilated = cv2.dilate(cleaned, kernel, iterations=1)
            
            return dilated
            
        except Exception as e:
            logger.warning(f"Image preprocessing failed: {str(e)}. Using original image.")
            return img_array
    
    def _perform_ocr(self, image: np.ndarray) -> str:
        """
        Perform OCR on preprocessed image
        """
        try:
            # Configure Tesseract parameters for better accuracy
            custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,!?@#$%^&*()_+-=[]{}|;:\'\"<>/\\ '
            
            # Extract text with detailed data
            data = pytesseract.image_to_data(
                image, 
                config=custom_config,
                output_type=pytesseract.Output.DICT
            )
            
            # Filter text based on confidence
            extracted_text = []
            for i, confidence in enumerate(data['conf']):
                if int(confidence) > self.confidence_threshold:
                    text = data['text'][i].strip()
                    if text:
                        extracted_text.append(text)
            
            # Join extracted text
            result = ' '.join(extracted_text)
            
            # Clean up the text
            cleaned_text = self._clean_extracted_text(result)
            
            logger.info(f"OCR completed. Extracted {len(cleaned_text)} characters.")
            
            return cleaned_text
            
        except Exception as e:
            logger.error(f"OCR processing failed: {str(e)}")
            return f"OCR Error: {str(e)}"
    
    def _clean_extracted_text(self, text: str) -> str:
        """
        Clean and format extracted text
        """
        try:
            # Remove excessive whitespace
            cleaned = re.sub(r'\s+', ' ', text)
            
            # Fix common OCR errors
            cleaned = re.sub(r'\s+([.,!?;:])', r'\1', cleaned)  # Remove space before punctuation
            cleaned = re.sub(r'([.,!?;:])\s*', r'\1 ', cleaned)  # Add space after punctuation
            
            # Remove trailing and leading whitespace
            cleaned = cleaned.strip()
            
            return cleaned
            
        except Exception as e:
            logger.warning(f"Text cleaning failed: {str(e)}")
            return text

# Legacy function for backward compatibility
def extract_text_from_document(content, filename):
    """Legacy function for backward compatibility"""
    service = OCRService()
    if filename.endswith('.pdf'):
        return "OCR from PDF: placeholder text"
    else:
        image = Image.open(io.BytesIO(content))
        text = pytesseract.image_to_string(image)
        return text