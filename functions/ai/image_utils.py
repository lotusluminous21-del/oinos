from PIL import Image, ImageOps
import io
import logging
import math
import random

logger = logging.getLogger(__name__)

def get_tight_bbox(img, threshold=30):
    """Finds a tight bounding box for the content on a white background."""
    # Convert to grayscale
    gray = img.convert('L')
    # Invert so content is white on black background
    inverted = ImageOps.invert(gray)
    # Threshold to remove artifacts
    thresholded = inverted.point(lambda p: 255 if p > threshold else 0)
    return thresholded.getbbox()

def normalize_product_image(image_bytes: bytes, target_size: int = 1024, padding_ratio: float = 0.8) -> bytes:
    """
    Normalizes a product image by:
    1. Detecting the product's bounding box.
    2. Resizing the product to occupy a fixed ratio of the target canvas.
    3. Centering the product on a white background.
    """
    try:
        # Load image
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGBA to handle transparency if present
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
            
        # Try alpha channel first
        alpha = img.getchannel('A')
        bbox = alpha.getbbox()
        
        # If no alpha contrast, use color thresholding
        if not bbox or bbox == (0, 0, img.width, img.height):
            bbox = get_tight_bbox(img)
            
        if not bbox:
            logger.warning("Could not detect product bounding box. Returning original image.")
            return image_bytes
            
        # Crop to the detected product
        product = img.crop(bbox)
        
        # Calculate scaling to fit padding_ratio of target_size
        p_width, p_height = product.size
        scale = (target_size * padding_ratio) / max(p_width, p_height)
        
        new_width = int(p_width * scale)
        new_height = int(p_height * scale)
        
        # Resize product
        product = product.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Create target canvas (white background)
        canvas = Image.new('RGB', (target_size, target_size), (255, 255, 255))
        
        # Center the product
        offset = ((target_size - new_width) // 2, (target_size - new_height) // 2)
        
        # Paste
        if product.mode == 'RGBA':
            canvas.paste(product, offset, mask=product)
        else:
            canvas.paste(product, offset)
            
        # Save to bytes
        output = io.BytesIO()
        canvas.save(output, format='JPEG', quality=95)
        return output.getvalue()
        
    except Exception as e:
        logger.error(f"Failed to normalize image: {e}")
        return image_bytes

def _calculate_center_of_mass(alpha_channel: Image.Image) -> tuple[int, int]:
    """Calculate the visual center of mass of an alpha channel based on pixel density."""
    pixels = alpha_channel.load()
    width, height = alpha_channel.size
    
    x_sum = 0
    y_sum = 0
    total_alpha = 0
    
    for x in range(width):
        for y in range(height):
            alpha = pixels[x, y]
            if alpha > 0:
                x_sum += x * alpha
                y_sum += y * alpha
                total_alpha += alpha
                
    if total_alpha == 0:
        return width // 2, height // 2
        
    return int(x_sum / total_alpha), int(y_sum / total_alpha)

def normalize_studio_png(image_bytes: bytes, target_size: int = 1024, target_area_ratio: float = 0.35) -> bytes:
    """
    Normalizes a generated transparent PNG (Background Removed) by calculating its total Visual Weight
    (active opaque pixels) and scaling it to occupy a precise percentage of the canvas (target_area_ratio).
    It then perfectly centers the product based on its visual Center of Mass, preventing optical imbalances.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
            
        alpha = img.getchannel('A')
        bbox = alpha.getbbox()
        
        if not bbox:
            logger.warning("No opaque pixels found in PNG. Returning original.")
            return image_bytes
            
        # 1. Crop to geometric bounding box first to optimize scaling performance
        product = img.crop(bbox)
        p_alpha = product.getchannel('A')
        
        # 2. Calculate true active pixel area (Visual Weight)
        histogram = p_alpha.histogram()
        # Sum of pixels with alpha > 0. (Index 0 is purely transparent)
        active_pixels = sum(histogram[1:])
        
        if active_pixels <= 0: return image_bytes
        
        # 3. Scale based on Visual Weight target
        target_area = (target_size * target_size) * target_area_ratio
        
        # Area scale factor is square root of the ratio
        import math
        scale = math.sqrt(target_area / active_pixels)
        
        new_width = int(product.width * scale)
        new_height = int(product.height * scale)
        
        # Safety bound: ensure the product doesn't exceed 95% of the total canvas size geometrically
        max_dim = target_size * 0.95
        if new_width > max_dim or new_height > max_dim:
            geometric_scale = max_dim / max(new_width, new_height)
            new_width = int(new_width * geometric_scale)
            new_height = int(new_height * geometric_scale)
            
        product = product.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # 4. Calculate Center of Mass of the freshly scaled product
        scaled_alpha = product.getchannel('A')
        com_x, com_y = _calculate_center_of_mass(scaled_alpha)
        
        # 5. Create final transparent canvas
        canvas = Image.new('RGBA', (target_size, target_size), (0, 0, 0, 0))
        
        # 6. Paste aligned by Center of Mass (CoM maps to Canvas Center)
        canvas_center_x = target_size // 2
        canvas_center_y = target_size // 2
        
        paste_x = canvas_center_x - com_x
        paste_y = canvas_center_y - com_y
        
        canvas.paste(product, (paste_x, paste_y), mask=product)
        
        output = io.BytesIO()
        # Save as PNG to preserve transparency
        canvas.save(output, format='PNG', optimize=True)
        return output.getvalue()
        
    except Exception as e:
        logger.error(f"Failed to deeply normalize PNG: {e}", exc_info=True)
        return image_bytes

def apply_chroma_key(image_bytes: bytes, threshold: float = 0.15, softness: float = 0.1) -> bytes:
    """
    Advanced Chroma Key (Green Screen) removal using Pillow.
    Features:
    1. Adaptive Background Sampling: Samples corners to handle AI tone variations.
    2. Perceptual Distance: Uses a slightly weighted RGB distance for green sensitivity.
    3. Spill Suppression: Neutralizes green tint in semi-transparent areas (mists/splashes).
    4. Soft Alpha: Feathered edges for professional-grade transparency.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
            
        width, height = img.size
        pixels = img.getdata()
        
        # 1. Adaptive Sampling: Take samples from corners to find the "AI Green"
        # We sample small 5x5 blocks in corners and average
        corner_points = [(0,0), (width-5,0), (0,height-5), (width-5,height-5)]
        sampled_greens = []
        for cx, cy in corner_points:
            for x in range(cx, cx+5):
                for y in range(cy, cy+5):
                    if 0 <= x < width and 0 <= y < height:
                        r, g, b, _ = img.getpixel((x, y))
                        sampled_greens.append((r, g, b))
        
        if not sampled_greens:
            target_r, target_g, target_b = 0, 255, 0 # Fallback to pure green
        else:
            target_r = sum(p[0] for p in sampled_greens) / len(sampled_greens)
            target_g = sum(p[1] for p in sampled_greens) / len(sampled_greens)
            target_b = sum(p[2] for p in sampled_greens) / len(sampled_greens)
            
        logger.info(f"ChromaKey: Sampled background color: ({target_r:.1f}, {target_g:.1f}, {target_b:.1f})")

        new_pixels = []
        # Pre-calculate max distance for normalization (Euclidean max is ~441.67)
        max_dist = 442.0 
        
        for r, g, b, a in pixels:
            # 2. Perceptual Distance (Weighted to be more sensitive to Green differences)
            dr = r - target_r
            dg = g - target_g
            db = b - target_b
            
            # Weighted Euclidean distance: Green has higher weight in chroma keying context
            dist = math.sqrt(0.3*dr**2 + 0.5*dg**2 + 0.2*db**2) / max_dist
            
            # 3. Soft Alpha Masking
            if dist < threshold:
                new_alpha = 0
            elif dist > threshold + softness:
                new_alpha = a
            else:
                # Linear interpolation for the "soft" range
                fraction = (dist - threshold) / softness
                new_alpha = int(a * fraction)
            
            # 4. Spill Suppression (Critical for mists)
            # If the pixel is semi-transparent and green is dominant, suppress it
            if 0 < new_alpha < 255:
                # If green is the strongest channel, clip it to the average of others
                if g > r and g > b:
                    avg_other = (r + b) // 2
                    g = avg_other
            
            new_pixels.append((r, g, b, new_alpha))
            
        img.putdata(new_pixels)
        
        output = io.BytesIO()
        img.save(output, format='PNG')
        return output.getvalue()
        
    except Exception as e:
        logger.error(f"ChromaKey failed: {e}", exc_info=True)
        return image_bytes
