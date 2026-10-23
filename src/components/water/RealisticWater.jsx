import React, { useEffect, useRef } from "react";

/**
 * Realistic Water Simulation Component
 * Replicates the high-fidelity water simulation by Anderson Mancini (water-simulation.vercel.app):
 * - Interactive GPGPU shallow-water wave equation (ping-pong simulation)
 * - Prismatic RGB caustics with bicubic filtering and chromatic aberration dispersion
 * - Real-time surface normals via Sobel filtering
 * - Directional sun specular glints, Fresnel sheen, and depth attenuation
 * - Ambient raindrop ripples + mouse/touch interactive ripples
 */

const VS_QUAD = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FS_DROP = `
precision highp float;
uniform sampler2D uWaterTexture;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uStrength;
varying vec2 vUv;

void main() {
  vec4 info = texture2D(uWaterTexture, vUv);
  float dist = length(uCenter - vUv);
  float drop = max(0.0, 1.0 - dist / uRadius);
  drop = 0.5 - cos(drop * 3.1415926535) * 0.5;

  info.r += drop * uStrength * 1.5;
  gl_FragColor = info;
}
`;

const FS_UPDATE = `
precision highp float;
uniform sampler2D uWaterTexture;
uniform vec2 uDelta;
varying vec2 vUv;

void main() {
  vec4 info = texture2D(uWaterTexture, vUv);
  
  vec2 dx = vec2(uDelta.x, 0.0);
  vec2 dy = vec2(0.0, uDelta.y);
  
  float average = (
    texture2D(uWaterTexture, vUv - dx).r +
    texture2D(uWaterTexture, vUv - dy).r +
    texture2D(uWaterTexture, vUv + dx).r +
    texture2D(uWaterTexture, vUv + dy).r
  ) * 0.25;
  
  float restingHeight = 0.4;
  float springForce = (restingHeight - info.r) * 0.006;
  
  info.g += (average - info.r) * 0.995 + springForce;
  info.g *= 0.995;
  info.r += info.g * 0.992;
  
  float mixFactor = (info.r > restingHeight) ? 0.005 : 0.0008;
  info.r = mix(info.r, restingHeight, mixFactor);
  
  info.r = clamp(info.r, 0.1, 0.7);
  info.g = clamp(info.g, -0.25, 0.25);
  
  gl_FragColor = info;
}
`;

const FS_NORMAL = `
precision highp float;
uniform sampler2D uWaterTexture;
uniform vec2 uDelta;
varying vec2 vUv;

void main() {
  vec4 info = texture2D(uWaterTexture, vUv);
  
  vec2 dx = vec2(uDelta.x, 0.0);
  vec2 dy = vec2(0.0, uDelta.y);
  
  float h0 = texture2D(uWaterTexture, vUv - dx - dy).r;
  float h1 = texture2D(uWaterTexture, vUv - dy).r;
  float h2 = texture2D(uWaterTexture, vUv + dx - dy).r;
  float h3 = texture2D(uWaterTexture, vUv - dx).r;
  float h5 = texture2D(uWaterTexture, vUv + dx).r;
  float h6 = texture2D(uWaterTexture, vUv - dx + dy).r;
  float h7 = texture2D(uWaterTexture, vUv + dy).r;
  float h8 = texture2D(uWaterTexture, vUv + dx + dy).r;
  
  float amplitudeScale = 1.6;
  float gx = (h2 + 2.0 * h5 + h8 - (h0 + 2.0 * h3 + h6)) * amplitudeScale;
  float gy = (h6 + 2.0 * h7 + h8 - (h0 + 2.0 * h1 + h2)) * amplitudeScale;
  
  if (abs(gx) < 0.005 && abs(gy) < 0.005) {
    info.ba = vec2(0.5, 0.5);
  } else {
    vec2 normal = normalize(vec2(gx, gy));
    info.ba = normal * 0.5 + 0.5;
  }
  
  gl_FragColor = info;
}
`;

