import os
import fal_client

def test_fal_model(model_id):
    print(f"Testing {model_id}...")
    try:
        url = "https://hbbody.com/wp-content/uploads/2023/06/WEB-505SPR.png.png"
        result = fal_client.subscribe(
            model_id,
            arguments={"image_url": url},
            with_logs=False
        )
        print("Success:", result['image']['url'] if 'image' in result else result)
    except Exception as e:
        print(f"Failed {model_id}: {e}")

if __name__ == "__main__":
    test_fal_model("fal-ai/imageutils/rembg")
    test_fal_model("briaai/rmbg-1.4")
    test_fal_model("bria/background/remove")
