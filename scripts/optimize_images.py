import os
from PIL import Image
import sys

def optimize_image(file_path):
    try:
        original_size = os.path.getsize(file_path)
        img = Image.open(file_path)
        
        # Base path without extension
        base_path = os.path.splitext(file_path)[0]
        new_file_path = base_path + ".webp"

        # Save as WebP with quality 80
        img.save(new_file_path, format='WebP', quality=80)
        
        new_size = os.path.getsize(new_file_path)
        saved = original_size - new_size
        
        # Remove original file if WebP was created successfully
        if os.path.exists(new_file_path) and new_file_path != file_path:
            os.remove(file_path)
            print(f"Converted {file_path} to {new_file_path}: {original_size} -> {new_size} bytes (Saved {saved} bytes, {saved/original_size:.2%})")
        else:
            print(f"Processed {file_path}: WebP creation failed or skipped.")
        
        return max(0, saved)
    except Exception as e:
        print(f"Error optimizing {file_path}: {e}")
        return 0

def main():
    directories = [
        r"c:\Users\lotus\Documents\pavlicevits\public\images\about",
        r"c:\Users\lotus\Documents\pavlicevits\public\images\homescreen",
        r"c:\Users\lotus\Documents\pavlicevits\public\images\services"
    ]
    
    total_saved = 0
    file_count = 0
    
    for directory in directories:
        if not os.path.exists(directory):
            print(f"Directory not found: {directory}")
            continue
            
        print(f"\nProcessing directory: {directory}")
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                    file_path = os.path.join(root, file)
                    total_saved += optimize_image(file_path)
                    file_count += 1
                    
    print(f"\nTotal files processed: {file_count}")
    print(f"Total space saved: {total_saved} bytes ({total_saved / 1024 / 1024:.2f} MB)")

if __name__ == "__main__":
    main()
