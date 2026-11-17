from typing import Dict, Any, List

class VoiceService:
    @staticmethod
    def get_voice_profiles() -> List[Dict[str, Any]]:
        """Returns supported voice assistant personalities and parameters."""
        return [
            {
                "id": "minion-core-synthetic",
                "name": "Minion Core (Futuristic Robotic & Clear)",
                "lang": "en-US",
                "pitch": 1.1,
                "rate": 1.05,
                "default": True
            },
            {
                "id": "nexus-deep",
                "name": "Nexus (Deep Intelligence)",
                "lang": "en-US",
                "pitch": 0.9,
                "rate": 1.0,
                "default": False
            },
            {
                "id": "aurora-crisp",
                "name": "Aurora (Crisp & Empathetic)",
                "lang": "en-GB",
                "pitch": 1.05,
                "rate": 1.0,
                "default": False
            }
        ]

voice_service = VoiceService()
