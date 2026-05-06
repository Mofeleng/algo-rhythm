import base64
from typing import List
import uuid
import modal
import os
import requests
import boto3
import torch

from models.dtos.request_dto import GenerateFromDescriptionRequest, GenerateWithDescribedLyricsRequest, GenerateWithCustomLyricsRequest
from models.dtos.response_dto import GenerateMusicResponse, GenerateMusicResponseR2
from prompts import LYRICS_GENERATOR_PROMPT, PROMPT_GENERATOR_PROMPT
import torchaudio
import soundfile as sf
import numpy as np

# Improved safe save function
def safe_torchaudio_save(uri, src, sample_rate: int, **kwargs):
    """Fallback that uses soundfile directly (bypasses TorchCodec)."""
    try:
        waveform = src.cpu().numpy()

        # Ensure 2D shape: (samples, channels)
        if waveform.ndim == 1:
            waveform = waveform.reshape(-1, 1)          # mono → (samples, 1)
        elif waveform.ndim == 3:                        # rare batch case
            waveform = waveform.squeeze(0).T
        elif waveform.shape[0] <= 8:                    # likely (channels, samples)
            waveform = waveform.T

        sf.write(uri, waveform, samplerate=sample_rate, subtype='PCM_16')
    except Exception as e:
        raise
    
app = modal.App("algo-rhythm")

image = (
    modal.Image.debian_slim()
    .apt_install("git", "ffmpeg", "libsndfile1")
    .pip_install_from_requirements("requirements.txt")
    #.pip_install("torchcodec", "soundfile")
    .pip_install("soundfile")
    .run_commands([
        "git clone https://github.com/ace-step/ACE-Step.git /tmp/ACE-Step",
        "cd /tmp/ACE-Step && pip install ."
    ])
    .env({
        "HF_HOME": "/.cache/huggingface",
       })
    .add_local_python_source("prompts", "models")
)

model_volume = modal.Volume.from_name("ace-step-models", create_if_missing=True)
hf_volume = modal.Volume.from_name("qwen-hf-cache", create_if_missing=True)

music_gen_secrets = modal.Secret.from_name("music-generation-secrets")


@app.cls(
    image=image,
    gpu="L40S",
    volumes={"/models": model_volume, "/.cache/huggingface": hf_volume},
    secrets=[music_gen_secrets],
    scaledown_window=10
)

