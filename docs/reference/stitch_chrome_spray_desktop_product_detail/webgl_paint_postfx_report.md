# Technical Report: WebGL Post-Processing Effects for Pavlicevits E-commerce

**DATE:** 2026-03-06
**TO:** Pavlicevits Frontend Development Team
**FROM:** Lead Research Analyst
**SUBJECT:** Comprehensive Technical Report on WebGL Fragment and Vertex Shader Effects for a Global Post-Processing Layer

---

### **Executive Summary**

This report provides a comprehensive technical blueprint for implementing a global post-processing layer on the Pavlicevits e-commerce website. The objective is to subtly enhance the user interface with shader-based effects that evoke a sophisticated, paint-related atmosphere, directly supporting the brand's minimal industrial aesthetic and "Precision in Motion" philosophy. The effects are designed to be barely noticeable, enriching the visual texture of the site without distracting the user or compromising performance.

The report details a recommended architecture using React Three Fiber and the `@react-three/postprocessing` library, chosen for its performance, declarative nature, and seamless integration with React/Next.js. It provides production-ready GLSL fragment shader code for eight distinct, paint-themed effects, including canvas texturing, film grain, and color grading.

Furthermore, this document includes complete TypeScript and React code for integrating these custom shaders into the application, complete with performance optimizations like resolution scaling and accessibility fallbacks for reduced motion. Finally, it offers strategic recommendations for combining effects and tuning their intensity to achieve a refined, high-end user experience that reinforces Pavlicevits' position as a market leader in quality and professionalism.

---

## 1. Post-Processing Architecture

To implement a global post-processing layer that affects the entire website, a robust and performant architecture is required. The layer must overlay the existing DOM content and apply shader effects in real-time without degrading the user experience.

### 1.1. Recommended Technology Stack: React Three Fiber

For a modern React/Next.js application, the combination of **React Three Fiber (`@react-three/fiber`)** and **`@react-three/postprocessing`** is the recommended solution.

*   **React Three Fiber (R3F):** A React renderer for Three.js, it allows developers to build a 3D scene using declarative, reusable components. We can use it to create a simple scene with a full-screen plane that covers the viewport.
*   **`@react-three/postprocessing`:** A powerful wrapper around the `postprocessing` library, optimized for R3F. It simplifies the process of chaining and combining shader effects. Its key advantages include:
    *   **Performance:** It automatically merges multiple effects into fewer render passes, significantly reducing GPU overhead.
    *   **Declarative API:** Effects are added as React components within an `<EffectComposer>`, making the code clean and maintainable.
    *   **Quality:** It handles complex aspects like gamma correction and MSAA (Multi-Sample Anti-Aliasing) by default, ensuring high-quality output.

### 1.2. Alternative Approaches

While R3F is recommended, other architectures exist:

*   **Custom WebGL Canvas Overlay:** This involves creating a `<canvas>` element with a `position: fixed` style to cover the page and managing the WebGL context, shaders, and render loop manually. This approach offers maximum control but is significantly more complex to implement, integrate with React's lifecycle, and optimize.
*   **Pixi.js Filters:** Pixi.js is an excellent 2D rendering engine with a mature filter system. While capable, it is primarily 2D-focused. Using it for a global 3D-capable post-processing layer in a React application built without Pixi.js as a core technology would add unnecessary library overhead compared to the more direct R3F integration.

### 1.3. Core Implementation Strategy

The strategy involves rendering the entire website's DOM content into a texture and then applying the shader effects to this texture in a WebGL canvas that sits on top of all other content.

1.  A top-level React component will contain a full-screen R3F `<Canvas>`.
2.  The `@react-three/drei` helper library will be used to render the underlying DOM content into the WebGL scene.
3.  Inside the canvas, an `<EffectComposer>` from `@react-three/postprocessing` will manage the sequence of shader effects.
4.  Each custom effect will be implemented as a separate component and placed inside the `<EffectComposer>`.