const FS_COMPOSITE = `
precision highp float;
uniform sampler2D uWaterTexture;
uniform float uTime;
uniform float uChromaticAberration;
uniform vec2 uResolution;
uniform vec3 uDeepColor;
uniform vec3 uShallowColor;
uniform vec3 uSunColor;
uniform vec3 uSunDirection;
uniform float uCausticIntensity;
varying vec2 vUv;

// Bicubic filtering functions
float w0(float a) { return (1.0 / 6.0) * (a * (a * (-a + 3.0) - 3.0) + 1.0); }
float w1(float a) { return (1.0 / 6.0) * (a * a * (3.0 * a - 6.0) + 4.0); }
float w2(float a) { return (1.0 / 6.0) * (a * (a * (-3.0 * a + 3.0) + 3.0) + 1.0); }
float w3(float a) { return (1.0 / 6.0) * (a * a * a); }
float g0(float a) { return w0(a) + w1(a); }
float g1(float a) { return w2(a) + w3(a); }
float h0(float a) { return -1.0 + w1(a) / (w0(a) + w1(a)); }
float h1(float a) { return 1.0 + w3(a) / (w2(a) + w3(a)); }

vec4 bicubic(sampler2D tex, vec2 uv, vec4 texelSize) {
  uv = uv * texelSize.zw + 0.5;
  vec2 iuv = floor(uv);
  vec2 fuv = fract(uv);

  float g0x = g0(fuv.x);
  float g1x = g1(fuv.x);
  float h0x = h0(fuv.x);
  float h1x = h1(fuv.x);
  float h0y = h0(fuv.y);
  float h1y = h1(fuv.y);

  vec2 p0 = (vec2(iuv.x + h0x, iuv.y + h0y) - 0.5) * texelSize.xy;
  vec2 p1 = (vec2(iuv.x + h1x, iuv.y + h0y) - 0.5) * texelSize.xy;
  vec2 p2 = (vec2(iuv.x + h0x, iuv.y + h1y) - 0.5) * texelSize.xy;
  vec2 p3 = (vec2(iuv.x + h1x, iuv.y + h1y) - 0.5) * texelSize.xy;

  return g0(fuv.y) * (g0x * texture2D(tex, p0) + g1x * texture2D(tex, p1)) +
         g1(fuv.y) * (g0x * texture2D(tex, p2) + g1x * texture2D(tex, p3));
}

vec4 textureBicubic(sampler2D tex, vec2 uv) {
  vec2 texSize = vec2(256.0);
  vec2 texSizeInv = 1.0 / texSize;
  return bicubic(tex, uv, vec4(texSizeInv, texSize));
}

vec3 getCausticColor(vec2 uv, float offset) {
  vec2 distortedUv = uv + vec2(
    sin(uv.y * 22.0 + uTime * 1.3) * 0.002,
    cos(uv.x * 22.0 + uTime * 1.3) * 0.002
  );

  vec4 heightSample = textureBicubic(uWaterTexture, distortedUv + vec2(offset));
  float height = heightSample.b;
  float height2 = heightSample.g;
  
  float caustic = abs(height - height2);
  float baseValue = 0.45;
  
  float sharpLine = smoothstep(0.09, 0.29, caustic) * (1.0 - smoothstep(0.09, 0.32, caustic));
  float finalColor = sharpLine * 2.2;
  float glow = smoothstep(0.09, 0.85, caustic) * 1.6;
  finalColor += glow;
  
  finalColor = max(baseValue, baseValue + finalColor);
  float brightAreas = max(0.0, finalColor - baseValue);
  finalColor = baseValue + brightAreas * 4.8;

  return vec3(
    finalColor * (1.0 + offset * 2.2),
    finalColor * (1.0 - offset * 0.9),
    finalColor * (1.0 - offset * 2.2)
  );
}

void main() {
  vec4 waterSample = texture2D(uWaterTexture, vUv);
  
  // Extract normal from .ba
  vec2 normalXY = (waterSample.ba - 0.5) * 2.0;
  vec3 normal = normalize(vec3(normalXY.x, normalXY.y, 1.0));
  
  // Prismatic RGB caustics with chromatic aberration
  vec3 causticR = getCausticColor(vUv, uChromaticAberration);
  vec3 causticG = getCausticColor(vUv, 0.0);
  vec3 causticB = getCausticColor(vUv, -uChromaticAberration);
  
  vec3 rawCaustic = vec3(
    causticR.r * 1.09,
    causticG.g * 0.978,
    causticB.b * 1.08
  );
  rawCaustic = max(vec3(0.4), rawCaustic);
  
  // Secondary procedural micro-wave caustics for organic depth
  vec2 caustUv1 = vUv * 14.0 + vec2(uTime * 0.025, uTime * 0.015);
  vec2 caustUv2 = vUv * 20.0 - vec2(uTime * 0.02, uTime * 0.03);
  float microCaustic = sin(caustUv1.x + cos(caustUv1.y)) * sin(caustUv2.x + cos(caustUv2.y));
  microCaustic = smoothstep(0.2, 0.9, microCaustic * 0.5 + 0.5);

  // Gradient water depth: center is clearer and more vibrant, edges slightly deeper
  float depthDist = length(vUv - 0.5);
  vec3 baseWater = mix(uShallowColor, uDeepColor, smoothstep(0.15, 0.85, depthDist));
  
  // Composite caustics on water
  vec3 causticsColor = (rawCaustic - 0.4) * 0.9 + vec3(microCaustic * 0.2);
  vec3 seabedWithCaustics = baseWater + causticsColor * uCausticIntensity;
  
  // Lighting and Specular Sun Reflections
  vec3 sunDir = normalize(uSunDirection);
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfVec = normalize(sunDir + viewDir);
  
  float NdotH = max(0.0, dot(normal, halfVec));
  float specular = pow(NdotH, 60.0) * 1.6;
  float sparkle = pow(NdotH, 240.0) * 3.2;
  
  // Fresnel reflection
  float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 3.2);
  vec3 skyReflection = mix(vec3(0.55, 0.82, 0.98), vec3(0.92, 0.96, 1.0), fresnel);
  
  vec3 finalColor = mix(seabedWithCaustics, skyReflection, fresnel * 0.35);
  finalColor += (specular + sparkle) * uSunColor;
  
  // Wave crest highlights / froth on high peaks
  float waveHeight = waterSample.r - 0.4;
  if (waveHeight > 0.05) {
    float froth = smoothstep(0.05, 0.15, waveHeight) * 0.35;
    finalColor += vec3(froth);
  }
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compilation error: ${info}`);
  }
  return shader;
}

