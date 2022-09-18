from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import requests
import cohere

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROMPT = """
Passage: Welcome to CS 61A! Lecture will begin at 2:10pm. Until then, you just get to watch us type. Looking for something to do? Try reading the "Syllabus" link at the top of cs61a.org. Feel free to ask questions in the Zoom chat.

TLDR: We will be starting lecture soon.
--
Passage:  Midterm One is Monday and homework and the hog party are meant to help you get ready for Midterm One. We've posted out description of the logistics. You should read that. You will be provided with a printed copy of the Midterm One Study guide. Of Sliders from the lectures. So that if you ever want to look up evaluation rule or execution rule for particular kind of expression or statement, you can do that.

TLDR: Midterm One is coming up. Read the logistics. You will have a study guide during the exam.
--
Passage: The National Weather Service announced Tuesday that a freeze warning is in effect for the Bay Area, with freezing temperatures expected in these areas overnight. Temperatures could fall into the mid-20s to low 30s in some areas. In anticipation of the hard freeze, the weather service warns people to take action now.

TLDR: A hard freeze is expected in the Bay Area overnight.
--
Passage:
"""


@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/summarize/")
def summarize(transcript: str):
    print("SDFDSG", str)
    co = cohere.Client('LXa6tCc1qEGSshUxwewWPOJo5HcJ81tW5rkd01Jr')

    engineered_prompt = PROMPT + transcript + "\n\nTLDR: "
    
    response = co.generate(
        model='large',
        prompt=engineered_prompt,
        stop_sequences=['--'],
        max_tokens=50,
        temperature=0.92,
        num_generations=1,
    )
    
    text = response.generations[0].text
    if "\n" in text:
        text = text[:text.index("\n")]
    print(text)
    return {"text": text}
    
@app.get("/token/")
def getToken():
    PARAMS = {'expires_in':36000}
    HEADERS = {'authorization':'1298b52db56e479f8363db36d5c0e8dc'} 
    response = requests.post('https://api.assemblyai.com/v2/realtime/token', headers = HEADERS, json=PARAMS)
    print(response.json())
    return response.json()

