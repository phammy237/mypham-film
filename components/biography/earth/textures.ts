import { useEffect } from "react";
import { useTexture } from "@react-three/drei";
import { SRGBColorSpace, RepeatWrapping, type Texture } from "three";

export const EARTH_TEXTURE_PATHS = {
  day: "/biography/earth/earth_atmos_2048.webp",
  night: "/biography/earth/earth_lights_2048.webp",
  normal: "/biography/earth/earth_normal_2048.webp",
  specular: "/biography/earth/earth_specular_2048.webp",
  clouds: "/biography/earth/earth_clouds_1024.png",
};

/** the lighter set used on mobile/low-power devices — skips the (already-small) cloud layer */
export function useEarthTextures(includeClouds: boolean) {
  const paths = includeClouds
    ? EARTH_TEXTURE_PATHS
    : { day: EARTH_TEXTURE_PATHS.day, night: EARTH_TEXTURE_PATHS.night, normal: EARTH_TEXTURE_PATHS.normal, specular: EARTH_TEXTURE_PATHS.specular };

  const textures = useTexture(paths) as Record<keyof typeof paths, Texture>;

  useEffect(() => {
    textures.day.colorSpace = SRGBColorSpace;
    textures.day.wrapS = textures.day.wrapT = RepeatWrapping;
    textures.night.colorSpace = SRGBColorSpace;
    textures.night.wrapS = textures.night.wrapT = RepeatWrapping;
    if ("clouds" in textures && textures.clouds) {
      (textures.clouds as Texture).colorSpace = SRGBColorSpace;
    }
    // normal/specular stay linear (default) — they're data maps, not color maps
  }, [textures]);

  return textures as {
    day: Texture;
    night: Texture;
    normal: Texture;
    specular: Texture;
    clouds?: Texture;
  };
}
