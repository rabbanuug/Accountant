import os
import sys
try:
    from PIL import Image
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

input_dir = "/home/ubuntu/projects/Accountant/mobile/raw_screenshots"
output_dir_iphone = "/home/ubuntu/projects/Accountant/mobile/appstore_screenshots/iphone"
output_dir_ipad = "/home/ubuntu/projects/Accountant/mobile/appstore_screenshots/ipad"

os.makedirs(output_dir_iphone, exist_ok=True)
os.makedirs(output_dir_ipad, exist_ok=True)

iphone_size = (1242, 2688)
ipad_size = (2048, 2732)

for filename in os.listdir(input_dir):
    if not filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        continue
    
    img_path = os.path.join(input_dir, filename)
    img = Image.open(img_path).convert('RGB')
    
    w, h = img.size
    
    # 1. Crop the top 4% to remove Android status bar (clock, icons)
    # 2. Crop the bottom 4% to remove Android navigation bar
    crop_top = int(h * 0.04)
    crop_bottom = int(h * 0.04)
    img_cropped = img.crop((0, crop_top, w, h - crop_bottom))
    
    # Let's use a standard dark navy background color that matches the app perfectly: (20, 27, 45) -> #141b2d
    bg_color = (20, 27, 45) # You could also do img_cropped.getpixel((0, 0)) but often gradient headers mess it up

    # Try setting strict background from middle top of cropped image to be safe
    # bg_color = img_cropped.getpixel((img_cropped.width // 2, 5))
    
    # Function to fit image into target size with background padding
    def fit_and_pad(target_size, image, bgcolor):
        tw, th = target_size
        scale = min(tw / image.width, th / image.height)
        new_w, new_h = int(image.width * scale), int(image.height * scale)
        
        resized = image.resize((new_w, new_h), Image.LANCZOS)
        
        canvas = Image.new('RGB', target_size, bgcolor)
        paste_x = (tw - new_w) // 2
        paste_y = (th - new_h) // 2
        
        canvas.paste(resized, (paste_x, paste_y))
        return canvas

    # --- iPhone ---
    iphone_canvas = fit_and_pad(iphone_size, img_cropped, bg_color)
    iphone_canvas.save(os.path.join(output_dir_iphone, filename))
    
    # --- iPad ---
    ipad_canvas = fit_and_pad(ipad_size, img_cropped, bg_color)
    ipad_canvas.save(os.path.join(output_dir_ipad, filename))

    print(f"Processed {filename}")

print("All screenshots generated successfully.")
