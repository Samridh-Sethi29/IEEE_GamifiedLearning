import React, { useEffect, useRef } from "react";

/**
 * Realistic Water Simulation Component
 * Natural, balanced water simulation styled to seamlessly match the Skillverse theme:
 * - Natural oceanic & river palette with rich blue depth (no over-exposure or washed out glare)
 * - Gentle, continuous organic wave flow and undulating surface motion everywhere
 * - Soft, luminous chromatic caustics that dance subtly across the water bed
 * - Controlled, realistic sun specular glints and gentle sky Fresnel reflections
 * - Interactive GPGPU wave simulation with smooth damping and natural ambient ripples
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

  info.r += drop * uStrength * 1.2;
  gl_FragColor = info;
}
`;

const FS_UPDATE = `
precision highp float;
uniform sampler2D uWaterTexture;
uniform vec2 uDelta;
uniform vec2 uFlow;
varying vec2 vUv;

void main() {
  vec2 uv = fract(vUv - uFlow);
  vec4 info = texture2D(uWaterTexture, uv);
  
  vec2 dx = vec2(uDelta.x, 0.0);
  vec2 dy = vec2(0.0, uDelta.y);
  
  float average = (
    texture2D(uWaterTexture, fract(uv - dx)).r +
    texture2D(uWaterTexture, fract(uv - dy)).r +
    texture2D(uWaterTexture, fract(uv + dx)).r +
    texture2D(uWaterTexture, fract(uv + dy)).r
  ) * 0.25;
  
  float restingHeight = 0.4;
  float springForce = (restingHeight - info.r) * 0.008;
  
  info.g += (average - info.r) * 0.995 + springForce;
  info.g *= 0.992;
  info.r += info.g * 0.990;
  
  float mixFactor = (info.r > restingHeight) ? 0.005 : 0.001;
  info.r = mix(info.r, restingHeight, mixFactor);
  
  info.r = clamp(info.r, 0.2, 0.6);
  info.g = clamp(info.g, -0.2, 0.2);
  
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
  
  float amplitudeScale = 1.2;
  float gx = (h2 + 2.0 * h5 + h8 - (h0 + 2.0 * h3 + h6)) * amplitudeScale;
  float gy = (h6 + 2.0 * h7 + h8 - (h0 + 2.0 * h1 + h2)) * amplitudeScale;
  
  if (abs(gx) < 0.003 && abs(gy) < 0.003) {
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
uniform float uFlowSpeed;
uniform vec2 uFlowDir;
uniform float uPreset; // 0.0 = ocean, 1.0 = river, 2.0 = tropical
varying vec2 vUv;

// Bicubic filtering for smooth GPGPU sampling
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

// Gentle physical ripple caustics
float getPhysCaustic(vec2 uv, float offset) {
  vec2 distortedUv = uv + vec2(
    sin(uv.y * 18.0 + uTime * 1.2) * 0.002,
    cos(uv.x * 18.0 + uTime * 1.2) * 0.002
  );

  vec4 heightSample = textureBicubic(uWaterTexture, distortedUv + vec2(offset));
  float heightDiff = abs(heightSample.b - heightSample.g);
  return smoothstep(0.12, 0.40, heightDiff) * 0.35;
}

// Natural flowing wave elevation for continuous organic ripples
float getFlowElevation(vec2 uv, float t, vec2 flowDir) {
  vec2 perp = vec2(-flowDir.y, flowDir.x);
  
  // Wave 1: Primary gentle swell
  float p1 = dot(uv, flowDir) * 5.2 - t * 1.25;
  float w1 = sin(p1 + cos(dot(uv, perp) * 2.8) * 0.35) * 0.45;
  
  // Wave 2: Crossing wave
  vec2 d2 = normalize(flowDir * 0.8 + perp * 0.6);
  float p2 = dot(uv, d2) * 9.0 - t * 1.55;
  float w2 = sin(p2) * 0.30;
  
  // Wave 3: Surface ripples
  vec2 d3 = normalize(flowDir * 0.4 - perp * 0.8);
  float p3 = dot(uv, d3) * 16.0 - t * 2.1;
  float w3 = cos(p3) * 0.18;
  
  // Wave 4: Subtle micro chop
  float p4 = (uv.x * 26.0 + uv.y * 22.0) - t * 2.8;
  float w4 = sin(p4) * 0.07;

  return w1 + w2 + w3 + w4;
}

// Analytical surface normal from flowing wave field
vec2 getFlowNormal(vec2 uv, float t, vec2 flowDir, float strength) {
  float eps = 0.015;
  float hL = getFlowElevation(uv - vec2(eps, 0.0), t, flowDir);
  float hR = getFlowElevation(uv + vec2(eps, 0.0), t, flowDir);
  float hD = getFlowElevation(uv - vec2(0.0, eps), t, flowDir);
  float hU = getFlowElevation(uv + vec2(0.0, eps), t, flowDir);
  return vec2(hL - hR, hD - hU) * strength;
}

// Natural, soft flowing caustic network (bounded and gentle, no whiteout)
float sampleSoftCaustic(vec2 uv, float t, vec2 flowDir) {
  vec2 perp = vec2(-flowDir.y, flowDir.x);
  
  vec2 p1 = uv * 6.0 + flowDir * (t * 0.55);
  vec2 p2 = uv * 9.0 - perp * (t * 0.42) + flowDir * (t * 0.22);
  
  p1 += vec2(sin(p2.y * 1.5 + t * 0.8), cos(p2.x * 1.5 - t * 0.7)) * 0.25;
  p2 += vec2(cos(p1.y * 1.7 - t * 0.6), sin(p1.x * 1.7 + t * 0.8)) * 0.22;
  
  float s1 = sin(p1.x + cos(p1.y * 1.2 + t * 0.7));
  float s2 = cos(p2.x * 1.1 + sin(p2.y + t * 0.8));
  float s3 = sin(dot(p1 + p2, vec2(0.65, 0.65)) + t * 0.9);
  
  float raw = (s1 + s2 + s3) * 0.3333; // in [-1.0, 1.0]
  float norm = raw * 0.5 + 0.5;        // in [0.0, 1.0]
  
  // Soft, smooth bell curve for natural water caustics
  float caustic = smoothstep(0.20, 0.75, norm);
  caustic = pow(caustic, 2.2);
  
  return caustic;
}

// RGB Chromatic Caustics with subtle dispersion
vec3 getDynamicCaustics(vec2 uv, float t, vec2 flowDir, float dispersion) {
  vec2 dispDir = normalize(flowDir + vec2(0.3, 0.4));
  float r = sampleSoftCaustic(uv + dispDir * dispersion, t, flowDir);
  float g = sampleSoftCaustic(uv, t, flowDir);
  float b = sampleSoftCaustic(uv - dispDir * dispersion, t, flowDir);
  return vec3(r * 1.05, g * 0.98, b * 1.08);
}

// River downstream water current
float getRiverCurrent(vec2 uv, float t, vec2 flowDir) {
  vec2 perp = vec2(-flowDir.y, flowDir.x);
  float lat = dot(uv, perp) * 18.0;
  float lon = dot(uv, flowDir) * 6.5 - t * 2.2;
  float stream = sin(lat + sin(lon * 0.7) * 1.2);
  return smoothstep(0.55, 0.95, stream) * 0.08;
}

// Ocean rolling swell highlights
float getOceanSwells(vec2 uv, float t, vec2 flowDir) {
  float waveLine = sin(dot(uv, flowDir) * 10.0 - t * 1.3 + sin(dot(uv, vec2(-flowDir.y, flowDir.x)) * 3.5) * 0.5);
  return smoothstep(0.60, 0.95, waveLine) * 0.06;
}

void main() {
  vec4 physSample = texture2D(uWaterTexture, vUv);
  
  // Physical simulation normal from GPGPU texture
  vec2 physNormalXY = (physSample.ba - 0.5) * 2.0;
  
  float t = uTime * uFlowSpeed;
  vec2 flowDir = normalize(uFlowDir);
  
  // Gentle wave normal from procedural flowing elevation
  vec2 flowNormalXY = getFlowNormal(vUv, t, flowDir, 0.65);
  
  // Combined normal (physical touches + continuous gentle flow)
  vec2 combinedNormalXY = physNormalXY * 0.45 + flowNormalXY * 0.55;
  vec3 normal = normalize(vec3(combinedNormalXY.x, combinedNormalXY.y, 1.0));
  
  // Base water gradient: calm, rich oceanic blues that never blow out
  float depthDist = length(vUv - 0.5);
  vec3 baseWater = mix(uShallowColor, uDeepColor, smoothstep(0.15, 0.85, depthDist));
  
  // Soft, balanced caustics (adding gentle luminosity, strictly controlled)
  vec3 flowCaustics = getDynamicCaustics(vUv, t, flowDir, uChromaticAberration);
  float physCaustic = getPhysCaustic(vUv, 0.0);
  
  vec3 totalCaustics = flowCaustics * 0.85 + vec3(physCaustic * 0.5);
  // Modulate caustics by a gentle light tint rather than blinding white
  vec3 causticColor = mix(uShallowColor * 1.25, vec3(0.72, 0.92, 1.0), 0.35);
  vec3 waterColor = baseWater + totalCaustics * causticColor * (0.18 * uCausticIntensity);
  
  // Preset features: gentle river current vs ocean swells
  if (uPreset > 0.5 && uPreset < 1.5) {
    float riverStream = getRiverCurrent(vUv, t, flowDir);
    waterColor += riverStream * vec3(0.04, 0.10, 0.14);
  } else {
    float swells = getOceanSwells(vUv, t, flowDir);
    waterColor += swells * vec3(0.04, 0.09, 0.12);
  }
  
  // Controlled Sun specular & sparkles
  vec3 sunDir = normalize(uSunDirection);
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfVec = normalize(sunDir + viewDir);
  
  float NdotH = max(0.0, dot(normal, halfVec));
  // Soft, elegant sheen, no blown-out glare
  float specular = pow(NdotH, 50.0) * 0.28;
  float sparkle = pow(NdotH, 180.0) * 0.45;
  
  // Soft Fresnel sky reflection
  float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 3.5);
  vec3 skyReflection = mix(uShallowColor * 1.15, vec3(0.70, 0.88, 0.98), 0.30);
  
  vec3 finalColor = mix(waterColor, skyReflection, fresnel * 0.20);
  finalColor += (specular + sparkle) * uSunColor * 0.35;
  
  // Subdued wave-crest highlight (delicate, not harsh white foam)
  float waveHeight = (physSample.r - 0.4) + getFlowElevation(vUv, t, flowDir) * 0.08;
  if (waveHeight > 0.055) {
    float highlight = smoothstep(0.055, 0.14, waveHeight) * 0.12;
    finalColor += vec3(highlight * 0.5, highlight * 0.8, highlight);
  }
  
  // Ensure color is perfectly clamped to avoid any exposure blowout
  finalColor = clamp(finalColor, 0.0, 1.0);
  
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
  chromaticAberration = 0.007,
  className = "",
  style = {},
  interactive = true,
  flowSpeed = 1.0,
  flowDirection = null,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Palette configuration - aligned with Skillverse vibrant yet natural theme
    // Ocean: deep oceanic blue #0c699d to calm turquoise-azure #1688bf
    let deepColor = [0.045, 0.32, 0.54];
    let shallowColor = [0.08, 0.54, 0.76];
    let sunColor = [0.98, 0.96, 0.90];
    let sunDir = [-0.3, 0.65, 0.7];
    let defaultFlowDir = [0.35, 0.15];
    let presetCode = 0.0; // ocean

    if (preset === "river") {
      // River: natural river emerald-cyan #054766 to #0d729a
      deepColor = [0.025, 0.28, 0.42];
      shallowColor = [0.05, 0.48, 0.64];
      sunDir = [-0.2, 0.75, 0.65];
      defaultFlowDir = [0.15, 0.90]; // downstream
      presetCode = 1.0;
    } else if (preset === "tropical") {
      // Tropical: lush Caribbean lagoon #08558a to #129bc4
      deepColor = [0.035, 0.34, 0.55];
      shallowColor = [0.09, 0.62, 0.78];
      defaultFlowDir = [0.28, 0.20];
      presetCode = 2.0;
    }

    const actualFlowDir = flowDirection || defaultFlowDir;
    const actualFlowSpeed = flowSpeed * (preset === "river" ? 1.3 : 0.9);

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
      gl.getExtension("OES_texture_float_linear");
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
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      const initialData = new Float32Array(SIM_RES * SIM_RES * 4);
      for (let i = 0; i < initialData.length; i += 4) {
        initialData[i] = 0.4;     // height
        initialData[i + 1] = 0.0; // velocity
        initialData[i + 2] = 0.5; // normal.x
        initialData[i + 3] = 0.5; // normal.y
      }

      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, SIM_RES, SIM_RES, 0, format, type, initialData);

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
      flow: gl.getUniformLocation(progUpdate, "uFlow"),
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
      flowSpeed: gl.getUniformLocation(progComposite, "uFlowSpeed"),
      flowDir: gl.getUniformLocation(progComposite, "uFlowDir"),
      preset: gl.getUniformLocation(progComposite, "uPreset"),
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

      const temp = targetA;
      targetA = targetB;
      targetB = temp;
    }

    // Initial ripples to prime the water
    for (let i = 0; i < 4; i++) {
      addDrop(
        0.2 + Math.random() * 0.6,
        0.2 + Math.random() * 0.6,
        0.035 + Math.random() * 0.03,
        0.025 + Math.random() * 0.02
      );
    }

    // Ambient drop timer for natural gentle movement
    let lastDropTime = performance.now();
    let nextDropInterval = 1200 + Math.random() * 1200;

    // Pointer movement tracking
    let lastPointer = null;
    let isMounted = true;

    function handlePointerMove(e) {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;

      if (x < 0 || x > 1 || y < 0 || y > 1) return;

      if (lastPointer) {
        const dx = x - lastPointer.x;
        const dy = y - lastPointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.005) {
          const radius = Math.min(0.04, 0.015 + dist * 0.12);
          const strength = Math.min(0.05, 0.015 + dist * 0.18);
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
        addDrop(x, y, 0.05, 0.05);
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

      // Natural gentle ambient water drops
      if (now - lastDropTime > nextDropInterval) {
        const x = 0.1 + Math.random() * 0.8;
        const y = 0.1 + Math.random() * 0.8;
        const radius = 0.02 + Math.random() * 0.03;
        const strength = 0.015 + Math.random() * 0.02;
        addDrop(x, y, radius, strength);
        lastDropTime = now;
        nextDropInterval = 1400 + Math.random() * 1600;
      }

      // Step 1: Wave update simulation pass with gentle flow advection
      gl.bindFramebuffer(gl.FRAMEBUFFER, targetB.fbo);
      gl.viewport(0, 0, SIM_RES, SIM_RES);
      gl.useProgram(progUpdate);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, targetA.texture);
      gl.uniform1i(updateLocs.tex, 0);
      gl.uniform2f(updateLocs.delta, 1.0 / SIM_RES, 1.0 / SIM_RES);
      gl.uniform2f(updateLocs.flow, actualFlowDir[0] * 0.00015, actualFlowDir[1] * 0.00015);

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

      // Step 3: Screen Composite pass with soft flowing water & balanced lighting
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
      gl.uniform1f(compLocs.flowSpeed, actualFlowSpeed);
      gl.uniform2f(compLocs.flowDir, actualFlowDir[0], actualFlowDir[1]);
      gl.uniform1f(compLocs.preset, presetCode);

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
  }, [preset, causticIntensity, chromaticAberration, interactive, flowSpeed, flowDirection]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{
        ...style,
        backgroundColor: preset === "river" ? "#054766" : "#0c699d",
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
