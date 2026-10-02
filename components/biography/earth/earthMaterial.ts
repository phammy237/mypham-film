import { shaderMaterial } from "@react-three/drei";
import { Color, Texture, Vector3 } from "three";
import { extend } from "@react-three/fiber";

/**
 * Day/night Earth blend — the classic technique behind every three.js "realistic earth" demo:
 * sample the day (albedo) and night (city-lights) textures, blend by the sun-facing factor of
 * each fragment's normal, and add a restrained specular highlight over oceans using the
 * specular mask. The normal map contributes a cheap relief-shading multiplier rather than full
 * tangent-space perturbation, which keeps the shader small while still reading as dimensional.
 */
export const EarthMaterial = shaderMaterial(
  {
    dayMap: null as Texture | null,
    nightMap: null as Texture | null,
    specularMap: null as Texture | null,
    normalMap: null as Texture | null,
    sunDirection: new Vector3(0.2, 0.45, -1).normalize(),
    nightIntensity: 2.35,
    nightFloor: 0.16,
    focusPoint: new Vector3(0, 0, 1),
    focusGlow: 0,
  },
  /* vertex */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vObjectNormal;
    varying vec3 vWorldPosition;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      // object-space normal, untouched by the group's live rotation — lets us pin the Hanoi
      // glow to the actual surface point instead of a fixed spot in view space
      vObjectNormal = normalize(normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  /* fragment */ `
    uniform sampler2D dayMap;
    uniform sampler2D nightMap;
    uniform sampler2D specularMap;
    uniform sampler2D normalMap;
    uniform vec3 sunDirection;
    uniform float nightIntensity;
    uniform float nightFloor;
    uniform vec3 focusPoint;
    uniform float focusGlow;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vObjectNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 dayColor = texture2D(dayMap, vUv).rgb;
      vec3 nightColor = texture2D(nightMap, vUv).rgb;
      float spec = texture2D(specularMap, vUv).r;
      float relief = texture2D(normalMap, vUv).b;

      vec3 n = normalize(vNormal);
      float sunFactor = dot(n, normalize(sunDirection));
      float dayMix = smoothstep(-0.15, 0.22, sunFactor);

      // dark side stays readable — a soft deep-navy floor instead of true black, so ocean/land
      // relief and city light halos remain visible across the whole night hemisphere
      vec3 nightBase = mix(vec3(0.015, 0.022, 0.05), dayColor * 0.18, nightFloor);
      vec3 nightSide = nightBase + nightColor * nightIntensity;
      vec3 color = mix(nightSide, dayColor, dayMix);
      color *= mix(0.9, 1.0, relief);

      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      vec3 halfDir = normalize(normalize(sunDirection) + viewDir);
      float specHighlight = pow(max(dot(n, halfDir), 0.0), 70.0) * spec * dayMix;
      color += vec3(0.5, 0.55, 0.62) * specHighlight * 0.22;

      // faint terminator warmth, purely atmospheric/artistic
      float terminator = 1.0 - smoothstep(0.0, 0.35, abs(sunFactor));
      color += vec3(0.18, 0.09, 0.22) * terminator * 0.12;

      // restrained warm halo over the focus city (e.g. Hanoi) so it reads clearly on the dark side
      float focusDist = distance(vObjectNormal, normalize(focusPoint));
      float focusHalo = smoothstep(0.2, 0.0, focusDist) * focusGlow * (1.0 - dayMix * 0.7);
      color += vec3(1.0, 0.82, 0.52) * focusHalo * 0.4;

      // brand grade: slight desaturation + slightly lowered contrast + a soft navy overlay, so the
      // globe reads as part of this site's navy/purple palette rather than a stock-photorealistic
      // Earth render
      float luma = dot(color, vec3(0.299, 0.587, 0.114));
      color = mix(color, vec3(luma), 0.14);
      color = mix(vec3(0.5), color, 0.88);
      color = mix(color, vec3(0.094, 0.137, 0.247), 0.16);

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

/** Restrained Fresnel rim-glow shell — no post-processing bloom pass needed. */
export const AtmosphereMaterial = shaderMaterial(
  { glowColor: new Color("#9B8BB5"), intensity: 1.3 },
  /* vertex */ `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* fragment */ `
    uniform vec3 glowColor;
    uniform float intensity;
    varying vec3 vNormal;
    void main() {
      float rim = pow(clamp(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 3.4);
      gl_FragColor = vec4(glowColor, clamp(rim * intensity, 0.0, 1.0));
    }
  `
);

extend({ EarthMaterial, AtmosphereMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    earthMaterial: Record<string, unknown>;
    atmosphereMaterial: Record<string, unknown>;
  }
}
