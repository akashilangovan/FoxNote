from fastapi import FastAPI, File, UploadFile

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/summarize/")
def summarize(transcript: str):
    import cohere
    co = cohere.Client('LXa6tCc1qEGSshUxwewWPOJo5HcJ81tW5rkd01Jr')

    response = co.generate(
    model='large',
    prompt=transcript,
    return_likelihoods = 'GENERATION',
    stop_sequences=['"'],
    max_tokens=50,
    temperature=0.2,
    num_generations=1,
    k=0,
    p=0.75)

    return {response.generations[0].text}


