from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
import base64
from typing import List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="RAM Chatbot API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class ChatRequest(BaseModel):
    message: str

# Response model
class ChatResponse(BaseModel):
    reply: str

# Node.js microservice URL
NODE_SERVICE_URL = "http://localhost:3001"

@app.get("/")
async def root():
    return {"message": "RAM Chatbot API is running"}

@app.post("/chat")
async def chat(
    message: str = Form(""),
    files: List[UploadFile] = File(default=[])
):
    try:
        print(f"🔵 Received chat request: message='{message}', files={len(files)}")
        
        # Prepare files data for Node.js service
        files_data = []
        
        for i, file in enumerate(files):
            print(f"🔄 Processing file {i+1}: {file.filename} ({file.content_type})")
            content = await file.read()
            file_data = {
                "filename": file.filename,
                "content_type": file.content_type,
                "content": base64.b64encode(content).decode('utf-8')
            }
            files_data.append(file_data)
            await file.seek(0)  # Reset file pointer

        print(f"📤 Forwarding to Node.js: {len(files_data)} files")

        # Forward the message and files to Node.js microservice
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{NODE_SERVICE_URL}/generate",
                json={
                    "prompt": message,
                    "files": files_data
                },
                timeout=60.0  # Increased timeout for file processing
            )
            
            print(f"📥 Node.js response status: {response.status_code}")
            
            if response.status_code != 200:
                error_text = response.text
                print(f"❌ Node.js error: {error_text}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Error communicating with AI service: {error_text}"
                )
            
            data = response.json()
            print(f"✅ Successful response from Gemini")
            return ChatResponse(reply=data["reply"])
            
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail="AI service is currently unavailable"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
