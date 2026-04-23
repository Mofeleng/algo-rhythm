from .audio_dto import AudioGenerationBase

class GenerateFromDescriptionRequest(AudioGenerationBase):
    song_description: str

class GenerateWithCustomLyricsRequest(AudioGenerationBase):
    prompt: str
    lyrics: str

class GenerateWithDescribedLyricsRequest(AudioGenerationBase):
    prompt: str
    described_lyrics: str
    lyrics: str = ""

