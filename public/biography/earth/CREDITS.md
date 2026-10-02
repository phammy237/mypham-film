# Earth texture credits

All five textures originate from the [three.js](https://github.com/mrdoob/three.js) project's official
example assets (`examples/textures/planets/`), which three.js distributes under its repository-wide
**MIT License**. The underlying imagery was produced by NASA (Blue Marble / Black Marble Earth
observation datasets); NASA media is generally not copyrighted and is released for unrestricted use.

| File | Original (three.js repo) | Role |
|---|---|---|
| `earth_atmos_2048.webp` | `earth_atmos_2048.jpg` | Day/albedo surface color |
| `earth_lights_2048.webp` | `earth_lights_2048.png` | Night-lights emissive map |
| `earth_normal_2048.webp` | `earth_normal_2048.jpg` | Normal map (terrain relief) |
| `earth_specular_2048.webp` | `earth_specular_2048.jpg` | Specular/roughness mask (oceans) |
| `earth_clouds_1024.png` | `earth_clouds_1024.png` | Transparent cloud layer |

Re-encoded locally to WebP (quality 82–85) to reduce payload size; `earth_clouds_1024.png` was kept in
its original PNG form because WebP re-encoding did not reduce its size (alpha-channel cloud texture).

Source: https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets
License: https://github.com/mrdoob/three.js/blob/dev/LICENSE (MIT)