### 1.4. Performance and Accessibility Considerations

Performance is critical. A post-processing layer must not introduce jank or increase page load times significantly.

*   **GPU-Bound Effects:** All effects must be implemented in fragment shaders to run on the GPU, leveraging its parallel processing power. Avoid CPU-intensive operations.
*   **Resolution Scaling:** To improve performance on lower-end devices, the resolution at which the effects are calculated can be reduced. The `@react-three/postprocessing` library makes this trivial to configure.
*   **Conditional Rendering:** Effects should be layered with care. For mobile devices, a more minimal set of effects should be used to conserve battery and processing power.
*   **Accessibility:** We must respect user preferences for reduced motion. The `usePrefersReducedMotion` hook provided in the brand's animation guide will be used to disable all post-processing effects for users who have this setting enabled.

---

## 2. Subtle Paint-Related Shader Effects

The following are complete GLSL fragment shaders designed for subtlety. They are written to be integrated with the `@react-three/postprocessing` library, which provides the input scene texture as `tDiffuse` and UV coordinates as `vUv`.

### 2.1. Canvas/Paper Texture Overlay

**Objective:** To overlay a subtle, seamless texture that mimics the fine grain of canvas or high-quality paper, adding a tactile feel to the digital interface.

**GLSL Fragment Shader:**
```glsl
// uniform sampler2D u_texture; // The canvas texture
// uniform float u_blendOpacity; // How much to blend the texture
// uniform float u_textureScale; // How large the texture pattern should be

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Scale the texture coordinates to tile the texture
    vec2 textureUv = uv * u_textureScale;
    
    // Sample the canvas texture
    vec4 textureColor = texture2D(u_texture, textureUv);
    
    // Blend the input color with the texture color using the blend opacity
    // 'mix' is a linear interpolation: inputColor * (1 - opacity) + textureColor * opacity
    // Using inputColor.rgb in the mix ensures we only affect color, not alpha.
    outputColor = vec4(mix(inputColor.rgb, textureColor.rgb, u_blendOpacity), inputColor.a);
}
```

### 2.2. Film Grain/Noise

**Objective:** To add a fine layer of dynamic, monochrome noise that simulates the grain of photographic film, adding depth and an organic quality.

**GLSL Fragment Shader:**
```glsl
// uniform float u_time; // Time for animating the grain
// uniform float u_intensity; // The strength of the grain effect

// 2D random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Create a noise value based on UV coordinates and time
    float noise = random(uv + u_time) * 2.0 - 1.0;
    
    // Apply the noise to the input color, scaled by intensity
    vec3 noisyColor = inputColor.rgb + noise * u_intensity;
    
    outputColor = vec4(noisyColor, inputColor.a);
}
```

### 2.3. Subtle Color Quantization/Posterization

**Objective:** To slightly reduce the number of color tones, creating a subtle banding effect reminiscent of screen printing or vintage paint catalogs.

**GLSL Fragment Shader:**
```glsl
// uniform float u_levels; // The number of color levels (e.g., 8.0)

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Quantize the color by multiplying, flooring, and dividing
    vec3 quantizedColor = floor(inputColor.rgb * u_levels) / u_levels;
    
    outputColor = vec4(quantizedColor, inputColor.a);
}
```

### 2.4. Chromatic Aberration

**Objective:** To mimic the subtle color fringing of a real camera lens, where colors separate slightly at the edges of the frame. This adds a touch of analog realism.

**GLSL Fragment Shader:**
```glsl
// uniform float u_intensity; // The strength of the aberration

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Calculate distance from center (0.5, 0.5)
    vec2 toCenter = vec2(0.5) - uv;
    float dist = length(toCenter);
    
    // Calculate offset based on distance and intensity
    vec2 offset = toCenter * u_intensity * dist;

    // Sample the red, green, and blue channels at different offsets
    float r = texture2D(tDiffuse, uv + offset).r;
    float g = texture2D(tDiffuse, uv).g; // Green channel is the reference
    float b = texture2D(tDiffuse, uv - offset).b;
    
    outputColor = vec4(r, g, b, inputColor.a);
}
```

