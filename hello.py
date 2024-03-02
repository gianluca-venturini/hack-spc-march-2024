from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()  # This loads the environment variables from .env

client = OpenAI()

audio_file= open("test.mp3", "rb")
transcription = client.audio.transcriptions.create(
  model="whisper-1", 
  file=audio_file
)
print(transcription.text)