import requests
import re
from urllib.parse import urljoin, urlparse
from typing import List, Optional
import traceback
import logging

logger = logging.getLogger(__name__)

# Minimum image dimension heuristic (pixels) — filters out icons/logos
MIN_IMAGE_DIMENSION = 150

# Patterns for URLs that are likely NOT product images
EXCLUDE_PATTERNS = [
    r'logo', r'icon', r'favicon', r'sprite', r'banner', r'avatar',
    r'placeholder', r'loading', r'spinner', r'arrow', r'btn',
    r'social', r'facebook', r'twitter', r'instagram', r'youtube',
    r'google-analytics', r'pixel', r'tracking', r'badge', r'flag',
    r'payment', r'visa', r'mastercard', r'paypal',
    r'\.svg', r'\.gif', r'data:image',
    r'1x1', r'spacer', r'blank', r'transparent',
]

EXCLUDE_REGEX = re.compile('|'.join(EXCLUDE_PATTERNS), re.IGNORECASE)

class ContentExtractor:
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

    def fetch_images_from_urls(self, urls: List[str], limit: int = 8) -> List[str]:
        """
        Visits the provided URLs and extracts high-quality product images.
        Uses a multi-strategy approach: og:image, twitter:image, and full <img> tag parsing.
        Returns a deduplicated list of image URLs.
        """
        found_images = []
        
        logger.info(f"ContentExtractor: Extracting images from {len(urls)} sources...")

        with requests.Session() as session:
            session.headers.update(self.headers)
            
            for url in urls[:limit]:
                try:
                    logger.info(f"ContentExtractor: Fetching {url}...")
                    response = session.get(url, timeout=12.0, allow_redirects=True, verify=False)
                    response.raise_for_status()
                    
                    logger.info(f"ContentExtractor: Resolved to {response.url}")
                    
                    images = self._extract_all_images(response.text, response.url)
                    logger.info(f"ContentExtractor: Found {len(images)} candidate images on page.")
                    found_images.extend(images)
                    
                    if len(found_images) >= 10:
                        break
                        
                except Exception as e:
                    logger.warning(f"ContentExtractor: Failed to fetch {url}: {e}")
                    continue
        
        # Deduplicate while preserving order
        unique = list(dict.fromkeys(found_images))
        logger.info(f"ContentExtractor: Total unique images found: {len(unique)}")
        return unique

    def _extract_all_images(self, html_content: str, base_url: str) -> List[str]:
        """
        Multi-strategy image extraction from HTML content.
        Priority: og:image > twitter:image > large <img> tags
        """
        images = []
        
        # ── 1. Open Graph Images (highest priority) ──────────────────
        # Handle both attribute orders: property then content, and content then property
        og_matches = re.findall(
            r'<meta\s+(?:[^>]*?)(?:property=["\']og:image["\'][^>]*?content=["\']([^"\']+)["\']|content=["\']([^"\']+)["\'][^>]*?property=["\']og:image["\'])',
            html_content, re.IGNORECASE
        )
        for match_group in og_matches:
            url = match_group[0] or match_group[1]
            if url:
                images.append(urljoin(base_url, url))
        
        # ── 2. Twitter Image ─────────────────────────────────────────
        twitter_matches = re.findall(
            r'<meta\s+(?:[^>]*?)(?:name=["\']twitter:image["\'][^>]*?content=["\']([^"\']+)["\']|content=["\']([^"\']+)["\'][^>]*?name=["\']twitter:image["\'])',
            html_content, re.IGNORECASE
        )
        for match_group in twitter_matches:
            url = match_group[0] or match_group[1]
            if url:
                images.append(urljoin(base_url, url))

        # ── 3. Link rel="image_src" ──────────────────────────────────
        link_matches = re.findall(
            r'<link\s+(?:[^>]*?)(?:rel=["\']image_src["\'][^>]*?href=["\']([^"\']+)["\']|href=["\']([^"\']+)["\'][^>]*?rel=["\']image_src["\'])',
            html_content, re.IGNORECASE
        )
        for match_group in link_matches:
            url = match_group[0] or match_group[1]
            if url:
                images.append(urljoin(base_url, url))
        
        # ── 4. Regular <img> tags (src and data-src) ─────────────────
        # This is the main fix — most product pages use regular <img> tags
        img_tag_matches = re.findall(
            r'<img\s+[^>]*?(?:src|data-src)\s*=\s*["\']([^"\']+)["\']',
            html_content, re.IGNORECASE
        )
        
        for img_url in img_tag_matches:
            full_url = urljoin(base_url, img_url)
            
            # Skip excluded patterns (icons, logos, tracking pixels, etc.)
            if EXCLUDE_REGEX.search(full_url):
                continue

            # Skip tiny images by checking for dimension hints in the URL
            if self._is_likely_small_image(full_url, html_content, img_url):
                continue
            
            # Must be http/https
            if not full_url.startswith(('http://', 'https://')):
                continue
            
            # Must look like an image URL
            parsed = urlparse(full_url)
            path_lower = parsed.path.lower()
            if any(ext in path_lower for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                images.append(full_url)
            elif '/image' in path_lower or '/img' in path_lower or '/photo' in path_lower or '/media' in path_lower or '/product' in path_lower:
                images.append(full_url)
            elif '?' in full_url and any(ext in full_url.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                # URL with query params but still has image extension
                images.append(full_url)

        # ── 5. srcset parsing (responsive images) ────────────────────
        srcset_matches = re.findall(r'srcset\s*=\s*["\']([^"\']+)["\']', html_content, re.IGNORECASE)
        for srcset in srcset_matches:
            # srcset format: "url1 300w, url2 600w, url3 1200w"
            parts = srcset.split(',')
            best_url = None
            best_width = 0
            for part in parts:
                part = part.strip()
                tokens = part.split()
                if len(tokens) >= 1:
                    candidate_url = tokens[0]
                    width = 0
                    if len(tokens) >= 2 and tokens[1].endswith('w'):
                        try:
                            width = int(tokens[1][:-1])
                        except ValueError:
                            width = 0
                    if width > best_width:
                        best_width = width
                        best_url = candidate_url
            
            if best_url and best_width >= MIN_IMAGE_DIMENSION:
                full_url = urljoin(base_url, best_url)
                if not EXCLUDE_REGEX.search(full_url):
                    images.append(full_url)

        return images
    
    def _is_likely_small_image(self, url: str, html: str, original_src: str) -> bool:
        """Heuristic check for likely small/icon images based on URL patterns and inline dimensions."""
        # Check for dimension patterns in URL (e.g., 50x50, 16x16)
        dim_match = re.search(r'(\d+)x(\d+)', url)
        if dim_match:
            w, h = int(dim_match.group(1)), int(dim_match.group(2))
            if w < MIN_IMAGE_DIMENSION or h < MIN_IMAGE_DIMENSION:
                return True
        
        # Check for width/height attributes near the img tag in HTML
        escaped_src = re.escape(original_src)
        context_match = re.search(
            rf'<img[^>]*?(?:src|data-src)\s*=\s*["\']' + escaped_src + r'["\'][^>]*?>',
            html, re.IGNORECASE
        )
        if context_match:
            tag = context_match.group(0)
            w_match = re.search(r'width\s*=\s*["\']?(\d+)', tag, re.IGNORECASE)
            h_match = re.search(r'height\s*=\s*["\']?(\d+)', tag, re.IGNORECASE)
            if w_match and int(w_match.group(1)) < MIN_IMAGE_DIMENSION:
                return True
            if h_match and int(h_match.group(1)) < MIN_IMAGE_DIMENSION:
                return True
        
        return False