### 2.5. Vignette

**Objective:** To gently darken the corners of the screen, focusing the user's attention towards the center of the content.

**GLSL Fragment Shader:**
```glsl
// uniform float u_offset; // Start of the vignette fade (e.g., 0.1)
// uniform float u_darkness; // How dark the vignette is (e.g., 1.1)

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Calculate distance from center, squared for a smoother falloff
    vec2 toCenter = vec2(0.5) - uv;
    float dist = dot(toCenter, toCenter);
    
    // Apply vignette effect
    float vignette = smoothstep(u_offset, 1.0, dist * u_darkness);
    
    outputColor = vec4(inputColor.rgb * (1.0 - vignette), inputColor.a);
}
```

### 2.6. Color Grading/LUT

**Objective:** To apply a consistent color tone across the entire site using a Look-Up Table (LUT). This is a powerful way to establish a specific mood or brand color identity.

**GLSL Fragment Shader:**
```glsl
// uniform sampler3D u_lut; // The 3D LUT texture
// uniform float u_intensity; // How much to apply the LUT

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // The LUT texture is a 3D cube. The RGB values of the input color
    // are used as 3D coordinates to look up the new color.
    vec3 gradedColor = texture(u_lut, inputColor.rgb).rgb;
    
    // Blend between the original color and the graded color
    outputColor = vec4(mix(inputColor.rgb, gradedColor, u_intensity), inputColor.a);
}
```

### 2.7. Brush Stroke Texture

**Objective:** Similar to the canvas texture, but uses a texture with visible brush stroke patterns to create a more painterly background feel.

**GLSL Fragment Shader:**
```glsl
// uniform sampler2D u_texture; // The brush stroke texture
// uniform float u_blendOpacity; // How much to blend the texture
// uniform float u_textureScale; // How large the texture pattern should be

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 textureUv = uv * u_textureScale;
    vec4 textureColor = texture2D(u_texture, textureUv);
    
    // Use an 'overlay' blend mode for a more interesting texture combination
    float lum = dot(inputColor.rgb, vec3(0.299, 0.587, 0.114));
    vec3 blend = lum < 0.5 ? 
        (2.0 * inputColor.rgb * textureColor.rgb) : 
        (1.0 - 2.0 * (1.0 - inputColor.rgb) * (1.0 - textureColor.rgb));

    outputColor = vec4(mix(inputColor.rgb, blend, u_blendOpacity), inputColor.a);
}
```

### 2.8. Watercolor Edge Bleeding

**Objective:** A subtle effect that slightly distorts and darkens pixels around high-contrast edges, mimicking how watercolor pigment pools and bleeds on paper.

**GLSL Fragment Shader:**
```glsl
// uniform float u_intensity; // Strength of the bleed/distortion
// uniform float u_edgeDarkness; // How much to darken edges

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 texel = 1.0 / vec2(textureSize(tDiffuse, 0));
    
    // Simple Sobel edge detection
    float tl = texture2D(tDiffuse, uv + vec2(-texel.x, -texel.y)).r;
    float t = texture2D(tDiffuse, uv + vec2(0.0, -texel.y)).r;
    float tr = texture2D(tDiffuse, uv + vec2(texel.x, -texel.y)).r;
    float l = texture2D(tDiffuse, uv + vec2(-texel.x, 0.0)).r;
    float r = texture2D(tDiffuse, uv + vec2(texel.x, 0.0)).r;
    float bl = texture2D(tDiffuse, uv + vec2(-texel.x, texel.y)).r;
    float b = texture2D(tDiffuse, uv + vec2(0.0, texel.y)).r;
    float br = texture2D(tDiffuse, uv + vec2(texel.x, texel.y)).r;

    float sobelX = -tl - 2.0 * l - bl + tr + 2.0 * r + br;
    float sobelY = -tl - 2.0 * t - tr + bl + 2.0 * b + br;
    float edge = sqrt(sobelX * sobelX + sobelY * sobelY);

    // Use a noise function to create irregular distortion along edges
    float noise = (fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 2.0;
    vec2 bleedUv = uv + vec2(noise) * edge * u_intensity * texel;
    
    vec3 bleedColor = texture2D(tDiffuse, bleedUv).rgb;
    
    // Darken the edges
    bleedColor *= (1.0 - edge * u_edgeDarkness);

    outputColor = vec4(bleedColor, inputColor.a);
}
```

