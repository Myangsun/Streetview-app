import os
import subprocess
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.requests import Request
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from gradio_client import Client
import gradio as gr
from gradioapp import demo


# # Connect
# client = Client("abidlabs/en2fr")
# # client = Client("https://bec81a83-5b5c-471e.gradio.live")

# # Predict
# result = client.predict("Hello")

# # def acapellify(audio_path):
# #     result = client.predict(audio_path, api_name="/predict")
# #     return result[0]

# print(result)

CUSTOM_PATH = "/gradioapp"
app = FastAPI()

origins = [
    "http://localhost:3000",
    "localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Sets the templates directory to the `build` folder from `npm run build`
# this is where you'll find the index.html file.
templates = Jinja2Templates(directory="../frontend/build")

class SPAStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope):
        response = await super().get_response(path, scope)
        if response.status_code == 404:
            response = await super().get_response('.', scope)
        return response

# Mounts the `static` folder within the `build` folder to the `/static` route.
app.mount('/static', SPAStaticFiles(directory="../frontend/build/static", html=True), 'static')


@app.get("/")
async def react_app(req: Request):
    return templates.TemplateResponse('index.html', { 'request': req })


app = gr.mount_gradio_app(app, demo, path=CUSTOM_PATH)
