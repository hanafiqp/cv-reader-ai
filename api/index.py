from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from extract_cv import extract_cv_info

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/extract")
async def extract(file: UploadFile = File(...)):
    contents = await file.read()
    info = extract_cv_info(contents)
    return JSONResponse(info)