---

## 3. Implementation in React Three Fiber

This section provides the full TypeScript/React code to integrate the custom shaders into a Next.js application.

### 3.1. Setup and Dependencies

First, install the necessary libraries:
```bash
npm install @react-three/fiber @react-three/drei @react-three/postprocessing three
```

### 3.2. Creating a Custom Shader Effect

To use our GLSL code with `@react-three/postprocessing`, we must create a custom `Effect` class and a corresponding React component.

```typescript
// components/effects/CustomEffect.ts
import { Effect, BlendFunction } from 'postprocessing';
import { Uniform } from 'three';

// This class extends the 'Effect' class from the postprocessing library
export class CustomAtmosphereEffect extends Effect {
  constructor({ fragmentShader, uniforms }) {
    super('CustomAtmosphereEffect', fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map(Object.entries(uniforms)),
    });
  }
}

// This is the React component that will be used in the EffectComposer
import React, { forwardRef, useMemo } from 'react';
import { Uniform } from 'three';

interface CustomEffectProps {
  fragmentShader: string;
  [key: string]: any; // Allow any other props to be passed as uniforms
}

export const AtmosphereEffect = forwardRef<CustomAtmosphereEffect, CustomEffectProps>(
  ({ fragmentShader, ...props }, ref) => {
    const uniforms = useMemo(() => {
      const uniformMap = {};
      for (const key in props) {
        uniformMap[`u_${key}`] = new Uniform(props[key]);
      }
      return uniformMap;
    }, [props]);

    const effect = useMemo(() => 
      new CustomAtmosphereEffect({ fragmentShader, uniforms }), 
      [fragmentShader, uniforms]
    );

    return <primitive ref={ref} object={effect} dispose={null} />;
  }
);
```

### 3.3. Global Post-Processing Component

This component sets up the canvas and renders the effects. It also handles the accessibility fallback.

```typescript
// components/GlobalEffects.tsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'; // From brand guide
import { AtmosphereEffect } from './effects/CustomEffect';

// Import GLSL shaders as raw strings
import filmGrainShader from './shaders/filmGrain.glsl';
import vignetteShader from './shaders/vignette.glsl';

interface GlobalEffectsProps {
  children: React.ReactNode;
}

export const GlobalEffects: React.FC<GlobalEffectsProps> = ({ children }) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <>
      {/* The original DOM content, hidden from direct view */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', visibility: 'hidden' }}>
        {children}
      </div>

      <Canvas
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100, pointerEvents: 'none' }}
        gl={{ alpha: true, antialias: false }}
      >
        <Suspense fallback={null}>
          <EffectComposer>
            {/* Example: Combining Vignette and Film Grain */}
            <AtmosphereEffect
              fragmentShader={vignetteShader}
              offset={0.15}
              darkness={1.2}
            />
            <AtmosphereEffect
              fragmentShader={filmGrainShader}
              intensity={0.025}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </>
  );
};
```
*Note: To use `import shader from './file.glsl'`, you need to configure your bundler (e.g., Webpack) with a raw loader for `.glsl` files.*

### 3.4. Performance Optimization in Practice

Within the `<EffectComposer>`, we can add props to optimize rendering.