class MusicGenerationServer:
    @modal.enter()
    def load_model(self):
        from acestep.pipeline_ace_step import ACEStepPipeline
        from transformers import AutoModelForCausalLM, AutoTokenizer
        from diffusers import StableDiffusionXLPipeline
        import torch

        import torchaudio
        torchaudio.save = safe_torchaudio_save
        print("torchaudio.save patched to use soundfile backend")

        # Music Generation Model
        self.music_model = ACEStepPipeline(
            checkpoint_dir="/models",
            dtype="bfloat16",
            torch_compile=False,
            cpu_offload=False,
            overlapped_decode=False
        )

        # Large Language Model
        model_id =  "Qwen/Qwen2-7B-Instruct"
        self.tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2-7B-Instruct")

        self.language_model = AutoModelForCausalLM.from_pretrained(
            model_id,
            torch_dtype="auto",
            device_map="auto",
            cache_dir="/.cache/huggingface"
        )

        # Stable Diffusion Model (Thumbnails)
        self.img_pipeline = StableDiffusionXLPipeline.from_pretrained(
            "stabilityai/sdxl-turbo",
            torch_dtype=torch.float16,
            variant="fp16",
            cache_dir="/.cache/huggingface"
        )
        self.img_pipeline.to("cuda")

    def prompt_qwen(self, prompt: str):
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ]
        text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        model_inputs = self.tokenizer([text], return_tensors="pt").to(self.language_model.device)

        generated_ids = self.language_model.generate(
            model_inputs.input_ids,
            max_new_tokens=512
        )
        generated_ids = [
            output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
        ]

        response = self.tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
        return response
    
    def generate_prompt(self, description: str):
        full_prompt = PROMPT_GENERATOR_PROMPT.format(user_prompt=description)
        return self.prompt_qwen(full_prompt)
    
    def generate_lyrics(self, description: str):
        full_prompt = LYRICS_GENERATOR_PROMPT.format(description=description)
        return self.prompt_qwen(full_prompt)
    
    def generate_categories(self, description: str) -> List[str]:
        prompt = f"Based on the following music description, list 3-5 relevant genres or categories as a comma-separated list. Example: Pop, Electronic, Sad, 80s. Description: {description}"
        response_text = self.prompt_qwen(prompt)

        categories = [cat.strip() for cat in response_text.split(",") if cat.strip()]
        return categories
    
    def generate_and_upload_to_r2(
            self,
            prompt: str,
            lyrics: str,
            instrumental: bool,
            audio_duration: float,
            infer_step: int,
            guidance_scale: float,
            seed: int, 
            description_for_categories: str
    ) -> GenerateMusicResponseR2:
        final_lyrics = "[instrumental]" if instrumental else lyrics
        print(f"Generated lyrics: \n{final_lyrics}")

        r2_client = boto3.client(
            "s3",
            endpoint_url=os.environ["R2_ENDPOINT_URL"],
            aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
            aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
            region_name="auto"
        )
        bucket_name = os.environ["R2_BUCKET_NAME"]

        output_dir="/tmp/outputs"
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f"{uuid.uuid4()}.wav")

        self.music_model(
            prompt=prompt,
            lyrics=final_lyrics,
            audio_duration=audio_duration,
            infer_step=infer_step,
            guidance_scale=guidance_scale,
            save_path=output_path,
            manual_seeds=str(seed)
        )

        audio_r2_key = f"{uuid.uuid4()}.wav"
        r2_client.upload_file(output_path, bucket_name, audio_r2_key)
        os.remove(output_path)

        #Thumbnail Generation
        thumbnail_prompt = f"{prompt} album cover art"
        image = self.img_pipeline(prompt=thumbnail_prompt, inference_steps=2, guidance_scale=0.0).images[0]

        image_output_path = os.path.join(output_dir, f"{uuid.uuid4()}.png")
        image.save(image_output_path)
        image_r2_key = f"{uuid.uuid4()}.png"
        r2_client.upload_file(image_output_path, bucket_name, image_r2_key)
        os.remove(image_output_path)

        # Generate Categories
        categories = self.generate_categories(description_for_categories)

        return GenerateMusicResponseR2(
            r2_key=audio_r2_key,
            cover_image_r2_key=image_r2_key,
            categories=categories
        )

    @modal.fastapi_endpoint(method="POST", requires_proxy_auth=True)
    def generate(self):
        output_dir="/tmp/outputs"
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f"{uuid.uuid4()}.wav")

        self.music_model(
            prompt="Hip Hop, RnB, Melodic",
            lyrics="Trust, Trust who? Trust me and i could set you free girl, left your man came straight to me my love, why you that lil shit to me my love, when you know what you meant to me my love. Trust, Trust who? Trust me and I could set you free...",
            audio_duration=100,
            infer_step=60,
            guidance_scale=15,
            save_path=output_path
        )

        with open(output_path, "rb") as f:
            audio_bytes = f.read()

        audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
        os.remove(output_path)

        return GenerateMusicResponse(audio_data=audio_b64)
        
    @modal.fastapi_endpoint(method="POST", requires_proxy_auth=True)
    def generate_with_lyrics(self, request: GenerateWithCustomLyricsRequest) -> GenerateMusicResponseR2:
         return self.generate_and_upload_to_r2(prompt=request.prompt, lyrics=request.lyrics, description_for_categories=request.prompt, **request.model_dump(exclude={"prompt", "lyrics"}))


    @modal.fastapi_endpoint(method="POST", requires_proxy_auth=True)
    def generate_from_description(self, request: GenerateFromDescriptionRequest) -> GenerateMusicResponseR2:
        prompt = self.generate_prompt(request.song_description)
        lyrics = ""
        if not request.instrumental:
            lyrics = self.generate_lyrics(request.song_description)
        return self.generate_and_upload_to_r2(prompt=prompt, lyrics=lyrics, description_for_categories=request.song_description, **request.model_dump(exclude={"song_description"}))
    
    @modal.fastapi_endpoint(method="POST", requires_proxy_auth=True)
    def generate_with_described_lyrics(self, request: GenerateWithDescribedLyricsRequest) -> GenerateMusicResponseR2:
        lyrics = ""
        if not request.instrumental:
            lyrics = self.generate_lyrics(request.described_lyrics)
        
        return self.generate_and_upload_to_r2(prompt=request.prompt, lyrics=lyrics, description_for_categories=request.prompt, **request.model_dump(exclude={"described_lyrics", "prompt"}))