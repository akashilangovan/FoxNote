## Inspiration
Taking high quality notes in a fast-paced environment such as lectures or business meetings can be daunting. One small distraction or typing error can leave you trying to play catch-up as your professor or manager speeds through the next set of important information. All of this is made even worse for slower typists. Thus, we have created a note-taking web application that assists in taking quick notes through the power of NLP.

## What it does
The FoxNote web application allows you to record hit the record button and watch as it generates a real-time transcript of the audio as well as succinct notes that you can edit on the fly. The live transcription is handled by AssemblyAI's API. We take this even further by regularly feeding chunks of the transcript into Cohere's NLP to summarize all the information to short and simple notes that you can edit or delete as you so wish.

## How we built it
The front-end of the web application is built using React. Upon pressing the record button, the application makes a call to AssemblyAI's Speech-to-Text API to begin real-time transcription of the audio. The client-side then stores chunks of the text to pass into our custom endpoint built using Python and FastAPI. This API serves as a wrapper around Cohere's API to allow for custom tweaking of the model's parameter for optimal results.

## Challenges we ran into
Our most major hurdle was figuring out how to convert audio into text in real-time. We first experimented with breaking down the audio input into small pieces (10 second clips) that we could pass to our back-end to further process. However, we soon realized this would introduce high amounts of latency so we decided to look further into it until we finally discovered we could make use of AssemblyAI's API to service our needs. Another challenge we faced was the optimization of the Cohere's NLP so that we would get the result we wanted. As it was our first time experimenting with NLP, we had to brute-force a lot of the tweaks until we were happy with the output.

## Accomplishments that we're proud of
Figuring out how to transcribe audio in real-time. None of us had previously worked with audio before and so it was challenging to figure out how to set up sockets pass the data through and then process it using pre-existing APIs. Programming aside, we were very happy with how we all came together to split up the work amongst all the member as formed together pretty late into the night.

## What we learned
Besides just figuring out how to make use of various sponsor APIs, we learned socket programming as well as building our own API through FastAPI. Not only that, but we learned a lot of small intricacies about React whilst trying to build out the front-end.

## What's next for FoxNote
There's a plethora of options in terms of expanding FoxNote's functionality. First and foremost, we could implement authentication and data persistence to store the user's notes so that they can revisit them later. Next, we could add entity extraction through Cohere's API to provide quick links to important information in the notes. Lastly, we could look to improve our model's parameters and content summarization techniques to further optimize the quick notes we generate.

## Video Demo
https://www.youtube.com/watch?v=wL0IyKfK0sU&ab_channel=AlamgirKhan
