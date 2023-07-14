import gradio as gr
import numpy as np
import torch
import transformers
from diffusers import StableDiffusionInpaintPipeline
from PIL import Image
from segment_anything import sam_model_registry, SamPredictor
import matplotlib.pyplot as plt
from datetime import datetime

import os
import json

sam_checkpoint = "sam_vit_h_4b8939.pth"
model_type = "vit_h"

device = "cuda"

sam = sam_model_registry[model_type](checkpoint=sam_checkpoint)
sam.to(device)

predictor = SamPredictor(sam)

pipe = StableDiffusionInpaintPipeline.from_pretrained(
    "models--stabilityai--stable-diffusion-2-inpainting/snapshots/6ba40839c3c171123b2b863d16caf023e297abb9", torch_dtype=torch.float16,)
pipe = pipe.to(device)

def plot_points(coords, labels, ax, marker_size=375):
    print(f'coords shape: {coords.shape}')
    print(f'labels shape: {labels.shape}')

    pos_points = coords[labels == 1]
    neg_points = coords[labels == 0]
    
    print(f'pos_points shape: {pos_points.shape}')
    print(f'neg_points shape: {neg_points.shape}')
    
    ax.scatter(pos_points[:, 0], pos_points[:, 1], color='green', marker='.', s=marker_size, edgecolor='white', linewidth=1.25)
    ax.scatter(neg_points[:, 0], neg_points[:, 1], color='red', marker='.', s=marker_size, edgecolor='white', linewidth=1.25)

selected_pixels = []
selected_labels = []
current_label = 1

with gr.Blocks() as demo:
    with gr.Row():
        gr.Markdown("## <center>ReCityGen</center>")
    with gr.Row():
        user_name = gr.Textbox(lines=1, label="User Name",
                               placeholder="Enter User ID")
    with gr.Row():
        input_img_o = gr.Image(label="Input")
    with gr.Row():
        upload_button = gr.Button(label="Upload", value="Upload")
    with gr.Row():
        input_img = gr.Image(label="Resized")
        mask_img = gr.Image(label="Mask", source="upload", tool="sketch")
        mask_img_with_label = gr.Plot()
    with gr.Blocks():
        gr.Markdown("#### Edit Masks")
        with gr.Row():
            add_button = gr.Button(label="Add Mask", value=" + ")
            remove_button = gr.Button(label="Remove Area", value=" - ")
        with gr.Row():
            reset_button = gr.Button(label="Reset", value="Reset")
    with gr.Row():
        output_img = gr.Image(label="Output")
    with gr.Blocks():
        prompt_text = gr.Textbox(lines=1, label="Prompt")
    with gr.Row():
        generateBtn = gr.Button("生成")
    with gr.Row():
        sumbit = gr.Button("提交")
    with gr.Row():
        survey = gr.Textbox(
            label="Survey", placeholder="Survey link: https://www.google.com", disabled=True)
        
    def on_upload_button_clicked(image):
        # Convert np.array image to PIL Image
        image = Image.fromarray(image)
        width, height = image.size
        min_dim = min(width, height)
        left = (width - min_dim)/2
        top = (height - min_dim)/2
        right = (width + min_dim)/2
        bottom = (height + min_dim)/2
        
        image = image.crop((left, top, right, bottom))
        
        image_resized = image.resize((512, 512),Image.ANTIALIAS)
        return image_resized

    def on_add_button_clicked():
        #print('Add Button Clicked!')
        global current_label
        current_label = 1
        #print(current_label)

    def on_remove_button_clicked():
        #print('Remove Button Clicked!')
        global current_label
        current_label = 0
        #print(current_label)


    def reset_mask(mask_img, output_img):
        global selected_pixels, selected_labels
        selected_pixels = []
        selected_labels = []
        mask_img = None
        output_img = None
        return mask_img, output_img
        

    def generate_mask(image, evt: gr.SelectData):
        #print(evt.index)
        selected_pixels.append(evt.index)
        selected_labels.append(current_label)

        predictor.set_image(image)
        input_points = np.array(selected_pixels)
        input_labels = np.array(selected_labels)

#         print(selected_labels)
#         print(input_labels)

        mask, _, _ = predictor.predict(
            point_coords=input_points,
            point_labels=input_labels,
            multimask_output=False
        )

        mask = Image.fromarray(mask[0, :, :])

        # print("Generated Mask:", mask)

        return mask

    def show_points(image):
        global selected_pixels
        global selected_labels

        input_points = np.array(selected_pixels)
        input_labels = np.array(selected_labels)
        img = np.asarray(image)
        # print(img.shape)

        # Set Canvas Size equal to UI Component boundary
        fig = plt.figure(figsize=(5,5))

        plt.imshow(img)

        # Hide Axis
        plt.axis('off')
        plot_points(input_points, input_labels, plt.gca())
        # show_mask(mask_img, plt.gca())

        return fig


    def inpaint(image, mask, prompt):
        # print(image)
        image = Image.fromarray(image)
        # print(mask)
        mask = Image.fromarray(mask["image"])

        image = image.resize((512, 512))
        mask = mask.resize((512, 512))

        output = pipe(
            prompt=prompt,
            image=image,
            mask_image=mask,
        ).images[0]
        # print(output)
        return output

    def saveFile(user_name, image, mask, output, prompt):
        if user_name == "":
            print('Please enter a user name to proceed.')

        now = datetime.now()
        timestamp = now.strftime("%Y%m%d_%H%M%S")

        # create a subdirectory for each user
        subdir = f'../../output/{user_name}_{timestamp}'
        if not os.path.exists(subdir):
            os.makedirs(subdir)

        img_filename = f'{subdir}/{user_name}_{timestamp}_input.png'
        mask_filename = f'{subdir}/{user_name}_{timestamp}_mask.png'
        output_filename = f'{subdir}/{user_name}_{timestamp}_output.png'
        prompt_filename = f'{subdir}/{user_name}_{timestamp}_prompt.txt'

        Image.fromarray(image).save(img_filename)
        Image.fromarray(mask["image"]).save(mask_filename)
        Image.fromarray(output).save(output_filename)

        with open(prompt_filename, 'w') as f:
            f.write(prompt)

        # Save user data in JSON file
        user_data = {
            'user_name': user_name,
            'timestamp': timestamp,
            'prompt': prompt
        }
        
        json_filename = f'../../output/user_data.json'
        data = []

        # Load the existing data if file exists
        if os.path.exists(json_filename):
            with open(json_filename, 'r') as f:
                data = json.load(f)

        # Append new data
        data.append(user_data)

        # Write data back to file
        with open(json_filename, 'w') as f:
            json.dump(data, f, indent=4)

    upload_button.click(on_upload_button_clicked, [input_img_o], [input_img])
    add_button.click(on_add_button_clicked, [], [])
    remove_button.click(on_remove_button_clicked, [], [])
    reset_button.click(reset_mask, [mask_img, output_img], [mask_img, output_img])
    input_img.select(generate_mask,inputs=[input_img],outputs=[mask_img])
    input_img.select(show_points, inputs=[input_img],outputs=[mask_img_with_label])

    generateBtn.click(inpaint,
                 inputs=[input_img, mask_img, prompt_text],
                 outputs=[output_img],
                 )
    sumbit.click(saveFile,
                 inputs=[user_name, input_img, mask_img, output_img, prompt_text],outputs=[]
                 )
