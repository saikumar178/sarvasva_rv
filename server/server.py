from fastapi import FastAPI, Request, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import uvicorn
from googletrans import Translator
import io
from gtts import gTTS
import speech_recognition as sr
from pydub import AudioSegment
import tempfile
import os
import legacy
import sys
sys.modules["cgi"] = legacy


app = FastAPI()
translator = Translator()

# Allow frontend (Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
async def chat(request: Request):
    try:
        data = await request.json()
        message = data.get("message", "")
        language = data.get("language", "en-IN")

        if not message:
            return {"response": "Please provide a message."}

        # Step 1 — Translate input message to English
        translated_to_english = translator.translate(message, dest="en").text

        # Step 2 — Generate AI response (mock or real)
        # Replace with your model call if needed
        ai_response_en = f"I understood '{translated_to_english}'. Here's my response!"

        # Step 3 — Translate AI response back to selected language
        lang_code = language.split("-")[0]  # e.g., hi-IN → hi
        translated_back = translator.translate(ai_response_en, dest=lang_code).text

        return {"response": translated_back}
    except Exception as e:
        print(f"Error in /chat: {str(e)}")
        return {"response": "Sorry, I encountered an error processing your message."}

@app.post("/speech-to-text")
async def speech_to_text(
    audio: UploadFile = File(..., alias="audio"),
    language: str = Form(default="en-US")
):
    tmp_file_path = None
    wav_file_path = None
    try:
        # Read audio file
        audio_data = await audio.read()
        
        if len(audio_data) == 0:
            return {"transcription": "", "error": "Empty audio file"}
        
        # Get file extension from filename or content type
        filename = audio.filename or "audio"
        file_ext = filename.split('.')[-1].lower() if '.' in filename else 'webm'
        
        # Save original audio to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_ext}") as tmp_file:
            tmp_file.write(audio_data)
            tmp_file_path = tmp_file.name
        
        # Convert to WAV format if needed (speech_recognition requires WAV)
        wav_file_path = tmp_file_path
        if file_ext not in ['wav', 'wave']:
            try:
                # Try to set ffmpeg path if it exists in common locations
                ffmpeg_paths = [
                    r"C:\ffmpeg\bin\ffmpeg.exe",
                    r"C:\Program Files\ffmpeg\bin\ffmpeg.exe",
                    r"C:\tools\ffmpeg\bin\ffmpeg.exe",
                ]
                
                # Check if ffmpeg is in PATH
                import shutil
                ffmpeg_exe = shutil.which("ffmpeg")
                
                if ffmpeg_exe:
                    # ffmpeg is in PATH, pydub should find it automatically
                    pass
                else:
                    # Try to find ffmpeg in common locations
                    for path in ffmpeg_paths:
                        if os.path.exists(path):
                            AudioSegment.converter = path
                            AudioSegment.ffmpeg = path
                            AudioSegment.ffprobe = path.replace("ffmpeg.exe", "ffprobe.exe")
                            break
                
                # Load audio file using pydub (requires ffmpeg for format conversion)
                audio_segment = AudioSegment.from_file(tmp_file_path, format=file_ext)
                
                # Export as WAV (mono, 16kHz for better recognition)
                wav_file_path = tmp_file_path.replace(f".{file_ext}", ".wav")
                audio_segment = audio_segment.set_frame_rate(16000).set_channels(1)
                audio_segment.export(wav_file_path, format="wav")
                
                # Clean up original file
                if os.path.exists(tmp_file_path) and tmp_file_path != wav_file_path:
                    os.unlink(tmp_file_path)
            except FileNotFoundError as fnf_error:
                error_msg = str(fnf_error)
                print(f"FFmpeg not found: {error_msg}")
                return {
                    "transcription": "", 
                    "error": "FFmpeg is required for audio conversion. Please install it:\n1. Download from https://www.gyan.dev/ffmpeg/builds/\n2. Extract to C:\\ffmpeg\n3. Add C:\\ffmpeg\\bin to your PATH\nOr run: winget install Gyan.FFmpeg"
                }
            except Exception as conv_error:
                error_msg = str(conv_error)
                print(f"Audio conversion error: {error_msg}")
                
                # Check if it's an ffmpeg error
                if "ffmpeg" in error_msg.lower() or "No such file" in error_msg or "WinError 2" in error_msg:
                    return {
                        "transcription": "", 
                        "error": "FFmpeg is required for audio conversion. Please install it:\n1. Download from https://www.gyan.dev/ffmpeg/builds/\n2. Extract to C:\\ffmpeg\n3. Add C:\\ffmpeg\\bin to your PATH\nOr run: winget install Gyan.FFmpeg"
                    }
                
                # Try to use original file if it's already WAV
                if file_ext == 'wav':
                    wav_file_path = tmp_file_path
                else:
                    return {
                        "transcription": "", 
                        "error": f"Could not convert audio format. Please ensure ffmpeg is installed. Error: {error_msg}"
                    }
        
        try:
            # Use speech_recognition to convert speech to text
            recognizer = sr.Recognizer()
            
            # Adjust for ambient noise
            with sr.AudioFile(wav_file_path) as source:
                recognizer.adjust_for_ambient_noise(source, duration=0.5)
                audio_record = recognizer.record(source)
            
            # Convert language code format (e.g., "en-IN" -> "en-US", "hi-IN" -> "hi-IN")
            # Google Speech Recognition uses format like "en-US", "hi-IN", etc.
            lang_code = language.split("-")[0] if "-" in language else language
            if len(language.split("-")) > 1:
                country_code = language.split("-")[1]
                recognition_lang = f"{lang_code}-{country_code}"
            else:
                # Default to US for English, IN for others
                recognition_lang = f"{lang_code}-US" if lang_code == "en" else f"{lang_code}-IN"
            
            # Recognize speech using Google's speech recognition
            text = recognizer.recognize_google(audio_record, language=recognition_lang)
            return {"transcription": text}
        except sr.UnknownValueError:
            return {"transcription": "", "error": "Could not understand audio. Please speak clearly and try again."}
        except sr.RequestError as e:
            return {"transcription": "", "error": f"Error with speech recognition service: {str(e)}"}
        except Exception as rec_error:
            print(f"Recognition error: {str(rec_error)}")
            return {"transcription": "", "error": f"Recognition error: {str(rec_error)}"}
    except Exception as e:
        print(f"Error in /speech-to-text: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"transcription": "", "error": str(e)}
    finally:
        # Clean up temporary files
        if tmp_file_path and os.path.exists(tmp_file_path):
            try:
                os.unlink(tmp_file_path)
            except:
                pass
        if wav_file_path and os.path.exists(wav_file_path) and wav_file_path != tmp_file_path:
            try:
                os.unlink(wav_file_path)
            except:
                pass

@app.post("/text-to-speech")
async def text_to_speech(request: Request):
    try:
        data = await request.json()
        inputs = data.get("inputs", [])
        target_language_code = data.get("target_language_code", "en")
        
        if not inputs or len(inputs) == 0:
            raise HTTPException(status_code=400, detail="No text provided")
        
        # Combine all inputs into a single text
        text = " ".join(inputs)
        
        # Extract language code (e.g., "en-IN" -> "en")
        lang_code = target_language_code.split("-")[0] if "-" in target_language_code else target_language_code
        
        # Generate speech using gTTS
        tts = gTTS(text=text, lang=lang_code, slow=False)
        
        # Save to bytes buffer
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        
        # Return audio file
        return Response(
            content=audio_buffer.read(),
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=speech.mp3"}
        )
    except Exception as e:
        print(f"Error in /text-to-speech: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")

@app.get("/health")
async def health():
    return {"status": "ok", "message": "Server is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
