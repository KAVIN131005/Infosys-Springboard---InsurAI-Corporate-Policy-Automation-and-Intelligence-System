import logging
from typing import Dict, List, Any, Optional
import base64
import io

logger = logging.getLogger(__name__)

class OCRService:
    """
    Simplified OCR service that works without heavy dependencies
    """
    
    def __init__(self):
        self.supported_formats = [".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".bmp"]
        logger.info("Simple OCR Service initialized")
    
    async def extract_text_from_document(self, file_content: bytes, filename: str) -> str:
        """
        Extract text from document (simplified version)
        """
        try:
            # For now, return a mock response
            file_extension = filename.lower().split('.')[-1] if '.' in filename else ''
            
            if file_extension in ['pdf']:
                return f"[Extracted text from PDF: {filename}] This is a mock text extraction. In production, this would contain the actual extracted text from the PDF document."
            elif file_extension in ['png', 'jpg', 'jpeg', 'tiff', 'bmp']:
                return f"[Extracted text from image: {filename}] This is a mock text extraction. In production, this would contain the actual OCR text from the image."
            else:
                return f"[Unsupported format: {file_extension}] Please use supported formats: {', '.join(self.supported_formats)}"
                
        except Exception as e:
            logger.error(f"Text extraction failed: {str(e)}")
            return f"Error extracting text: {str(e)}"
    
    async def extract_structured_data(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """
        Extract structured data from document (simplified version)
        """
        try:
            return {
                "extracted_data": {
                    "filename": filename,
                    "file_size": len(file_content),
                    "mock_fields": {
                        "policy_number": "POL-123456789",
                        "claim_number": "CLM-987654321",
                        "date": "2025-09-01",
                        "amount": "$5,000.00"
                    }
                },
                "confidence_score": 0.85,
                "processing_time": "0.5 seconds"
            }
            
        except Exception as e:
            logger.error(f"Structured data extraction failed: {str(e)}")
            return {
                "extracted_data": {},
                "error": str(e),
                "confidence_score": 0.0
            }
    
    def get_supported_formats(self) -> List[str]:
        """Get list of supported file formats"""
        return self.supported_formats
    
    async def validate_document(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """
        Validate document (simplified version)
        """
        try:
            file_size = len(file_content)
            file_extension = filename.lower().split('.')[-1] if '.' in filename else ''
            
            is_valid = file_extension in [fmt[1:] for fmt in self.supported_formats]
            
            return {
                "is_valid": is_valid,
                "file_size": file_size,
                "file_type": file_extension,
                "validation_score": 0.9 if is_valid else 0.1,
                "issues": [] if is_valid else [f"Unsupported file type: {file_extension}"]
            }
            
        except Exception as e:
            logger.error(f"Document validation failed: {str(e)}")
            return {
                "is_valid": False,
                "error": str(e),
                "validation_score": 0.0
            }
