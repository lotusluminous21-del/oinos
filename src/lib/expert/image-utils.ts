// src/lib/expert/image-utils.ts
// Client-side image processing for expert chat multimodal uploads.

const MAX_DIMENSION = 800;  // px — plenty for Gemini vision + Pillow extraction
const JPEG_QUALITY = 0.80;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { getFirebaseStorage } from '../firebase/config';

/**
 * Validate an image file before processing.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    if (!ALLOWED_TYPES.includes(file.type)) {
        return { valid: false, error: 'Μόνο εικόνες JPEG, PNG ή WebP.' };
    }
    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: 'Μέγιστο μέγεθος αρχείου 5MB.' };
    }
    return { valid: true };
}

/**
 * Resize an image file to max 800×800 and return as base64 JPEG string.
 * Uses the canvas API for client-side resizing (no server roundtrip).
 * Returns a data URI string: "data:image/jpeg;base64,..."
 */
export function resizeImageToBase64(file: File, maxDim = MAX_DIMENSION): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error('Failed to load image'));
            img.onload = () => {
                // Calculate scaled dimensions
                let { width, height } = img;
                if (width > maxDim || height > maxDim) {
                    const ratio = Math.min(maxDim / width, maxDim / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                // Draw onto canvas at reduced size
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context unavailable'));
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);

                // Export as JPEG base64
                const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
                resolve(dataUrl);
            };
            img.src = reader.result as string;
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Extract raw base64 string from a data URI.
 * "data:image/jpeg;base64,/9j/..." → "/9j/..."
 */
export function stripDataUriPrefix(dataUrl: string): string {
    const idx = dataUrl.indexOf(',');
    return idx >= 0 ? dataUrl.substring(idx + 1) : dataUrl;
}

/**
 * Uploads a base64 data URI image to Firebase Storage and returns the public URL.
 */
export async function uploadImageToStorage(dataUrl: string, sessionId: string, appName: string = 'pavlicevits'): Promise<string> {
    const storage = getFirebaseStorage();
    // Use an explicit unique ID for the image file
    const uuid = Math.random().toString(36).substring(2, 15);
    const imagePath = `${appName}/expert_chats/${sessionId}/${uuid}.jpg`;
    const imageRef = ref(storage, imagePath);

    // Upload the data_url directly
    await uploadString(imageRef, dataUrl, 'data_url', {
        contentType: 'image/jpeg'
    });
    return getDownloadURL(imageRef);
}
