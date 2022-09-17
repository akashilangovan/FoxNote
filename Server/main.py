from fastapi import FastAPI, File, UploadFile
import requests
app = FastAPI()

PROMPT = """
Passage: Is Wordle getting tougher to solve? Players seem to be convinced that the game has gotten harder in recent weeks ever since The New York Times bought it from developer Josh Wardle in late January. The Times has come forward and shared that this likely isn’t the case. That said, the NYT did mess with the back end code a bit, removing some offensive and sexual language, as well as some obscure words There is a viral thread claiming that a confirmation bias was at play. One Twitter user went so far as to claim the game has gone to “the dusty section of the dictionary” to find its latest words.

TLDR: Wordle has not gotten more difficult to solve.
--
Passage: ArtificialIvan, a seven-year-old, London-based payment and expense management software company, has raised $190 million in Series C funding led by ARG Global, with participation from D9 Capital Group and Boulder Capital. Earlier backers also joined the round, including Hilton Group, Roxanne Capital, Paved Roads Ventures, Brook Partners, and Plato Capital.

TLDR: ArtificialIvan has raised $190 million in Series C funding.
--
Passage: The National Weather Service announced Tuesday that a freeze warning is in effect for the Bay Area, with freezing temperatures expected in these areas overnight. Temperatures could fall into the mid-20s to low 30s in some areas. In anticipation of the hard freeze, the weather service warns people to take action now.

TLDR: A hard freeze is expected in the Bay Area overnight.
--
Passage:
"""

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/summarize/")
def summarize(transcript: str):
    import cohere
    co = cohere.Client('LXa6tCc1qEGSshUxwewWPOJo5HcJ81tW5rkd01Jr')

    engineered_prompt = PROMPT + transcript + "\n\nTLDR:"
    
    response = co.generate(
    model='large',
    prompt=engineered_prompt,
    stop_sequences=['--'],
    max_tokens=50,
    temperature=0.65,
    num_generations=1,
    )
@app.post("/token/")
def getToken():
    PARAMS = {'expires_in':3600}
    HEADERS = {'authorization':'1298b52db56e479f8363db36d5c0e8dc'} 
    response = requests.post('https://api.assemblyai.com/v2/realtime/token', headers = HEADERS, json=PARAMS)
    return response.json()