```typescript
// Inside GlobalEffects.tsx component
<EffectComposer
  multisampling={0} // Disable MSAA for performance if not needed
  frameBufferType={HalfFloatType} // Use 16-bit floats for better performance
  // For lower-end devices, you can scale down the resolution
  // resolutionScale={0.5} 
>
  {/* Effects go here */}
</EffectComposer>
```

---

## 4. Recommended Combinations & Best Practices

The goal is subtlety. The effects should create an atmosphere, not demand attention. Layering them requires a delicate balance.

### 4.1. Building an Atmosphere

**Desktop Recommendation (Subtle Industrial Feel):**
A combination of static texture and gentle focus effects works well.
*   **Vignette:** `darkness: 1.1`, `offset: 0.2` (A soft, wide vignette)
*   **Film Grain:** `intensity: 0.02` (Barely perceptible grain, adds texture)
*   **Canvas Texture:** `blendOpacity: 0.08`, `textureScale: 2.0` (A faint texture that breaks up digital gradients)

**Mobile Recommendation (Performance First):**
On mobile, prioritize performance and battery life. Texture lookups can be expensive.
*   **Vignette:** `darkness: 1.05`, `offset: 0.1` (A very light vignette to add depth)
*   **Film Grain:** `intensity: 0.015` (Extremely subtle, almost imperceptible)
*   **All other effects:** Disabled.

### 4.2. Intensity Guidelines

| Effect | Uniform | Subtle Value | Notes |
| :--- | :--- | :--- | :--- |
| Vignette | `u_darkness` | 1.0 - 1.3 | Higher values create a stronger, more focused effect. |
| Film Grain | `u_intensity` | 0.01 - 0.03 | Keep this very low to avoid a "noisy TV" look. |
| Canvas Texture | `u_blendOpacity` | 0.05 - 0.15 | Depends on the texture's contrast. |
| Posterization | `u_levels` | 16.0 - 64.0 | Higher values are more subtle. Lower values are more stylized. |
| Chromatic Aberration | `u_intensity` | 0.001 - 0.005 | Must be extremely subtle to avoid looking like a bug. |
| Color Grading/LUT | `u_intensity` | 0.5 - 1.0 | Depends on how strong the LUT is. |
| Watercolor Bleed | `u_intensity` | 0.01 - 0.05 | Very sensitive. Keep low to avoid a blurry mess. |

### 4.3. Avoiding Common Pitfalls

*   **Do Not Over-Animate:** For effects like Film Grain, the `u_time` variable should be advanced slowly. Fast-moving grain is distracting and looks cheap.
*   **Test Extensively:** Test on a range of devices, from high-end desktops to mid-range mobile phones, to ensure performance is acceptable across the board.
*   **Less is More:** Start with one or two effects at a very low intensity. It is better for the effect to be "too subtle" than "too obvious." The goal is to create a subconscious feeling of quality, not a visual gimmick.

---

