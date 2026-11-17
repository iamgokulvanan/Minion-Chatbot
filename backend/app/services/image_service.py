import os
import uuid
import random
from urllib.parse import quote_plus
import httpx
from app.config import settings

class ImageService:
    async def generate_image(self, prompt: str) -> dict:
        """Generates high-resolution AI visual image using Flux/Pollinations or OpenAI DALL-E."""
        clean_prompt = prompt.strip()
        seed = random.randint(100000, 999999)
        
        # Pollinations Flux AI URL
        encoded_prompt = quote_plus(clean_prompt)
        pollinations_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true&seed={seed}&model=flux"

        # Try to download and cache locally into uploads/
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        filename = f"gen_{uuid.uuid4().hex[:10]}.jpg"
        local_path = os.path.join(settings.UPLOAD_DIR, filename)
        local_url = f"/uploads/{filename}"

        try:
            async with httpx.AsyncClient(timeout=25.0, follow_redirects=True) as client:
                resp = await client.get(pollinations_url)
                if resp.status_code == 200 and len(resp.content) > 1000:
                    with open(local_path, "wb") as f:
                        f.write(resp.content)
                    return {
                        "status": "success",
                        "image_url": local_url,
                        "cdn_url": pollinations_url,
                        "prompt": clean_prompt,
                        "seed": seed,
                        "source": "Flux AI Engine"
                    }
        except Exception as e:
            # If download timed out or network blocked, return direct live image URL
            pass

        return {
            "status": "success",
            "image_url": pollinations_url,
            "cdn_url": pollinations_url,
            "prompt": clean_prompt,
            "seed": seed,
            "source": "Flux Live CDN"
        }

image_service = ImageService()
