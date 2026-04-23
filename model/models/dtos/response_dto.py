from typing import List

from pydantic import BaseModel

class GenerateMusicResponse(BaseModel):
    audio_data: str

class GenerateMusicResponseR2(BaseModel):
    r2_key: str 
    cover_image_r2_key: str
    categories: List[str]