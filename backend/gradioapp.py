import gradio as gr
import numpy as np
import torch
import transformers

# from diffusers import StableDiffusionInpaintPipeline
# from PIL import Image
# from segment_anything import sam_model_registry, SamPredictor

selected_pixels = []
with gr.Blocks() as demo:
    with gr.Row():
        gr.Markdown(
            '## Street view generator')
    with gr.Row():
        input_img = gr.Image(label="Input")
        mask_img = gr.Image(label="Mask", source="upload", tool="sketch")
    with gr.Blocks():
        gr.Markdown('#### Edit Masks')
        with gr.Row():
            add_button = gr.Button(label="Add Mask", value=" + ")
            remove_button = gr.Button(label="Remove Area", value=" - ")
        with gr.Row():
            Reset_button = gr.Button(label="Reset", value="Reset")
    with gr.Row():
        output_img = gr.Image(label="Output")
    with gr.Blocks():
        prompt_text = gr.Textbox(lines=1, label="Prompt")
    with gr.Row():
        submit = gr.Button("Submit")
