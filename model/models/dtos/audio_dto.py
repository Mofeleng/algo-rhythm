from pydantic import BaseModel


class AudioGenerationBase(BaseModel):
    audio_duration: float = 100.0
    seed: int = -1
    guidance_scale: float = 15.0
    infer_step: int = 60
    instrumental: bool = False