function createProgram(gl, vsSource, fsSource) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link error: ${info}`);
  }
  return program;
}

export default function RealisticWater({
  preset = "ocean",
  causticIntensity = 1.0,
  chromaticAberration = 0.0085,
  className = "",
  style = {},
  interactive = true,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Palette configuration
    let deepColor = [0.04, 0.28, 0.48];     // #0a487a
    let shallowColor = [0.08, 0.65, 0.84];  // #14a6d6
    let sunColor = [1.0, 0.98, 0.9];
    let sunDir = [-0.35, 0.65, 0.7];

    if (preset === "river") {
      deepColor = [0.02, 0.32, 0.44];     // #055270
      shallowColor = [0.06, 0.58, 0.74];  // #0f94bd
      sunDir = [-0.2, 0.8, 0.6];
    } else if (preset === "tropical") {
      deepColor = [0.03, 0.34, 0.55];     // #08578c
      shallowColor = [0.12, 0.78, 0.88];  // #1fc7e0
    }

    const gl =
      canvas.getContext("webgl2", { alpha: false, depth: false, antialias: false, powerPreference: "high-performance" }) ||
      canvas.getContext("webgl", { alpha: false, depth: false, antialias: false, powerPreference: "high-performance" });

    if (!gl) return;

    // Determine float/half-float texture capabilities
    const isWebGL2 = typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
    let internalFormat, format, type;

    if (isWebGL2) {
      gl.getExtension("EXT_color_buffer_float");
      gl.getExtension("OES_texture_float_linear");
      internalFormat = gl.RGBA16F;
      format = gl.RGBA;
      type = gl.HALF_FLOAT;
    } else {
      const extFloat = gl.getExtension("OES_texture_float");
      const extLinear = gl.getExtension("OES_texture_float_linear");
      const extHalf = gl.getExtension("OES_texture_half_float");
      if (extHalf) {
        internalFormat = gl.RGBA;
        format = gl.RGBA;
        type = extHalf.HALF_FLOAT_OES;
      } else if (extFloat) {
        internalFormat = gl.RGBA;
        format = gl.RGBA;
        type = gl.FLOAT;
      } else {
        internalFormat = gl.RGBA;
        format = gl.RGBA;
        type = gl.UNSIGNED_BYTE;
      }
    }

    // Geometry: Fullscreen quad
    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    // Programs
    const progDrop = createProgram(gl, VS_QUAD, FS_DROP);
    const progUpdate = createProgram(gl, VS_QUAD, FS_UPDATE);
    const progNormal = createProgram(gl, VS_QUAD, FS_NORMAL);
    const progComposite = createProgram(gl, VS_QUAD, FS_COMPOSITE);

    // Simulation resolution
    const SIM_RES = 256;

    // Helper: Create FBO with texture
    function createFBO() {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      // Initialize with resting height (0.4) in red channel and 0.5 in blue/alpha
      const initialData = new Float32Array(SIM_RES * SIM_RES * 4);
      for (let i = 0; i < initialData.length; i += 4) {
        initialData[i] = 0.4;     // height
        initialData[i + 1] = 0.0; // velocity
        initialData[i + 2] = 0.5; // normal.x
        initialData[i + 3] = 0.5; // normal.y
      }

      if (isWebGL2) {
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, SIM_RES, SIM_RES, 0, format, type, initialData);
      } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, SIM_RES, SIM_RES, 0, format, type, initialData);
      }

      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

      return { fbo, texture };
    }

    let targetA = createFBO();
    let targetB = createFBO();

    // Uniform locations lookup
    const dropLocs = {
      pos: gl.getAttribLocation(progDrop, "aPosition"),
      tex: gl.getUniformLocation(progDrop, "uWaterTexture"),
      center: gl.getUniformLocation(progDrop, "uCenter"),
      radius: gl.getUniformLocation(progDrop, "uRadius"),
      strength: gl.getUniformLocation(progDrop, "uStrength"),
    };

    const updateLocs = {
      pos: gl.getAttribLocation(progUpdate, "aPosition"),
      tex: gl.getUniformLocation(progUpdate, "uWaterTexture"),
      delta: gl.getUniformLocation(progUpdate, "uDelta"),
    };

    const normalLocs = {
      pos: gl.getAttribLocation(progNormal, "aPosition"),
      tex: gl.getUniformLocation(progNormal, "uWaterTexture"),
      delta: gl.getUniformLocation(progNormal, "uDelta"),
    };

    const compLocs = {
      pos: gl.getAttribLocation(progComposite, "aPosition"),
      tex: gl.getUniformLocation(progComposite, "uWaterTexture"),
      time: gl.getUniformLocation(progComposite, "uTime"),
      chromaticAberration: gl.getUniformLocation(progComposite, "uChromaticAberration"),
      resolution: gl.getUniformLocation(progComposite, "uResolution"),
      deepColor: gl.getUniformLocation(progComposite, "uDeepColor"),
      shallowColor: gl.getUniformLocation(progComposite, "uShallowColor"),
      sunColor: gl.getUniformLocation(progComposite, "uSunColor"),
      sunDir: gl.getUniformLocation(progComposite, "uSunDirection"),
      causticIntensity: gl.getUniformLocation(progComposite, "uCausticIntensity"),
    };

    function addDrop(x, y, radius, strength) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, targetB.fbo);
      gl.viewport(0, 0, SIM_RES, SIM_RES);
      gl.useProgram(progDrop);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, targetA.texture);
      gl.uniform1i(dropLocs.tex, 0);

      gl.uniform2f(dropLocs.center, x, y);
      gl.uniform1f(dropLocs.radius, radius);
      gl.uniform1f(dropLocs.strength, strength);

      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.enableVertexAttribArray(dropLocs.pos);
      gl.vertexAttribPointer(dropLocs.pos, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Swap
      const temp = targetA;
      targetA = targetB;
      targetB = temp;
    }

    // Initial splashes to set the water into motion
    for (let i = 0; i < 8; i++) {
      addDrop(
        0.2 + Math.random() * 0.6,
        0.2 + Math.random() * 0.6,
        0.05 + Math.random() * 0.05,
        0.04 + Math.random() * 0.04
      );
    }

    // Ambient drop timer for natural movement
    let lastDropTime = performance.now();
    let nextDropInterval = 1800 + Math.random() * 1200;

    // Pointer movement tracking
    let lastPointer = null;
    let isMounted = true;

    function handlePointerMove(e) {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height; // WebGL UV is inverted Y

      if (x < 0 || x > 1 || y < 0 || y > 1) return;

      if (lastPointer) {
        const dx = x - lastPointer.x;
        const dy = y - lastPointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.003) {
          const radius = Math.min(0.045, 0.015 + dist * 0.15);
          const strength = Math.min(0.07, 0.02 + dist * 0.25);
          addDrop(x, y, radius, strength);
          lastPointer = { x, y };
        }
      } else {
        lastPointer = { x, y };
      }
    }

    function handlePointerDown(e) {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
        addDrop(x, y, 0.065, 0.08);
      }
    }

    const hostElem = containerRef.current || window;
    hostElem.addEventListener("pointermove", handlePointerMove, { passive: true });
    hostElem.addEventListener("pointerdown", handlePointerDown, { passive: true });

    // Handle Resize
    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.floor(canvas.clientWidth * dpr);
      const height = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    }
    resizeCanvas();
    const resizeObserver = new ResizeObserver(() => resizeCanvas());
    resizeObserver.observe(canvas);

    // Animation Render Loop
    let animId;
    const startTime = performance.now();

    function render() {
      if (!isMounted) return;

      const now = performance.now();
      const elapsed = (now - startTime) * 0.001;

      // Natural ambient droplets
      if (now - lastDropTime > nextDropInterval) {
        const x = 0.1 + Math.random() * 0.8;
        const y = 0.1 + Math.random() * 0.8;
        const radius = 0.03 + Math.random() * 0.035;
        const strength = 0.03 + Math.random() * 0.035;
        addDrop(x, y, radius, strength);
        lastDropTime = now;
        nextDropInterval = 1800 + Math.random() * 2000;
      }

      // Step 1: Wave update simulation pass
      gl.bindFramebuffer(gl.FRAMEBUFFER, targetB.fbo);
      gl.viewport(0, 0, SIM_RES, SIM_RES);
      gl.useProgram(progUpdate);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, targetA.texture);
      gl.uniform1i(updateLocs.tex, 0);
      gl.uniform2f(updateLocs.delta, 1.0 / SIM_RES, 1.0 / SIM_RES);

      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.enableVertexAttribArray(updateLocs.pos);
      gl.vertexAttribPointer(updateLocs.pos, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Swap
      let temp = targetA;
      targetA = targetB;
      targetB = temp;

      // Step 2: Normal calculation pass
      gl.bindFramebuffer(gl.FRAMEBUFFER, targetB.fbo);
      gl.viewport(0, 0, SIM_RES, SIM_RES);
      gl.useProgram(progNormal);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, targetA.texture);
      gl.uniform1i(normalLocs.tex, 0);
      gl.uniform2f(normalLocs.delta, 1.0 / SIM_RES, 1.0 / SIM_RES);

      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.enableVertexAttribArray(normalLocs.pos);
      gl.vertexAttribPointer(normalLocs.pos, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      temp = targetA;
      targetA = targetB;
      targetB = temp;

      // Step 3: Screen Composite pass with caustics, sun sparkles and refraction
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(progComposite);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, targetA.texture);
      gl.uniform1i(compLocs.tex, 0);

      gl.uniform1f(compLocs.time, elapsed);
      gl.uniform1f(compLocs.chromaticAberration, chromaticAberration);
      gl.uniform2f(compLocs.resolution, canvas.width, canvas.height);
      gl.uniform3f(compLocs.deepColor, deepColor[0], deepColor[1], deepColor[2]);
      gl.uniform3f(compLocs.shallowColor, shallowColor[0], shallowColor[1], shallowColor[2]);
      gl.uniform3f(compLocs.sunColor, sunColor[0], sunColor[1], sunColor[2]);
      gl.uniform3f(compLocs.sunDir, sunDir[0], sunDir[1], sunDir[2]);
      gl.uniform1f(compLocs.causticIntensity, causticIntensity);

      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.enableVertexAttribArray(compLocs.pos);
      gl.vertexAttribPointer(compLocs.pos, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      hostElem.removeEventListener("pointermove", handlePointerMove);
      hostElem.removeEventListener("pointerdown", handlePointerDown);

      // Cleanup WebGL resources
      gl.deleteFramebuffer(targetA.fbo);
      gl.deleteTexture(targetA.texture);
      gl.deleteFramebuffer(targetB.fbo);
      gl.deleteTexture(targetB.texture);
      gl.deleteBuffer(quadBuffer);
      gl.deleteProgram(progDrop);
      gl.deleteProgram(progUpdate);
      gl.deleteProgram(progNormal);
      gl.deleteProgram(progComposite);
    };
  }, [preset, causticIntensity, chromaticAberration, interactive]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{
        ...style,
        backgroundColor: preset === "river" ? "#065f60" : "#0c699d",
      }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{ pointerEvents: interactive ? "auto" : "none" }}
      />
    </div>
  );
}
