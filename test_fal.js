async function test() {
    const url = "https://fal.run/fal-ai/imageutils/rembg";
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": "Key c21a3057-f51b-4768-b37c-680c8eaf93f2:7539b7de3124f8080d6b2316ab2921d7",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ image_url: "https://hbbody.com/wp-content/uploads/2023/06/WEB-505SPR.png.png" })
    });
    console.log("fal-ai/imageutils/rembg: ", await res.json());

    const url2 = "https://fal.run/briaai/rmbg-1.4";
    const res2 = await fetch(url2, {
        method: "POST",
        headers: {
            "Authorization": "Key c21a3057-f51b-4768-b37c-680c8eaf93f2:7539b7de3124f8080d6b2316ab2921d7",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ image_url: "https://hbbody.com/wp-content/uploads/2023/06/WEB-505SPR.png.png" })
    });
    console.log("briaai/rmbg-1.4: ", await res2.json());
}
test();
