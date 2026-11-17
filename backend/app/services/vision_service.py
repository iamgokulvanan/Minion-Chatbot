import os
from typing import Dict, Any
from PIL import Image

class VisionService:
    @staticmethod
    def analyze_image(file_path: str, filename: str) -> Dict[str, Any]:
        """Analyzes image dimensions, format, and generates a visual understanding brief."""
        if not os.path.exists(file_path):
            return {"error": "Image file not found"}

        try:
            with Image.open(file_path) as img:
                width, height = img.size
                format_name = img.format or "Unknown"
                mode = img.mode

                # Compute average brightness
                thumb = img.convert("L").resize((10, 10))
                pixels = list(thumb.getdata())
                avg_brightness = sum(pixels) / len(pixels)
                tone = "Dark / Cyber aesthetic" if avg_brightness < 120 else "Bright / High contrast"

                description = (
                    f"Visual Image Asset '{filename}' ({format_name}, {width}x{height}px, {mode} mode). "
                    f"Overall tonal balance: {tone}. "
                    f"Ready for deep multimodal inspection, UI review, or OCR query."
                )

                return {
                    "filename": filename,
                    "width": width,
                    "height": height,
                    "format": format_name,
                    "tone": tone,
                    "description": description
                }
        except Exception as e:
            return {
                "filename": filename,
                "error": f"Failed to analyze image: {str(e)}"
            }

vision_service = VisionService()