## References
1. [react-three-fiber setting up postprocessing using effectcomposer and passes - Stack Overflow](https://stackoverflow.com/questions/78738271/react-three-fiber-setting-up-postprocessing-using-effectcomposer-and-passes-o)
2. [pmndrs/react-postprocessing - GitHub](https://github.com/pmndrs/react-postprocessing)
3. [How to properly use custom effect passes/layers in react-three-fiber? - Reddit](https://www.reddit.com/r/threejs/comments/y6hw6l/how_to_properly_use_custom_effect_passeslayers_in/)
4. [React Postprocessing - Poimandres](https://docs.pmnd.rs/react-postprocessing)
5. [EffectComposer with custom passes - GitHub](https://github.com/pmndrs/react-three-fiber/issues/3304)
6. [React Three Fiber Postprocessing - Three.js Discourse](https://discourse.threejs.org/t/react-three-fiber-postprocessing/61214)
7. [Lost on how to implement custom post processing shader in react-three-fiber - Reddit](https://www.reddit.com/r/threejs/comments/wvy9kd/lost_on_how_to_implement_custom_post_processing/)
8. [Combine render and composer in r3f - Three.js Discourse](https://discourse.threejs.org/t/combine-render-and-composer-in-r3f/57926)
9. [lwjgl - Overlaying a transparent color over a Texture with GLSL - Stack Overflow](https://stackoverflow.com/questions/30856899/overlaying-a-transparent-color-over-a-texture-with-glsl)
10. [patriciogonzalezvivo/glslCanvas - GitHub](https://github.com/patriciogonzalezvivo/glslCanvas)
11. [actarian/glsl-canvas - GitHub](https://github.com/actarian/glsl-canvas)
12. [10.6 - Texture Mapping Using Procedures — LearnWebGL - learnwebgl.brown37.net](http://learnwebgl.brown37.net/10_surface_properties/texture_mapping_procedural.html)
13. [glsl-canvas-js - npm](https://www.npmjs.com/package/glsl-canvas-js?activeTab=readme)
14. [THREE.JS | GLSL Using canvas as shader uniform texture - Stack Overflow](https://stackoverflow.com/questions/63400827/three-js-glsl-using-canvas-as-shader-uniform-texture)
15. [glsl - LibGDX - overlay texture above another texture using shader - Stack Overflow](https://stackoverflow.com/questions/24480901/libgdx-overlay-texture-above-another-texture-using-shader)
16. [Image Imperfections and Film Grain (post-process) - devlog-martinsh.blogspot.com](http://devlog-martinsh.blogspot.com/2013/05/image-imperfections-and-film-grain-post.html)
17. [Here's a great chromatic aberration GLSL function - Reddit](https://www.reddit.com/r/gamedev/comments/20xyn4/heres_a_great_chromatic_aberration_glsl_function/)
18. [Analyzing Optic and Filmic Effects in WebGL - Medium](https://medium.com/@josecastrovaron/analyzing-optic-and-filmic-effects-in-webgl-47abe74df74e)
19. [Wagner/chromatic-aberration-fs.glsl - GitHub](https://github.com/spite/Wagner/blob/master/fragment-shaders/chromatic-aberration-fs.glsl)
20. [My take on shaders: Chromatic Aberration (Introduction to Image Effects - Part IV) - halisavakis.com](https://halisavakis.com/my-take-on-shaders-chromatic-aberration-introduction-to-image-effects-part-iv/)
21. [How would you implement chromatic aberration? - Game Development Stack Exchange](https://gamedev.stackexchange.com/questions/58408/how-would-you-implement-chromatic-aberration)
22. [Shader Library – Chromatic Aberration Demo (GLSL) - Geeks3D](https://www.geeks3d.com/20101008/shader-library-chromatic-aberration-demo-glsl/)
23. [Camcorder / Horror Shader - Godot Shaders](https://godotshaders.com/shader/camcorder-horror-shader/)
24. [watercolorShader - c-chen99.github.io](https://c-chen99.github.io/watercolorShader/final.html)
25. [Watercolor - Artineering](https://artineering.io/styles/watercolor)
26. [webgl - Cel shading in image processing - Stack Overflow](https://stackoverflow.com/questions/47237014/webgl-cel-shading-in-image-processing)
27. [Real-Time Watercolor Illustrations of Virtual and Real Worlds - faculty.cc.gatech.edu](https://faculty.cc.gatech.edu/~turk/my_papers/npr_ar_2008.pdf)
28. [The Book of Shaders - thebookofshaders.com](https://thebookofshaders.com/00/)
29. [On Crafting Painterly Shaders with React Three Fiber - Maxime Heckel](https://blog.maximeheckel.com/posts/on-crafting-painterly-shaders/)
30. [Topographic - dietcode.io](https://dietcode.io/p/topographic/)
31. [Shader Library – Posterization Post-Processing Effect (GLSL) - Geeks3D](https://www.geeks3d.com/20091027/shader-library-posterization-post-processing-effect-glsl/)