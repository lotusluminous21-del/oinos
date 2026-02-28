import time
import requests
import random
import base64
from firebase_admin import firestore

from core.llm_config import LLMConfig, ModelName
from core.logger import get_logger
from ..models import ProductState
from ..image_utils import normalize_product_image
from .metadata_agent import MetadataAgent

logger = get_logger(__name__)

class VisionAgent:
    """
    Responsible for Phase 2: Sourcing images, and Phase 3: Generating Studio Renders.
    """

    @staticmethod
    def source_images(doc_ref, data: dict):
        sku = data.get("sku", "")
        ai_data = data.get("ai_data", {})
        existing_images = ai_data.get("variant_images", {}).get("base", [])

        if existing_images:
            if len(existing_images) == 1:
                # Only one candidate, bypass QA to save time
                logger.info(f"VisionAgent: Only 1 candidate for {sku}. Proceeding directly.")
                best_img_url = existing_images[0]["url"]
                doc_ref.update({
                    "status": ProductState.GENERATING_STUDIO.value,
                    "ai_data.selected_images": {"base": best_img_url},
                    "enrichment_message": "Single image sourced automatically. Beginning Studio Generation."
                })
                return

            doc_ref.update({"enrichment_message": f"QA evaluating {len(existing_images)} image candidates..."})
            logger.info(f"VisionAgent: Running Multimodal QA on {len(existing_images)} candidates for {sku}...")

            from google.genai import types
            import json

            client = LLMConfig.get_client()
            
            # Download candidates (cap at 4 to save context and speed)
            max_candidates = min(len(existing_images), 4)
            image_parts = []
            valid_urls = []
            
            for i in range(max_candidates):
                try:
                    url = existing_images[i]["url"]
                    import html
                    url = html.unescape(url)
                    resp = requests.get(url, timeout=10, verify=False)
                    resp.raise_for_status()
                    # Add to parts array as explicitly numbered image
                    image_parts.extend([
                        types.Part.from_text(text=f"Image Index [{i}]:"),
                        types.Part.from_bytes(data=resp.content, mime_type="image/jpeg")
                    ])
                    valid_urls.append(url)
                except Exception as e:
                    logger.warning(f"Failed to fetch candidate image for QA: {e}")
                    
            if not valid_urls:
                doc_ref.update({
                    "status": ProductState.NEEDS_IMAGE_REVIEW.value,
                    "enrichment_message": "Failed to download candidate images. Please provide a manual source."
                })
                return

            if len(valid_urls) == 1:
                doc_ref.update({
                    "status": ProductState.GENERATING_STUDIO.value,
                    "ai_data.selected_images": {"base": valid_urls[0]},
                    "enrichment_message": "Only 1 valid candidate remained. Beginning Studio Generation."
                })
                return

            prompt = f"""You are a strict Data Quality Assurance AI for an e-commerce platform.
You are evaluating {len(valid_urls)} candidate images for a specific product.
Product Title: {ai_data.get('title', 'Unknown')}
Category: {ai_data.get('category', 'Unknown')}

Your job is to select the BEST single image to be used as the source for downstream 3D studio generation.
Criteria for the BEST image:
1. Highest resolution and sharpness.
2. Complete isolation (a clear shot of the single product, preferably on a white/clean background).
3. NO heavy text overlays, promotional banners, or thick watermarks crossing the product.
4. IDENTITY MATCH: The label on the product MUST accurately match the provided Product Title. Reject generic or incorrect products.

Analyze the provided images (labeled with their indices).
Output valid JSON complying with the schema provided.
- `best_index`: The integer index of the winning image.
- `confidence`: A float between 0.0 and 1.0 indicating how confident you are that this image is clean, correct, and high quality.
- `reasoning`: A brief explanation of why you chose this image over the others, or why confidence is low.
"""

            try:
                response = client.models.generate_content(
                    model=LLMConfig.get_model_name(complex=False),
                    contents=[
                        types.Content(role="user", parts=[types.Part.from_text(text=prompt)] + image_parts)
                    ],
                    config=types.GenerateContentConfig(
                        temperature=0.0,
                        response_mime_type="application/json",
                        response_schema={
                            "type": "OBJECT",
                            "properties": {
                                "best_index": {"type": "INTEGER"},
                                "confidence": {"type": "NUMBER"},
                                "reasoning": {"type": "STRING"}
                            },
                            "required": ["best_index", "confidence", "reasoning"]
                        }
                    )
                )

                result_text = response.text
                if result_text.startswith("```json"):
                    result_text = result_text.replace("```json\n", "").replace("\n```", "")
                
                qa_data = json.loads(result_text)
                best_idx = qa_data.get("best_index", 0)
                confidence = qa_data.get("confidence", 0.0)
                reasoning = qa_data.get("reasoning", "")
                
                logger.info(f"Multimodal QA Result for {sku}: Selected {best_idx} with Confidence {confidence}. Reason: {reasoning}")
                
                # Ensure index is within bounds of successfully downloaded images
                if best_idx < 0 or best_idx >= len(valid_urls):
                    best_idx = 0

                if confidence >= 0.70:
                    doc_ref.update({
                        "status": ProductState.GENERATING_STUDIO.value,
                        "ai_data.selected_images": {"base": valid_urls[best_idx]},
                        "enrichment_message": f"QA Confident ({int(confidence*100)}%): {reasoning}"
                    })
                else:
                    doc_ref.update({
                        "status": ProductState.NEEDS_IMAGE_REVIEW.value,
                        "ai_data.selected_images": {"base": valid_urls[best_idx]}, # Pre-fill the best guess
                        "enrichment_message": f"QA Flagged (Confidence {int(confidence*100)}%): {reasoning} - Review needed."
                    })
                return

            except Exception as e:
                logger.error(f"Multimodal QA Failed for {sku}: {e}")
                # Fallback to interactive review if QA crashes
                doc_ref.update({
                    "status": ProductState.NEEDS_IMAGE_REVIEW.value,
                    "enrichment_message": "Automatic QA analysis failed. Please select an image manually."
                })
                return
                
        # If no candidates at all
        logger.warning(f"VisionAgent: No images found for {sku}. Re-evaluating text or flagging for manual review.")
        doc_ref.update({
            "status": ProductState.NEEDS_IMAGE_REVIEW.value,
            "enrichment_message": "No web images found. Please provide a manual source image."
        })

    @staticmethod
    def _upload_to_storage(image_bytes: bytes, mime_type: str, sku: str, suffix: str) -> str:
        from firebase_admin import storage
        try:
            bucket = storage.bucket()
            blob_path = f"generated-images/{sku}/studio_{suffix}.jpg"
            blob = bucket.blob(blob_path)
            blob.cache_control = "no-cache, max-age=0"
            blob.upload_from_string(image_bytes, content_type=mime_type)
            blob.make_public()
            return blob.public_url
        except Exception as e:
            logger.error(f"Failed to upload image {suffix} for {sku}: {e}")
            raise e

    @staticmethod
    def _generate_with_retry(client, model, contents, config, retries=6, initial_delay=4.0):
        """Wraps Gemini generate_content with exponential backoff for 429 errors."""
        delay = initial_delay
        for attempt in range(retries + 1):
            try:
                return client.models.generate_content(
                    model=model,
                    contents=contents,
                    config=config
                )
            except Exception as e:
                error_str = str(e)
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    if attempt < retries:
                        sleep_time = delay + random.uniform(1.0, 4.0) # Add larger jitter
                        logger.warning(f"Rate limited (429). Retrying in {sleep_time:.2f}s... (Attempt {attempt+1}/{retries})")
                        time.sleep(sleep_time)
                        delay = min(delay * 2.0, 60.0) # Exponential backoff with cap
                        continue
                raise e

    @staticmethod
    def generate_studio(doc_ref, data: dict):
        sku = data.get("sku", "")
        ai_data = data.get("ai_data", {})
        
        selected_images = ai_data.get("selected_images", {})
        source_url = selected_images.get("base")
        if not source_url and selected_images:
            first_key = next(iter(selected_images))
            source_url = selected_images[first_key]
            
        if not source_url:
            logger.error(f"VisionAgent: Studio generation triggered for {sku} without a source image.")
            doc_ref.update({
                "status": ProductState.NEEDS_IMAGE_REVIEW.value,
                "enrichment_message": "Missing source image. Provide one to resume."
            })
            return

        generation_model = ai_data.get("generation_model", "gemini") # "gemini" or "imagen"
        environment = ai_data.get("environment", "styled")
        category = ai_data.get("category", "Άλλο")
        variants = ai_data.get("variants", [])
        technical_specs = ai_data.get("technical_specs", {})
        finish_raw = technical_specs.get("finish", "")
        
        # Translate finish into aesthetic directions
        finish_instruction = ""
        if finish_raw in ["Ματ", "Σατινέ", "Σαγρέ/Ανάγλυφο"]:
            finish_instruction = "The liquid splashes and decorative elements MUST have a smooth, matte, light-absorbing finish with completely diffused, non-reflective highlights."
        elif finish_raw in ["Γυαλιστερό", "Υψηλής Γυαλάδας"]:
            finish_instruction = "The liquid splashes and decorative elements MUST possess a highly glossy, wet, and deeply reflective finish with sharp specular highlights."
        elif finish_raw in ["Μεταλλικό", "Πέρλα"]:
            finish_instruction = "The liquid splashes and decorative elements MUST feature a sparkling, metallic finish infused with micro-reflective pearlescent flakes that catch the light dynamically."
        
        color_instruction = "Sample and directly replicate the product's dominant brand label colors into the visual accents. "
        if finish_instruction:
            color_instruction += finish_instruction
            
        decorative_effect = "mild decorative crown of high-viscosity glossy liquid splashes"
        if category == "Σπρέι Βαφής":
            decorative_effect = "mild decorative crown of high-velocity, fine aerosol-like mist and dynamic glossy droplets"
        elif category == "Χρώματα":
            decorative_effect = "mild decorative crown of high-viscosity, thick liquid paint splashes and bold waves"
        elif category == "Ρητίνες":
            decorative_effect = "mild decorative crown of smooth, crystalline, semi-transparent liquid resin waves"
        elif category == "Στόκοι":
            decorative_effect = "subtle, thick matte textured material crests and smooth paste-like ripples"
        elif category == "Πινέλα & Ρολά":
            decorative_effect = "dynamic, sweeping artistic paint brush-strokes playfully wrapping around the base"
        elif category == "Εργαλεία & Αξεσουάρ":
            decorative_effect = "subtle, dynamic ambient light-sweeps and minimal high-viscosity droplet accents"
        elif category == "Διαλυτικά":
            decorative_effect = "mild decorative crown of crisp, clear, volatile liquid ripples and sharp translucent splashes"
        elif category == "Καθαριστικά":
            decorative_effect = "gentle decorative crown of fresh, sparkling micro-bubbles and clear fluid sweeps"

        sizing_instruction = "The product must be tightly center-framed, occupying exactly 80% of the vertical canvas height."
        
        NANO_PROMPTS = {
            "clean": f"Using the provided image ONLY as a reference for the product's labels, colors, and shape, generate a BRAND NEW photography with these exact rules:\n1.  **COMMAND**: Ignore the camera angle, perspective, and lighting of the source image. Re-render the product from scratch, resting on an **invisible, seamless pure white studio floor**.\n2.  **NEGATIVE INSTRUCTIONS**: DO NOT inherit the tilt, depth of field, or shadow placement from the original photo. **Wipe out all original specular highlights.** No visible pedestals or platforms.\n3.  **Composition & Angle**: Show the product from a straight-on, front-facing eye-level angle. Center it vertically/horizontally. {sizing_instruction} Full visibility (not cut off).\n4.  **Lighting & style**: Use soft, even, high-key studio lighting. **The floor and background must be identical pure white (#FFFFFF), with only a realistic soft shadow at the base to indicate the surface.** Generate new, clean geometric highlights from studio softboxes on the product.\n5.  **Subject Isolation**: EXTRACT A SINGLE ITEM. If the source shows multiple items, generate ONLY ONE single item. Do not show a group.\n6.  **Identity Accuracy**: PRESERVE THE IDENTITY (text, labels, logos, colors). Ensure all text on the label is legible and identical to the source, but allow the product's physical orientation to be corrected to the straight-on angle defined in Point 3.\n7.  **Background**: Pure white (#FFFFFF) background with NO texture.",
            "realistic": f"Using the provided image ONLY as a reference for the product's labels, colors, and shape, generate a BRAND NEW photography with these exact rules:\n1.  **COMMAND**: Ignore the camera angle, perspective, and lighting of the source image. Re-render the product from scratch.\n2.  **NEGATIVE INSTRUCTIONS**: DO NOT inherit the lighting direction or camera tilt from the source.\n3.  **Composition & Lighting**: Side-on natural daylight creating realistic soft shadows. Show the product from a straight-on, eye-level angle. {sizing_instruction}\n4.  **Atmosphere**: Clean, light-grey polished concrete surface. Background is a softly blurred, minimalist workshop setting.\n5.  **Identity Accuracy**: Keep the branding and labels EXACTLY as they appear — preserve all text and logos, but render them from the new straight-on perspective.\n6.  **Aesthetic**: Authentic, premium yet practical workshop vibe.",
            "styled": f"Using the provided image ONLY as a reference for the product's labels, colors, and shape, generate a BRAND NEW photography with these exact rules:\n1.  **COMMAND**: Ignore the camera angle, perspective, and lighting of the source image. Re-render the product from scratch, resting on an **invisible, seamless pure white studio floor**.\n2.  **NEGATIVE INSTRUCTIONS**: DO NOT follow the orientation or perspective of the original image. **Completely discard original lighting and reflections.** No visible pedestals or platforms.\n3.  **Composition & Camera**: Straight-on, front-facing eye-level angle. Center vertically/horizontally. {sizing_instruction}\n4.  **Vibrant Lighting**: Professional multi-point studio lighting with subtle rim lighting. **The product surface must actively capture sharp reflections from the surrounding visual elements.**\n5.  **Explosive Visuals**: SURROUND the product with a {decorative_effect}. {color_instruction}\n6.  **Identity Accuracy**: Extract the main product unit. PRESERVE THE BRANDING AND TEXT Identity, but re-render the physical position to be straight-on.\n7.  **Background**: Pure white (#FFFFFF) background; the floor and background are the same color, differentiated only by the product's soft contact shadow and the decorative accents.\n8.  **Aesthetic**: Tech-premium, sharp focus, high contrast with vibrant decorative accents."
        }

        IMAGEN_PROMPTS = {
            "clean": f"Ultra-sharp professional studio product photography. The product is center-framed and resting on a seamless, invisible pure white studio floor in a high-key, pure white setting. {sizing_instruction} Lighting: **Recalibrated** clean 5500K daylight spectrum softbox lighting; the floor and background merge perfectly into #FFFFFF, with only a **soft, realistic ambient occlusion shadow at the base**. No pedestals. New geometric highlights override the original image lighting.",
            "realistic": f"Professional cinematic product photography. The product sits on a high-texture, dark-grey polished concrete surface with realistic micro-reflections. {sizing_instruction} Environment: A minimalist, high-end design workshop with soft, volumetric natural daylight streaming from a side window. Lighting: Warm 4000K sunlight with subtle lens bloom and soft, elongated natural shadows. Camera: 50mm f/1.8 depth of field, sharp focus on the product label with a creamy background blur.",
            "styled": f"High-end commercial avant-garde photography. The product rests on an invisible white studio floor and is surrounded by a {decorative_effect}. {color_instruction} {sizing_instruction} Lighting: **Environment-driven** tech-premium setup; the floor and background merge into pure #FFFFFF. The product surface must **reflect the colors from the surrounding elements**, replacing original specular highlights. Shadow: Soft, subtle contact shadow at the base."
        }
        
        unique_colors = set()
        for v in variants:
            color = v.get("option1_value") if v.get("option1_name") == "Χρώμα" else None
            if not color:
                color = v.get("option2_value") if v.get("option2_name") == "Χρώμα" else None
            if color:
                unique_colors.add(color)

        try:
            client = LLMConfig.get_image_client()
            generated_images = {}
            
            logger.info(f"VisionAgent: Downloading source for {sku} from {source_url}...")
            import html
            source_url = html.unescape(source_url)
            img_resp = requests.get(source_url, timeout=15, verify=False)
            img_resp.raise_for_status()
            image_data = img_resp.content
            
            doc_ref.update({"enrichment_message": "Optimizing frame & perspective..."})
            image_data = normalize_product_image(image_data)
            mime_type = "image/jpeg"
            
            image_url = None
            base_image_bytes = None

            from google.genai import types

            if generation_model == "imagen":
                logger.info(f"VisionAgent: Calling Imagen Recontext for {sku} (env={environment})...")
                prompt = IMAGEN_PROMPTS.get(environment, IMAGEN_PROMPTS["clean"])
                doc_ref.update({"enrichment_message": "Re-contextualizing with Imagen..."})
                
                try:
                    from google.auth import default, transport
                    
                    region = LLMConfig.REGION
                    project_id = LLMConfig.PROJECT_ID
                    model_id = ModelName.IMAGE_RECONTEXT.value
                    
                    endpoint = f"https://{region}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{region}/publishers/google/models/{model_id}:predict"
                    
                    imagen_retries = 5
                    for attempt in range(imagen_retries + 1):
                        try:
                            # Removed forced 60s sleep since we're in us-central1 and have higher capacity
                            # Handle rate limits dynamically via backoff instead
                            if attempt == 0:
                                pass
                            
                            creds, project = default()
                            auth_req = transport.requests.Request()
                            creds.refresh(auth_req)
                            
                            payload = {
                                "instances": [{"prompt": prompt, "productImages": [{"image": {"bytesBase64Encoded": base64.b64encode(image_data).decode("utf-8")}}] }],
                                "parameters": {"sampleCount": 1, "addWatermark": False, "seed": random.randint(1, 1000000), "enhancePrompt": False}
                            }
                            
                            headers = {"Authorization": f"Bearer {creds.token}", "Content-Type": "application/json"}
                            
                            response = requests.post(endpoint, json=payload, headers=headers, timeout=60)
                            response.raise_for_status()
                            resp_json = response.json()
                            
                            if "predictions" in resp_json and len(resp_json["predictions"]) > 0:
                                pred = resp_json["predictions"][0]
                                if "bytesBase64Encoded" in pred:
                                    img_bytes = base64.b64decode(pred["bytesBase64Encoded"])
                                    image_url = VisionAgent._upload_to_storage(img_bytes, "image/jpeg", sku, "base")
                                    base_image_bytes = img_bytes
                            
                            break # Success! Break out of the retry loop
                                    
                        except Exception as ie:
                            error_str = str(ie)
                            if ("429" in error_str or "RESOURCE_EXHAUSTED" in error_str) and attempt < imagen_retries:
                                base_delay = min(10.0 * (2 ** attempt), 60.0)
                                sleep_time = base_delay + random.uniform(2.0, 10.0)
                                logger.warning(f"Imagen Rate limited (429). Sleeping {sleep_time:.1f}s... (Attempt {attempt+1}/{imagen_retries})")
                                time.sleep(sleep_time)
                            else:
                                raise ie # Raise if retries exhausted or not 429
                                
                except Exception as ie:
                    logger.error(f"Imagen Recontext API call failed: {ie}")
                    raise ie

            else: # Gemini Flash Image
                logger.info(f"VisionAgent: Calling Gemini Studio for {sku} (env={environment})...")
                prompt = NANO_PROMPTS.get(environment, NANO_PROMPTS["clean"])
                doc_ref.update({"enrichment_message": "Synthesizing studio lighting..."})
                
                response = VisionAgent._generate_with_retry(
                    client=client,
                    model=LLMConfig.get_image_model_name(),
                    contents=[
                        types.Content(
                            role="user",
                            parts=[
                                types.Part.from_bytes(data=image_data, mime_type=mime_type),
                                types.Part.from_text(text=prompt)
                            ]
                        )
                    ],
                    config=types.GenerateContentConfig(temperature=0.3, seed=random.randint(1, 1000000)),
                    retries=6, initial_delay=5.0
                )
                
                if hasattr(response, 'generated_image') and response.generated_image:
                    image_url = response.generated_image.url
                    base_image_bytes = requests.get(image_url).content
                    generated_images["base"] = image_url
                elif response.candidates and response.candidates[0].content.parts:
                    doc_ref.update({"enrichment_message": "Generating high-fidelity visual..."})
                    img_bytes = None
                    for part in response.candidates[0].content.parts:
                        if part.inline_data:
                            img_bytes = part.inline_data.data
                            break
                    if img_bytes:
                        time.sleep(1)
                        doc_ref.update({"enrichment_message": "Finalizing render..."})
                        time.sleep(0.5)
                        image_url = VisionAgent._upload_to_storage(img_bytes, "image/jpeg", sku, "base")
                        base_image_bytes = img_bytes

            if image_url:
                generated_images["base"] = image_url
            else:
                raise Exception("Failed to generate Base Studio image")
            
            # --- Variant Recoloring ---
            if unique_colors and base_image_bytes:
                doc_ref.update({"enrichment_message": f"Rendering {len(unique_colors)} variant colors..."})
                logger.info(f"VisionAgent: Starting semantic recoloring for {len(unique_colors)} variants of {sku}")
                
                for color_name in unique_colors:
                    try:
                        # Safety Check: Did the user abort or delete this product while we were generating?
                        current_snap = doc_ref.get()
                        if not current_snap.exists:
                            raise Exception("Product was deleted during semantic recoloring.")
                        if current_snap.to_dict().get("status") in ["FAILED", "ABORTED"]:
                            raise Exception("Session aborted by user request.")

                        variant_match = next((v for v in variants if v.get("option1_value") == color_name or v.get("option2_value") == color_name), None)
                        if not variant_match: continue
                        suffix_key = variant_match.get("sku_suffix", color_name).replace("-", "").lower()
                        
                        recolor_prompt = f"Accurately recolor ONLY the decorative fluid splashes and liquid accents to exactly {color_name}. DO NOT change the background, floor, or the central product itself. Preserve the exact geometry, reflections, shadows, and lighting perfectly."
                        
                        recolor_resp = VisionAgent._generate_with_retry(
                            client=client,
                            model=ModelName.IMAGE_GEN.value,
                            contents=[
                                types.Content(role="user", parts=[
                                    types.Part.from_bytes(data=base_image_bytes, mime_type="image/jpeg"),
                                    types.Part.from_text(text=recolor_prompt)
                                ])
                            ],
                            config=types.GenerateContentConfig(temperature=0.0),
                            retries=6, initial_delay=4.0
                        )
                        
                        variant_img_bytes = None
                        if hasattr(recolor_resp, 'generated_image') and recolor_resp.generated_image:
                            pass # Not inline
                        elif recolor_resp.candidates and recolor_resp.candidates[0].content.parts:
                            for part in recolor_resp.candidates[0].content.parts:
                                if part.inline_data:
                                    variant_img_bytes = part.inline_data.data
                                    break
                                    
                        if variant_img_bytes:
                            var_url = VisionAgent._upload_to_storage(variant_img_bytes, "image/jpeg", sku, suffix_key)
                            generated_images[suffix_key] = var_url
                            logger.info(f"Successfully recolored {sku} variant: {color_name}")
                    except Exception as ve:
                        logger.error(f"Semantic Recolor failed for {sku} color {color_name}: {ve}")
            
            # Transition state!
            doc_ref.update({
                "status": ProductState.REMOVING_BACKGROUND.value,
                "ai_data.generated_images": generated_images,
                "ai_data.images": firestore.DELETE_FIELD, # Atomic Reset
                "enrichment_message": "Studio generation successful. Removing backgrounds."
            })
            logger.info(f"VisionAgent: Studio Generation complete for {sku}")
            
        except Exception as e:
            logger.error(f"VisionAgent Failed for {sku}: {e}", exc_info=True)
            raise e
