from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import requests
import cohere
import wikipediaapi

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

PROMPT1 = """
Given a lecture transcript, return the key words in the lecture. 

Transcript: Whole cashflows are just buy something and then you get money later. But in reality and later on in this course, there are more complicated versions that have payments that come every two months. You get an interest payment or you have to pay something, or you get a dividend or things. So there are more complicated versions of cashflows. So helpful technique to figure out how to calculate the net present value, which is what we're going to try to do is figure out the present value of all these cash flows. 
Keywords: Cashflow, interest payment, dividend, present value
--
Transcript: Through it. I have a I don't want to quite call it elevated to the level of a parable, but it's a story in my life that I reference all the time. I'll share it with you, short. I'm in high school. I'm junior in high school, and I want to take calculus. Now, if you didn't know, calculus is way different, way more different from algebra than algebra is from arithmetic. Okay, so whatever it took you to get from arithmetic to algebra, what X? What number is it? What could be any number. How could it be any number? It's in the equation.
Keywords: High school, Calculus, Algebra, Arithmetic, Number, Equation
--
Transcript: ook, let's say you're socially anxious, okay? So what happens when you're socially anxious? You go to a party, your heart is beating. Why? The party is a monster. Why? Because it's judging you. You and it's putting you low down the dominance hierarchy, because that's what a negative judgment is, and that interferes with your sexual success. And that means that you're being harshly evaluated by nature itself. So you are confronting the dragon of chaos when you go into the social situation. And so what do you do? You're like this. You hunch over, and that's low dominance. I'm no threat. It's like, oh, that's not going
Keywords: Anxiety, Judgement, Social
--
Transcript: 
"""
@app.post("/wiki")
def wiki(topic):
    wiki_wiki = wikipediaapi.Wikipedia('en')
    
    page_py = wiki_wiki.page(topic)
    if page_py.exists():
        return({topic: page_py.fullurl})
    else:
        return {}


@app.post("/")
def read_root():
    return {"Hello": "World"}
@app.post("/entityrecognition")
def entityRecognition(transcript: str): 
    co = cohere.Client('LXa6tCc1qEGSshUxwewWPOJo5HcJ81tW5rkd01Jr')

    engineered_prompt = PROMPT1 + transcript + "\n\nKeywords:"
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
    wiki_wiki = wikipediaapi.Wikipedia('en')
    output = {}
    words = text.split(',')
    
    for word in words:
    
        word = word.strip()
        page_py = wiki_wiki.page(word)
    
        if page_py.exists():
            output[word] = page_py.fullurl
    return output
    

@app.post("/summarize/")
def summarize(transcript: str):
    co = cohere.Client('LXa6tCc1qEGSshUxwewWPOJo5HcJ81tW5rkd01Jr')

    engineered_prompt = PROMPT + transcript + "\n--\nTLDR: "
    
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
    return {"text": text}

   
    
@app.post("/token/")
def getToken():
    PARAMS = {'expires_in':36000}
    HEADERS = {'authorization':'1298b52db56e479f8363db36d5c0e8dc'} 
    response = requests.post('https://api.assemblyai.com/v2/realtime/token', headers = HEADERS, json=PARAMS)
    print(response.json())
    return response.json()


