(function(Vue) {
  const { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

  const CK_VERSION = '0.41.1';
  const CK_CDN = `https://unpkg.com/canvaskit-wasm@${CK_VERSION}/bin`;

  // ===== SKSL Shader Source Code =====
  const SKSL_SHADERS = {
    grayscale: `
      uniform shader image;
      half4 main(float2 coord) {
        half4 c = image.eval(coord);
        half gray = dot(c.rgb, half3(0.2126, 0.7152, 0.0722));
        return half4(gray, gray, gray, c.a);
      }
    `,
    sepia: `
      uniform shader image;
      uniform float intensity;
      half4 main(float2 coord) {
        half4 c = image.eval(coord);
        half3 sepia = half3(
          dot(c.rgb, half3(0.393, 0.769, 0.189)),
          dot(c.rgb, half3(0.349, 0.686, 0.168)),
          dot(c.rgb, half3(0.272, 0.534, 0.131))
        );
        return half4(mix(c.rgb, sepia, half(intensity)), c.a);
      }
    `,
    invert: `
      uniform shader image;
      half4 main(float2 coord) {
        half4 c = image.eval(coord);
        return half4(1.0 - c.r, 1.0 - c.g, 1.0 - c.b, c.a);
      }
    `,
    brightness: `
      uniform shader image;
      uniform float amount;
      half4 main(float2 coord) {
        half4 c = image.eval(coord);
        return half4(c.rgb + half(amount), c.a);
      }
    `,
    contrast: `
      uniform shader image;
      uniform float amount;
      half4 main(float2 coord) {
        half4 c = image.eval(coord);
        half3 adjusted = (c.rgb - 0.5) * half(amount) + 0.5;
        return half4(clamp(adjusted, half3(0.0), half3(1.0)), c.a);
      }
    `,
    saturation: `
      uniform shader image;
      uniform float amount;
      half4 main(float2 coord) {
        half4 c = image.eval(coord);
        half gray = dot(c.rgb, half3(0.2126, 0.7152, 0.0722));
        half3 result = mix(half3(gray), c.rgb, half(amount));
        return half4(clamp(result, half3(0.0), half3(1.0)), c.a);
      }
    `,
    hueRotate: `
      uniform shader image;
      uniform float angle;
      half4 main(float2 coord) {
        half4 c = image.eval(coord);
        float cosA = cos(angle);
        float sinA = sin(angle);
        half3x3 hueMatrix = half3x3(
          half3(0.213 + cosA*0.787 - sinA*0.213, 0.715 - cosA*0.715 - sinA*0.715, 0.072 - cosA*0.072 + sinA*0.928),
          half3(0.213 - cosA*0.213 + sinA*0.143, 0.715 + cosA*0.285 + sinA*0.140, 0.072 - cosA*0.072 - sinA*0.283),
          half3(0.213 - cosA*0.213 - sinA*0.787, 0.715 - cosA*0.715 + sinA*0.715, 0.072 + cosA*0.928 + sinA*0.072)
        );
        half3 result = hueMatrix * c.rgb;
        return half4(clamp(result, half3(0.0), half3(1.0)), c.a);
      }
    `,
    gamma: `
      uniform shader image;
      uniform float gamma;
      half4 main(float2 coord) {
        half4 c = image.eval(coord);
        half3 result = pow(c.rgb, half3(1.0 / half(gamma)));
        return half4(result, c.a);
      }
    `,
    threshold: `
      uniform shader image;
      uniform float level;
      half4 main(float2 coord) {
        half4 c = image.eval(coord);
        half gray = dot(c.rgb, half3(0.2126, 0.7152, 0.0722));
        half bw = step(half(level), gray);
        return half4(bw, bw, bw, c.a);
      }
    `,
    posterize: `
      uniform shader image;
      uniform float levels;
      half4 main(float2 coord) {
        half4 c = image.eval(coord);
        half3 result = floor(c.rgb * half(levels)) / half(levels - 1.0);
        return half4(clamp(result, half3(0.0), half3(1.0)), c.a);
      }
    `,
    solarize: `
      uniform shader image;
      uniform float threshold;
      half4 main(float2 coord) {
        half4 c = image.eval(coord);
        half3 result = mix(c.rgb, 1.0 - c.rgb, step(half(threshold), c.rgb));
        return half4(result, c.a);
      }
    `,
    vignette: `
      uniform shader image;
      uniform float2 resolution;
      uniform float intensity;
      uniform float radius;
      half4 main(float2 coord) {
        half4 c = image.eval(coord);
        float2 uv = coord / resolution;
        float2 center = float2(0.5, 0.5);
        float dist = distance(uv, center);
        float vig = smoothstep(radius, radius - 0.45, dist);
        return half4(c.rgb * half(mix(1.0 - intensity, 1.0, vig)), c.a);
      }
    `,
    chromaticAberration: `
      uniform shader image;
      uniform float2 resolution;
      uniform float amount;
      half4 main(float2 coord) {
        float2 uv = coord / resolution;
        float2 center = float2(0.5, 0.5);
        float2 dir = uv - center;
        float dist = length(dir);
        float2 offset = dir * dist * amount;
        half4 r = image.eval(coord + offset * resolution);
        half4 g = image.eval(coord);
        half4 b = image.eval(coord - offset * resolution);
        return half4(r.r, g.g, b.b, g.a);
      }
    `,
    pixelate: `
      uniform shader image;
      uniform float2 resolution;
      uniform float size;
      half4 main(float2 coord) {
        float2 uv = coord / resolution;
        float2 pixelUV = floor(uv * size) / size;
        return image.eval(pixelUV * resolution);
      }
    `,
    noise: `
      uniform shader image;
      uniform float amount;
      uniform float seed;
      half4 main(float2 coord) {
        half4 c = image.eval(coord);
        float n = fract(sin(dot(coord + seed, float2(12.9898, 78.233))) * 43758.5453);
        half3 noiseColor = c.rgb + half3(half(n) - 0.5) * half(amount);
        return half4(clamp(noiseColor, half3(0.0), half3(1.0)), c.a);
      }
    `,
    emboss: `
      uniform shader image;
      uniform float2 resolution;
      uniform float strength;
      half4 main(float2 coord) {
        float2 step = 1.0 / resolution;
        half4 tl = image.eval(coord + float2(-step.x, -step.y) * resolution.x * 0.002);
        half4 br = image.eval(coord + float2(step.x, step.y) * resolution.x * 0.002);
        half4 c = image.eval(coord);
        half3 diff = (tl.rgb - br.rgb) * half(strength) + 0.5;
        return half4(diff, c.a);
      }
    `,
    sharpen: `
      uniform shader image;
      uniform float2 resolution;
      uniform float amount;
      half4 main(float2 coord) {
        float2 px = 1.0 / resolution;
        half4 c = image.eval(coord);
        half4 n = image.eval(coord + float2(0, -px.y));
        half4 s = image.eval(coord + float2(0, px.y));
        half4 e = image.eval(coord + float2(px.x, 0));
        half4 w = image.eval(coord + float2(-px.x, 0));
        half4 sharpened = c * half(1.0 + 4.0 * amount) - (n + s + e + w) * half(amount);
        return half4(clamp(sharpened.rgb, half3(0.0), half3(1.0)), c.a);
      }
    `,
    edgeDetect: `
      uniform shader image;
      uniform float2 resolution;
      half4 main(float2 coord) {
        float2 px = 1.0 / resolution;
        half4 c = image.eval(coord);
        half4 n = image.eval(coord + float2(0, -px.y));
        half4 s = image.eval(coord + float2(0, px.y));
        half4 e = image.eval(coord + float2(px.x, 0));
        half4 w = image.eval(coord + float2(-px.x, 0));
        half4 edge = abs(c * 4.0 - n - s - e - w);
        half gray = dot(edge.rgb, half3(0.2126, 0.7152, 0.0722));
        return half4(gray, gray, gray, c.a);
      }
    `,
    ripple: `
      uniform shader image;
      uniform float2 resolution;
      uniform float time;
      uniform float amplitude;
      uniform float frequency;
      half4 main(float2 coord) {
        float2 uv = coord / resolution;
        float2 center = float2(0.5, 0.5);
        float dist = distance(uv, center);
        float wave = sin(dist * frequency - time) * amplitude;
        float2 offset = normalize(uv - center) * wave;
        return image.eval((uv + offset) * resolution);
      }
    `,
    swirl: `
      uniform shader image;
      uniform float2 resolution;
      uniform float angle;
      uniform float radius;
      half4 main(float2 coord) {
        float2 uv = coord / resolution;
        float2 center = float2(0.5, 0.5);
        float2 delta = uv - center;
        float dist = length(delta);
        float factor = max(1.0 - dist / radius, 0.0);
        float swirlAngle = angle * factor * factor;
        float cosA = cos(swirlAngle);
        float sinA = sin(swirlAngle);
        float2 rotated = float2(
          delta.x * cosA - delta.y * sinA,
          delta.x * sinA + delta.y * cosA
        );
        return image.eval((center + rotated) * resolution);
      }
    `,
    fisheye: `
      uniform shader image;
      uniform float2 resolution;
      uniform float power;
      half4 main(float2 coord) {
        float2 uv = coord / resolution;
        float2 center = float2(0.5, 0.5);
        float2 delta = uv - center;
        float dist = length(delta);
        float bind = 0.5;
        if (dist < bind) {
          float factor = pow(dist / bind, power);
          delta = delta * factor / dist * bind;
        }
        return image.eval((center + delta) * resolution);
      }
    `,
    glitch: `
      uniform shader image;
      uniform float2 resolution;
      uniform float amount;
      uniform float seed;
      half4 main(float2 coord) {
        float2 uv = coord / resolution;
        float line = floor(uv.y * 50.0);
        float shift = fract(sin(line * 43.13 + seed) * 4357.0) * step(0.95 - amount * 0.5, fract(sin(line * 12.9898 + seed) * 43758.5453));
        float2 offset = float2(shift * amount * 0.1, 0.0);
        half4 r = image.eval((uv + offset) * resolution);
        half4 g = image.eval(coord);
        half4 b = image.eval((uv - offset) * resolution);
        return half4(r.r, g.g, b.b, 1.0);
      }
    `,
    duotone: `
      uniform shader image;
      uniform half3 color1;
      uniform half3 color2;
      half4 main(float2 coord) {
        half4 c = image.eval(coord);
        half gray = dot(c.rgb, half3(0.2126, 0.7152, 0.0722));
        half3 result = mix(color1, color2, gray);
        return half4(result, c.a);
      }
    `,
    colorChannelMix: `
      uniform shader image;
      uniform float redShift;
      uniform float greenShift;
      uniform float blueShift;
      half4 main(float2 coord) {
        half4 c = image.eval(coord);
        return half4(
          clamp(c.r + half(redShift), half(0.0), half(1.0)),
          clamp(c.g + half(greenShift), half(0.0), half(1.0)),
          clamp(c.b + half(blueShift), half(0.0), half(1.0)),
          c.a
        );
      }
    `,
    filmGrain: `
      uniform shader image;
      uniform float2 resolution;
      uniform float amount;
      uniform float seed;
      half4 main(float2 coord) {
        half4 c = image.eval(coord);
        float2 uv = coord / resolution;
        float grain = fract(sin(dot(uv * seed, float2(12.9898, 78.233))) * 43758.5453);
        grain = (grain - 0.5) * amount;
        half luma = dot(c.rgb, half3(0.2126, 0.7152, 0.0722));
        half grainScale = 1.0 - smoothstep(half(0.2), half(0.8), luma);
        return half4(c.rgb + half(grain) * grainScale, c.a);
      }
    `,
    tiltShift: `
      uniform shader image;
      uniform float2 resolution;
      uniform float focusY;
      uniform float blurSize;
      half4 main(float2 coord) {
        float2 uv = coord / resolution;
        float dist = abs(uv.y - focusY);
        float blur = smoothstep(0.0, 0.3, dist) * blurSize;
        half4 sum = half4(0.0);
        float total = 0.0;
        for (float i = -4.0; i <= 4.0; i += 1.0) {
          for (float j = -4.0; j <= 4.0; j += 1.0) {
            float2 offset = float2(i, j) * blur;
            float weight = 1.0 - length(float2(i, j)) / 5.66;
            if (weight > 0.0) {
              sum += image.eval(coord + offset) * half(weight);
              total += weight;
            }
          }
        }
        return sum / half(total);
      }
    `,
    thermalVision: `
      uniform shader image;
      half4 main(float2 coord) {
        half4 c = image.eval(coord);
        half luma = dot(c.rgb, half3(0.2126, 0.7152, 0.0722));
        half3 thermal;
        if (luma < 0.25) {
          thermal = mix(half3(0.0, 0.0, 0.5), half3(0.0, 0.0, 1.0), luma * 4.0);
        } else if (luma < 0.5) {
          thermal = mix(half3(0.0, 0.0, 1.0), half3(0.0, 1.0, 0.0), (luma - 0.25) * 4.0);
        } else if (luma < 0.75) {
          thermal = mix(half3(0.0, 1.0, 0.0), half3(1.0, 1.0, 0.0), (luma - 0.5) * 4.0);
        } else {
          thermal = mix(half3(1.0, 1.0, 0.0), half3(1.0, 0.0, 0.0), (luma - 0.75) * 4.0);
        }
        return half4(thermal, c.a);
      }
    `,
    nightVision: `
      uniform shader image;
      uniform float2 resolution;
      uniform float seed;
      half4 main(float2 coord) {
        half4 c = image.eval(coord);
        half luma = dot(c.rgb, half3(0.2126, 0.7152, 0.0722));
        float2 uv = coord / resolution;
        float noise = fract(sin(dot(uv + seed, float2(12.9898, 78.233))) * 43758.5453) * 0.1;
        half green = luma * 1.5 + half(noise);
        return half4(half(0.1) * luma, clamp(green, half(0.0), half(1.0)), half(0.1) * luma, c.a);
      }
    `,
    crossProcess: `
      uniform shader image;
      half4 main(float2 coord) {
        half4 c = image.eval(coord);
        half3 result;
        result.r = clamp(c.r * 1.2 + c.g * 0.1 - 0.1, half(0.0), half(1.0));
        result.g = clamp(c.g * 1.1 - c.b * 0.1 + 0.05, half(0.0), half(1.0));
        result.b = clamp(c.b * 0.8 + c.r * 0.2 + 0.1, half(0.0), half(1.0));
        return half4(result, c.a);
      }
    `,
    sketch: `
      uniform shader image;
      uniform float2 resolution;
      uniform float intensity;
      half4 main(float2 coord) {
        float2 px = 1.0 / resolution;
        half4 c00 = image.eval(coord + float2(-px.x, -px.y));
        half4 c10 = image.eval(coord + float2(0, -px.y));
        half4 c20 = image.eval(coord + float2(px.x, -px.y));
        half4 c01 = image.eval(coord + float2(-px.x, 0));
        half4 c21 = image.eval(coord + float2(px.x, 0));
        half4 c02 = image.eval(coord + float2(-px.x, px.y));
        half4 c12 = image.eval(coord + float2(0, px.y));
        half4 c22 = image.eval(coord + float2(px.x, px.y));
        half4 sx = -c00 - 2.0*c01 - c02 + c20 + 2.0*c21 + c22;
        half4 sy = -c00 - 2.0*c10 - c20 + c02 + 2.0*c12 + c22;
        half edge = length(half2(length(sx.rgb), length(sy.rgb)));
        half result = 1.0 - clamp(edge * half(intensity), half(0.0), half(1.0));
        return half4(result, result, result, 1.0);
      }
    `,
    oilPaint: `
      uniform shader image;
      uniform float2 resolution;
      uniform float radius;
      half4 main(float2 coord) {
        half4 sum = half4(0.0);
        float count = 0.0;
        float r = radius;
        for (float x = -r; x <= r; x += 1.0) {
          for (float y = -r; y <= r; y += 1.0) {
            if (x*x + y*y <= r*r) {
              sum += image.eval(coord + float2(x, y));
              count += 1.0;
            }
          }
        }
        return sum / half(count);
      }
    `,
    halftone: `
      uniform shader image;
      uniform float2 resolution;
      uniform float dotSize;
      half4 main(float2 coord) {
        float2 uv = coord / resolution;
        float2 grid = floor(uv * dotSize) / dotSize;
        half4 c = image.eval(grid * resolution);
        half luma = dot(c.rgb, half3(0.2126, 0.7152, 0.0722));
        float2 cellUV = fract(uv * dotSize);
        float dist = distance(cellUV, float2(0.5, 0.5));
        half dotRadius = (1.0 - luma) * 0.5;
        half result = step(half(dist), dotRadius);
        return half4(result * c.rgb, 1.0);
      }
    `
  };

  // ===== LANGS =====
  const LANGS = {
    tr: {
      open: 'Aç', save: 'Kaydet', export: 'Dışa Aktar', reset: 'Sıfırla', original: 'Orijinal', split: 'Bölünmüş',
      filters: 'Filtreler', effects: 'Efektler', processing: 'İşleniyor...', loadingCK: 'CanvasKit yükleniyor...',
      dropHere: 'Fotoğrafı buraya sürükleyin', browseFile: 'Dosya Seç', zoom: 'Yakınlaştırma', effect: 'Efekt',
      shaders: 'SKSL Shaders', color: 'Renk', blur: 'Bulanıklaştırma', imagefilters: 'Görüntü Filtreleri',
      presets: 'Hazır Filtreler', blend: 'Karışım', transform: 'Dönüşüm',
      grayscale: 'Gri Tonlama', sepia: 'Sepya', invert: 'Negatif', brightness: 'Parlaklık',
      contrast: 'Kontrast', saturation: 'Doygunluk', hueRotate: 'Renk Tonu', gamma: 'Gama',
      threshold: 'Eşik', posterize: 'Posterize', solarize: 'Solarize', vignette: 'Vinyet',
      chromaticAberration: 'Kromatik Sapma', pixelate: 'Pikselleştir', noise: 'Gürültü',
      emboss: 'Kabartma', sharpen: 'Keskinleştir', edgeDetect: 'Kenar Algılama',
      ripple: 'Dalga', swirl: 'Girdap', fisheye: 'Balık Gözü', glitch: 'Glitch',
      duotone: 'Çift Ton', colorChannelMix: 'Kanal Karışımı', filmGrain: 'Film Greni',
      tiltShift: 'Tilt-Shift', thermalVision: 'Termal Görüş', nightVision: 'Gece Görüşü',
      crossProcess: 'Cross Process', sketch: 'Karakalem', oilPaint: 'Yağlı Boya', halftone: 'Yarım Ton',
      intensity: 'Yoğunluk', amount: 'Miktar', radius: 'Yarıçap', level: 'Seviye', levels: 'Seviyeler',
      angle: 'Açı', power: 'Güç', frequency: 'Frekans', amplitude: 'Genlik', time: 'Zaman',
      focusY: 'Odak Y', blurSize: 'Bulanıklık', dotSize: 'Nokta Boyutu', size: 'Boyut', seed: 'Tohum',
      redShift: 'Kırmızı', greenShift: 'Yeşil', blueShift: 'Mavi',
      blurGaussian: 'Gauss Bulanıklaştırma', blurMotion: 'Hareket Bulanıklaştırma', blurZoom: 'Zoom Bulanıklaştırma',
      dilate: 'Genişlet', erode: 'Aşındır', matrixConvolution: 'Matris Konvolüsyon',
      dropShadow: 'Gölge', innerShadow: 'İç Gölge',
      blendNormal: 'Normal', blendMultiply: 'Çarpma', blendScreen: 'Ekran', blendOverlay: 'Kaplama',
      blendDarken: 'Koyulaştır', blendLighten: 'Aydınlat', blendColorDodge: 'Renk Yanması',
      blendColorBurn: 'Renk Yakması', blendHardLight: 'Sert Işık', blendSoftLight: 'Yumuşak Işık',
      blendDifference: 'Fark', blendExclusion: 'Dışlama',
      blendColor: 'Karışım Rengi', opacity: 'Opaklık',
      flipH: 'Yatay Çevir', flipV: 'Dikey Çevir', rotate90: '90° Döndür', rotate180: '180° Döndür',
      rotate270: '270° Döndür',
      vintage: 'Vintage', coldBlue: 'Soğuk Mavi', warmSunset: 'Sıcak Gün Batımı', cyberpunk: 'Cyberpunk',
      dreamy: 'Rüya', noir: 'Film Noir', retro: 'Retro', pop: 'Pop Art',
      arctic: 'Arktik', autumn: 'Sonbahar', underwater: 'Sualtı', lomo: 'Lomo',
      sigma: 'Sigma', strength: 'Güçlülük'
    },
    en: {
      open: 'Open', save: 'Save', export: 'Export', reset: 'Reset', original: 'Original', split: 'Split',
      filters: 'Filters', effects: 'Effects', processing: 'Processing...', loadingCK: 'Loading CanvasKit...',
      dropHere: 'Drop photo here', browseFile: 'Browse File', zoom: 'Zoom', effect: 'Effect',
      shaders: 'SKSL Shaders', color: 'Color', blur: 'Blur', imagefilters: 'Image Filters',
      presets: 'Presets', blend: 'Blend', transform: 'Transform',
      grayscale: 'Grayscale', sepia: 'Sepia', invert: 'Invert', brightness: 'Brightness',
      contrast: 'Contrast', saturation: 'Saturation', hueRotate: 'Hue Rotate', gamma: 'Gamma',
      threshold: 'Threshold', posterize: 'Posterize', solarize: 'Solarize', vignette: 'Vignette',
      chromaticAberration: 'Chromatic Aberration', pixelate: 'Pixelate', noise: 'Noise',
      emboss: 'Emboss', sharpen: 'Sharpen', edgeDetect: 'Edge Detect',
      ripple: 'Ripple', swirl: 'Swirl', fisheye: 'Fisheye', glitch: 'Glitch',
      duotone: 'Duotone', colorChannelMix: 'Channel Mix', filmGrain: 'Film Grain',
      tiltShift: 'Tilt-Shift', thermalVision: 'Thermal Vision', nightVision: 'Night Vision',
      crossProcess: 'Cross Process', sketch: 'Sketch', oilPaint: 'Oil Paint', halftone: 'Halftone',
      intensity: 'Intensity', amount: 'Amount', radius: 'Radius', level: 'Level', levels: 'Levels',
      angle: 'Angle', power: 'Power', frequency: 'Frequency', amplitude: 'Amplitude', time: 'Time',
      focusY: 'Focus Y', blurSize: 'Blur Size', dotSize: 'Dot Size', size: 'Size', seed: 'Seed',
      redShift: 'Red', greenShift: 'Green', blueShift: 'Blue',
      blurGaussian: 'Gaussian Blur', blurMotion: 'Motion Blur', blurZoom: 'Zoom Blur',
      dilate: 'Dilate', erode: 'Erode', matrixConvolution: 'Matrix Convolution',
      dropShadow: 'Drop Shadow', innerShadow: 'Inner Shadow',
      blendNormal: 'Normal', blendMultiply: 'Multiply', blendScreen: 'Screen', blendOverlay: 'Overlay',
      blendDarken: 'Darken', blendLighten: 'Lighten', blendColorDodge: 'Color Dodge',
      blendColorBurn: 'Color Burn', blendHardLight: 'Hard Light', blendSoftLight: 'Soft Light',
      blendDifference: 'Difference', blendExclusion: 'Exclusion',
      blendColor: 'Blend Color', opacity: 'Opacity',
      flipH: 'Flip Horizontal', flipV: 'Flip Vertical', rotate90: 'Rotate 90°', rotate180: 'Rotate 180°',
      rotate270: 'Rotate 270°',
      vintage: 'Vintage', coldBlue: 'Cold Blue', warmSunset: 'Warm Sunset', cyberpunk: 'Cyberpunk',
      dreamy: 'Dreamy', noir: 'Film Noir', retro: 'Retro', pop: 'Pop Art',
      arctic: 'Arctic', autumn: 'Autumn', underwater: 'Underwater', lomo: 'Lomo',
      sigma: 'Sigma', strength: 'Strength'
    }
  };

  function getLocale() { try { return localStorage.getItem('sys_locale') || 'tr'; } catch { return 'tr'; } }

  let ckPromise = null;
  function loadCanvasKit() {
    if (ckPromise) return ckPromise;
    ckPromise = new Promise((resolve, reject) => {
      if (window.CanvasKitInit) {
        window.CanvasKitInit({ locateFile: (f) => `${CK_CDN}/${f}` }).then(resolve).catch(reject);
        return;
      }
      const script = document.createElement('script');
      script.src = `${CK_CDN}/canvaskit.js`;
      script.onload = () => {
        window.CanvasKitInit({ locateFile: (f) => `${CK_CDN}/${f}` }).then(resolve).catch(reject);
      };
      script.onerror = () => reject(new Error('CanvasKit script load failed'));
      document.head.appendChild(script);
    });
    return ckPromise;
  }

  return {
    setup() {
      const locale = ref(getLocale());
      function L(k) { return (LANGS[locale.value] || LANGS.tr)[k] || LANGS.tr[k] || k; }

      const loading = ref(true);
      const processing = ref(false);
      const mainCanvas = ref(null);
      const centerRef = ref(null);
      const fileInput = ref(null);
      const canvasWidth = ref(800);
      const canvasHeight = ref(600);
      const hasImage = ref(false);
      const imgW = ref(0);
      const imgH = ref(0);
      const zoom = ref(1);
      const isDragOver = ref(false);
      const showOriginal = ref(false);
      const splitView = ref(false);
      const activeCategory = ref('shaders');
      const activeEffect = ref('');
      const activePreset = ref('');
      const blendColor = ref('#ff6600');
      const blendOpacity = ref(50);

      let CanvasKit = null;
      let surface = null;
      let originalImage = null;
      let currentImage = null;
      let history = [];
      let historyIndex = -1;
      const canUndo = ref(false);
      const canRedo = ref(false);

      // Params
      const shaderParams = reactive({
        intensity: 1.0, amount: 0.0, radius: 0.5, level: 0.5, levels: 5,
        angle: 0, power: 1.5, frequency: 30, amplitude: 0.02, time: 0,
        focusY: 0.5, blurSize: 3, dotSize: 80, size: 10, seed: 1,
        redShift: 0, greenShift: 0, blueShift: 0, sigma: 5, strength: 1
      });
      const colorParams = reactive({ brightness: 0, contrast: 1, saturation: 1, hue: 0, gamma: 1 });
      const blurParams = reactive({ sigma: 5, angle: 0, strength: 5 });
      const imageFilterParams = reactive({ sigma: 3, dx: 5, dy: 5, strength: 2 });
      const transformParams = reactive({ angle: 0 });

      // Categories
      const categories = [
        { id: 'shaders', icon: '✨' },
        { id: 'color', icon: '🎨' },
        { id: 'blur', icon: '💨' },
        { id: 'imagefilters', icon: '🔲' },
        { id: 'presets', icon: '🎭' },
        { id: 'blend', icon: '🔀' },
        { id: 'transform', icon: '🔄' }
      ];

      // SKSL shader effects list
      const shaderEffects = [
        { id: 'grayscale', icon: '⚫' }, { id: 'sepia', icon: '📜' }, { id: 'invert', icon: '🔄' },
        { id: 'brightness', icon: '☀️' }, { id: 'contrast', icon: '🌓' }, { id: 'saturation', icon: '🌈' },
        { id: 'hueRotate', icon: '🎡' }, { id: 'gamma', icon: '📊' }, { id: 'threshold', icon: '⬛' },
        { id: 'posterize', icon: '🎨' }, { id: 'solarize', icon: '🌅' }, { id: 'vignette', icon: '📷' },
        { id: 'chromaticAberration', icon: '🌀' }, { id: 'pixelate', icon: '🟩' }, { id: 'noise', icon: '📺' },
        { id: 'emboss', icon: '🏔️' }, { id: 'sharpen', icon: '🔪' }, { id: 'edgeDetect', icon: '📐' },
        { id: 'ripple', icon: '🌊' }, { id: 'swirl', icon: '🌪️' }, { id: 'fisheye', icon: '🐟' },
        { id: 'glitch', icon: '⚡' }, { id: 'duotone', icon: '🎭' }, { id: 'colorChannelMix', icon: '🔴' },
        { id: 'filmGrain', icon: '🎞️' }, { id: 'tiltShift', icon: '📸' }, { id: 'thermalVision', icon: '🌡️' },
        { id: 'nightVision', icon: '🌙' }, { id: 'crossProcess', icon: '🧪' }, { id: 'sketch', icon: '✏️' },
        { id: 'oilPaint', icon: '🖌️' }, { id: 'halftone', icon: '⚪' }
      ];

      const colorEffects = [
        { id: 'brightness', icon: '☀️' }, { id: 'contrast', icon: '🌓' },
        { id: 'saturation', icon: '🌈' }, { id: 'hueRotate', icon: '🎡' }, { id: 'gamma', icon: '📊' }
      ];

      const blurEffects = [
        { id: 'blurGaussian', icon: '💨' }, { id: 'blurMotion', icon: '🏃' }, { id: 'blurZoom', icon: '🔍' }
      ];

      const imageFilterEffects = [
        { id: 'dilate', icon: '⬜' }, { id: 'erode', icon: '⬛' },
        { id: 'dropShadow', icon: '🖤' }, { id: 'matrixConvolution', icon: '🔲' }
      ];

      const blendModes = [
        { id: 'blendNormal', icon: '⬜' }, { id: 'blendMultiply', icon: '✖️' },
        { id: 'blendScreen', icon: '🖥️' }, { id: 'blendOverlay', icon: '📐' },
        { id: 'blendDarken', icon: '🌑' }, { id: 'blendLighten', icon: '🌕' },
        { id: 'blendColorDodge', icon: '💡' }, { id: 'blendColorBurn', icon: '🔥' },
        { id: 'blendHardLight', icon: '💎' }, { id: 'blendSoftLight', icon: '🕯️' },
        { id: 'blendDifference', icon: '➖' }, { id: 'blendExclusion', icon: '❌' }
      ];

      const transformEffects = [
        { id: 'flipH', icon: '↔️' }, { id: 'flipV', icon: '↕️' },
        { id: 'rotate90', icon: '↩️' }, { id: 'rotate180', icon: '🔃' }, { id: 'rotate270', icon: '↪️' }
      ];

      const presets = [
        { id: 'vintage', icon: '📸' }, { id: 'coldBlue', icon: '❄️' },
        { id: 'warmSunset', icon: '🌅' }, { id: 'cyberpunk', icon: '🤖' },
        { id: 'dreamy', icon: '💭' }, { id: 'noir', icon: '🎬' },
        { id: 'retro', icon: '📼' }, { id: 'pop', icon: '🎪' },
        { id: 'arctic', icon: '🧊' }, { id: 'autumn', icon: '🍂' },
        { id: 'underwater', icon: '🐠' }, { id: 'lomo', icon: '📷' }
      ];

      // Shader params definitions
      const shaderParamDefs = {
        sepia: [{ id: 'intensity', min: 0, max: 1, step: 0.05 }],
        brightness: [{ id: 'amount', min: -0.5, max: 0.5, step: 0.01 }],
        contrast: [{ id: 'amount', min: 0.5, max: 3, step: 0.05 }],
        saturation: [{ id: 'amount', min: 0, max: 3, step: 0.05 }],
        hueRotate: [{ id: 'angle', min: 0, max: 6.28, step: 0.05 }],
        gamma: [{ id: 'intensity', min: 0.2, max: 3, step: 0.05 }],
        threshold: [{ id: 'level', min: 0, max: 1, step: 0.01 }],
        posterize: [{ id: 'levels', min: 2, max: 20, step: 1 }],
        solarize: [{ id: 'level', min: 0, max: 1, step: 0.01 }],
        vignette: [{ id: 'intensity', min: 0, max: 1, step: 0.05 }, { id: 'radius', min: 0.1, max: 1, step: 0.05 }],
        chromaticAberration: [{ id: 'amount', min: 0, max: 0.05, step: 0.001 }],
        pixelate: [{ id: 'size', min: 10, max: 200, step: 5 }],
        noise: [{ id: 'amount', min: 0, max: 0.5, step: 0.01 }, { id: 'seed', min: 1, max: 100, step: 1 }],
        emboss: [{ id: 'strength', min: 0.5, max: 5, step: 0.1 }],
        sharpen: [{ id: 'amount', min: 0, max: 2, step: 0.05 }],
        ripple: [{ id: 'amplitude', min: 0, max: 0.1, step: 0.005 }, { id: 'frequency', min: 5, max: 100, step: 1 }, { id: 'time', min: 0, max: 10, step: 0.1 }],
        swirl: [{ id: 'angle', min: -10, max: 10, step: 0.1 }, { id: 'radius', min: 0.1, max: 1, step: 0.05 }],
        fisheye: [{ id: 'power', min: 0.5, max: 3, step: 0.1 }],
        glitch: [{ id: 'amount', min: 0, max: 1, step: 0.01 }, { id: 'seed', min: 1, max: 100, step: 1 }],
        colorChannelMix: [{ id: 'redShift', min: -0.5, max: 0.5, step: 0.01 }, { id: 'greenShift', min: -0.5, max: 0.5, step: 0.01 }, { id: 'blueShift', min: -0.5, max: 0.5, step: 0.01 }],
        filmGrain: [{ id: 'amount', min: 0, max: 0.3, step: 0.01 }, { id: 'seed', min: 1, max: 100, step: 1 }],
        tiltShift: [{ id: 'focusY', min: 0, max: 1, step: 0.01 }, { id: 'blurSize', min: 1, max: 8, step: 0.5 }],
        nightVision: [{ id: 'seed', min: 1, max: 100, step: 1 }],
        sketch: [{ id: 'intensity', min: 1, max: 5, step: 0.1 }],
        oilPaint: [{ id: 'radius', min: 1, max: 6, step: 0.5 }],
        halftone: [{ id: 'dotSize', min: 20, max: 150, step: 5 }]
      };

      function getShaderParams(effectId) { return shaderParamDefs[effectId] || []; }
      function getColorParams(effectId) {
        const defs = { brightness: [{ id: 'amount', min: -0.5, max: 0.5, step: 0.01 }], contrast: [{ id: 'amount', min: 0.5, max: 3, step: 0.05 }], saturation: [{ id: 'amount', min: 0, max: 3, step: 0.05 }], hueRotate: [{ id: 'angle', min: 0, max: 6.28, step: 0.05 }], gamma: [{ id: 'intensity', min: 0.2, max: 3, step: 0.05 }] };
        return defs[effectId] || [];
      }
      function getBlurParams(effectId) {
        const defs = { blurGaussian: [{ id: 'sigma', min: 0.5, max: 30, step: 0.5 }], blurMotion: [{ id: 'sigma', min: 1, max: 30, step: 0.5 }, { id: 'angle', min: 0, max: 360, step: 5 }], blurZoom: [{ id: 'strength', min: 1, max: 20, step: 0.5 }] };
        return defs[effectId] || [];
      }
      function getImageFilterParams(effectId) {
        const defs = { dilate: [{ id: 'strength', min: 1, max: 10, step: 1 }], erode: [{ id: 'strength', min: 1, max: 10, step: 1 }], dropShadow: [{ id: 'sigma', min: 1, max: 20, step: 0.5 }], matrixConvolution: [{ id: 'strength', min: 0.5, max: 5, step: 0.1 }] };
        return defs[effectId] || [];
      }
      function getTransformParams(effectId) { return []; }

      // ===== CanvasKit Init =====
      async function initCanvasKit() {
        try {
          CanvasKit = await loadCanvasKit();
          loading.value = false;
        } catch (e) {
          console.error('CanvasKit init failed:', e);
          loading.value = false;
        }
      }

      function createSurface() {
        if (surface) { surface.delete(); surface = null; }
        if (!mainCanvas.value || !CanvasKit) return;
        surface = CanvasKit.MakeCanvasSurface(mainCanvas.value);
        if (!surface) surface = CanvasKit.MakeSWCanvasSurface(mainCanvas.value);
      }

      // ===== Image Loading =====
      function loadImageFromBytes(bytes) {
        if (!CanvasKit) return;
        if (originalImage) originalImage.delete();
        if (currentImage) currentImage.delete();

        originalImage = CanvasKit.MakeImageFromEncoded(bytes);
        if (!originalImage) return;

        imgW.value = originalImage.width();
        imgH.value = originalImage.height();
        canvasWidth.value = originalImage.width();
        canvasHeight.value = originalImage.height();
        hasImage.value = true;
        currentImage = originalImage.makeShaderCubic(CanvasKit.TileMode.Clamp, CanvasKit.TileMode.Clamp, 1/3, 1/3);

        nextTick(() => {
          createSurface();
          fitZoom();
          drawImage(originalImage);
          pushHistory();
        });
      }

      function drawImage(img) {
        if (!surface || !CanvasKit || !img) return;
        const canvas = surface.getCanvas();
        canvas.clear(CanvasKit.Color(30, 30, 46, 255));
        const paint = new CanvasKit.Paint();
        canvas.drawImage(img, 0, 0, paint);
        paint.delete();
        surface.flush();
      }

      function drawImageWithPaint(img, paint) {
        if (!surface || !CanvasKit || !img) return;
        const canvas = surface.getCanvas();
        canvas.clear(CanvasKit.Color(30, 30, 46, 255));
        canvas.drawImage(img, 0, 0, paint);
        surface.flush();
      }

      // ===== History =====
      function pushHistory() {
        if (!surface || !CanvasKit) return;
        const snapshot = surface.makeImageSnapshot();
        const encoded = snapshot.encodeToBytes(CanvasKit.ImageFormat.PNG, 100);
        snapshot.delete();
        history = history.slice(0, historyIndex + 1);
        history.push(new Uint8Array(encoded));
        historyIndex = history.length - 1;
        canUndo.value = historyIndex > 0;
        canRedo.value = false;
      }

      function undo() {
        if (historyIndex <= 0) return;
        historyIndex--;
        restoreHistory();
      }
      function redo() {
        if (historyIndex >= history.length - 1) return;
        historyIndex++;
        restoreHistory();
      }
      function restoreHistory() {
        const img = CanvasKit.MakeImageFromEncoded(history[historyIndex]);
        if (img) {
          if (originalImage) originalImage.delete();
          originalImage = img;
          drawImage(originalImage);
        }
        canUndo.value = historyIndex > 0;
        canRedo.value = historyIndex < history.length - 1;
      }

      // ===== SKSL Shader Effects =====
      function applyShaderEffect(effectId) {
        activeEffect.value = effectId;
        activePreset.value = '';
        applyCurrentEffect();
      }

      function applyCurrentEffect() {
        if (!CanvasKit || !originalImage || !surface) return;
        const effectId = activeEffect.value;
        if (!effectId) return;

        // Check which category the effect belongs to
        if (SKSL_SHADERS[effectId]) {
          applySkslShader(effectId);
        } else if (effectId.startsWith('blur')) {
          applyBuiltinBlur(effectId);
        } else if (['dilate', 'erode', 'dropShadow', 'matrixConvolution'].includes(effectId)) {
          applyBuiltinImageFilter(effectId);
        } else if (effectId.startsWith('blend')) {
          applyBuiltinBlend(effectId);
        }
      }

      function applySkslShader(effectId) {
        if (!SKSL_SHADERS[effectId]) return;
        processing.value = true;

        try {
          const effect = CanvasKit.RuntimeEffect.Make(SKSL_SHADERS[effectId]);
          if (!effect) { processing.value = false; return; }

          const imgShader = originalImage.makeShaderCubic(
            CanvasKit.TileMode.Clamp, CanvasKit.TileMode.Clamp, 1/3, 1/3
          );

          const uniforms = buildUniforms(effectId, effect);
          const children = [imgShader];
          const shader = effect.makeShaderWithChildren(uniforms, children);

          const paint = new CanvasKit.Paint();
          paint.setShader(shader);

          const canvas = surface.getCanvas();
          canvas.clear(CanvasKit.Color(30, 30, 46, 255));
          canvas.drawRect(CanvasKit.LTRBRect(0, 0, canvasWidth.value, canvasHeight.value), paint);
          surface.flush();

          paint.delete();
          shader.delete();
          imgShader.delete();
          effect.delete();
        } catch(e) {
          console.error('Shader error:', e);
        }
        processing.value = false;
      }

      function buildUniforms(effectId, effect) {
        const count = effect.getUniformFloatCount();
        const uniforms = new Float32Array(count);
        let idx = 0;

        const uniformNames = [];
        for (let i = 0; i < effect.getUniformCount(); i++) {
          uniformNames.push(effect.getUniform(i));
        }

        for (const u of uniformNames) {
          const name = u.name;
          const cols = u.columns;
          const rows = u.rows;
          const totalSlots = cols * rows;

          if (name === 'image') { idx += totalSlots; continue; }

          if (name === 'resolution') {
            uniforms[idx] = canvasWidth.value;
            uniforms[idx + 1] = canvasHeight.value;
          } else if (name === 'color1') {
            uniforms[idx] = 0.1; uniforms[idx + 1] = 0.0; uniforms[idx + 2] = 0.3;
          } else if (name === 'color2') {
            uniforms[idx] = 1.0; uniforms[idx + 1] = 0.8; uniforms[idx + 2] = 0.2;
          } else if (name === 'intensity') {
            uniforms[idx] = shaderParams.intensity;
          } else if (name === 'amount') {
            uniforms[idx] = shaderParams.amount;
          } else if (name === 'radius') {
            uniforms[idx] = shaderParams.radius;
          } else if (name === 'level') {
            uniforms[idx] = shaderParams.level;
          } else if (name === 'levels') {
            uniforms[idx] = shaderParams.levels;
          } else if (name === 'angle') {
            uniforms[idx] = shaderParams.angle;
          } else if (name === 'power') {
            uniforms[idx] = shaderParams.power;
          } else if (name === 'frequency') {
            uniforms[idx] = shaderParams.frequency;
          } else if (name === 'amplitude') {
            uniforms[idx] = shaderParams.amplitude;
          } else if (name === 'time') {
            uniforms[idx] = shaderParams.time;
          } else if (name === 'focusY') {
            uniforms[idx] = shaderParams.focusY;
          } else if (name === 'blurSize') {
            uniforms[idx] = shaderParams.blurSize;
          } else if (name === 'dotSize') {
            uniforms[idx] = shaderParams.dotSize;
          } else if (name === 'size') {
            uniforms[idx] = shaderParams.size;
          } else if (name === 'seed') {
            uniforms[idx] = shaderParams.seed;
          } else if (name === 'redShift') {
            uniforms[idx] = shaderParams.redShift;
          } else if (name === 'greenShift') {
            uniforms[idx] = shaderParams.greenShift;
          } else if (name === 'blueShift') {
            uniforms[idx] = shaderParams.blueShift;
          } else if (name === 'threshold') {
            uniforms[idx] = shaderParams.level;
          } else if (name === 'gamma') {
            uniforms[idx] = shaderParams.intensity;
          } else if (name === 'strength') {
            uniforms[idx] = shaderParams.strength;
          } else {
            for (let s = 0; s < totalSlots; s++) uniforms[idx + s] = 0;
          }
          idx += totalSlots;
        }
        return uniforms;
      }

      // ===== CanvasKit Built-in Filters =====
      function applyBuiltinBlur(effectId) {
        if (!CanvasKit || !originalImage || !surface) return;
        processing.value = true;
        try {
          let filter;
          if (effectId === 'blurGaussian') {
            const s = blurParams.sigma;
            filter = CanvasKit.ImageFilter.MakeBlur(s, s, CanvasKit.TileMode.Clamp, null);
          } else if (effectId === 'blurMotion') {
            const s = blurParams.sigma;
            const rad = blurParams.angle * Math.PI / 180;
            const dx = Math.cos(rad) * s;
            const dy = Math.sin(rad) * s;
            filter = CanvasKit.ImageFilter.MakeBlur(Math.abs(dx) + 0.5, Math.abs(dy) + 0.5, CanvasKit.TileMode.Clamp, null);
          } else if (effectId === 'blurZoom') {
            const s = blurParams.strength;
            filter = CanvasKit.ImageFilter.MakeBlur(s, s, CanvasKit.TileMode.Clamp, null);
          }
          if (filter) {
            const paint = new CanvasKit.Paint();
            paint.setImageFilter(filter);
            drawImageWithPaint(originalImage, paint);
            paint.delete();
            filter.delete();
          }
        } catch(e) { console.error('Blur error:', e); }
        processing.value = false;
      }

      function applyBuiltinImageFilter(effectId) {
        if (!CanvasKit || !originalImage || !surface) return;
        processing.value = true;
        try {
          let filter;
          const s = Math.round(imageFilterParams.strength);
          if (effectId === 'dilate') {
            filter = CanvasKit.ImageFilter.MakeDilate(s, s, null);
          } else if (effectId === 'erode') {
            filter = CanvasKit.ImageFilter.MakeErode(s, s, null);
          } else if (effectId === 'dropShadow') {
            const sig = imageFilterParams.sigma;
            filter = CanvasKit.ImageFilter.MakeDropShadowOnly(5, 5, sig, sig, CanvasKit.Color(0, 0, 0, 180), null);
          } else if (effectId === 'matrixConvolution') {
            const k = imageFilterParams.strength;
            const kernel = [0, -k, 0, -k, 1 + 4*k, -k, 0, -k, 0];
            filter = CanvasKit.ImageFilter.MakeMatrixConvolution([3, 3], kernel, 1, 0, [1, 1], CanvasKit.TileMode.Clamp, true, null);
          }
          if (filter) {
            const paint = new CanvasKit.Paint();
            paint.setImageFilter(filter);
            drawImageWithPaint(originalImage, paint);
            paint.delete();
            filter.delete();
          }
        } catch(e) { console.error('ImageFilter error:', e); }
        processing.value = false;
      }

      function applyBuiltinBlend(effectId) {
        if (!CanvasKit || !originalImage || !surface) return;
        processing.value = true;
        try {
          const modeMap = {
            blendNormal: CanvasKit.BlendMode.SrcOver,
            blendMultiply: CanvasKit.BlendMode.Multiply,
            blendScreen: CanvasKit.BlendMode.Screen,
            blendOverlay: CanvasKit.BlendMode.Overlay,
            blendDarken: CanvasKit.BlendMode.Darken,
            blendLighten: CanvasKit.BlendMode.Lighten,
            blendColorDodge: CanvasKit.BlendMode.ColorDodge,
            blendColorBurn: CanvasKit.BlendMode.ColorBurn,
            blendHardLight: CanvasKit.BlendMode.HardLight,
            blendSoftLight: CanvasKit.BlendMode.SoftLight,
            blendDifference: CanvasKit.BlendMode.Difference,
            blendExclusion: CanvasKit.BlendMode.Exclusion
          };
          const mode = modeMap[effectId] || CanvasKit.BlendMode.SrcOver;
          const hex = blendColor.value.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);
          const a = Math.round(blendOpacity.value * 2.55);

          const canvas = surface.getCanvas();
          canvas.clear(CanvasKit.Color(30, 30, 46, 255));
          const basePaint = new CanvasKit.Paint();
          canvas.drawImage(originalImage, 0, 0, basePaint);
          basePaint.delete();

          const overlayPaint = new CanvasKit.Paint();
          overlayPaint.setColor(CanvasKit.Color(r, g, b, a));
          overlayPaint.setBlendMode(mode);
          canvas.drawRect(CanvasKit.LTRBRect(0, 0, canvasWidth.value, canvasHeight.value), overlayPaint);
          overlayPaint.delete();
          surface.flush();
        } catch(e) { console.error('Blend error:', e); }
        processing.value = false;
      }

      // ===== Color Effects (SKSL based) =====
      function applyColorEffect(effectId) {
        activeEffect.value = effectId;
        activePreset.value = '';
        applyCurrentEffect();
      }

      function applyBlurEffect(effectId) {
        activeEffect.value = effectId;
        activePreset.value = '';
        applyCurrentEffect();
      }

      function applyImageFilter(effectId) {
        activeEffect.value = effectId;
        activePreset.value = '';
        applyCurrentEffect();
      }

      function applyBlendMode(effectId) {
        activeEffect.value = effectId;
        activePreset.value = '';
        applyCurrentEffect();
      }

      function applyTransformEffect(effectId) {
        if (!CanvasKit || !originalImage || !surface) return;
        activeEffect.value = effectId;
        processing.value = true;

        try {
          const w = canvasWidth.value;
          const h = canvasHeight.value;
          const canvas = surface.getCanvas();
          canvas.clear(CanvasKit.Color(30, 30, 46, 255));
          canvas.save();

          if (effectId === 'flipH') {
            canvas.translate(w, 0);
            canvas.scale(-1, 1);
          } else if (effectId === 'flipV') {
            canvas.translate(0, h);
            canvas.scale(1, -1);
          } else if (effectId === 'rotate90') {
            canvas.translate(h, 0);
            canvas.rotate(90, 0, 0);
          } else if (effectId === 'rotate180') {
            canvas.translate(w, h);
            canvas.rotate(180, 0, 0);
          } else if (effectId === 'rotate270') {
            canvas.translate(0, w);
            canvas.rotate(270, 0, 0);
          }

          const paint = new CanvasKit.Paint();
          canvas.drawImage(originalImage, 0, 0, paint);
          paint.delete();
          canvas.restore();
          surface.flush();

          // Update original after transform
          const snapshot = surface.makeImageSnapshot();
          if (originalImage) originalImage.delete();
          originalImage = snapshot;

          if (effectId === 'rotate90' || effectId === 'rotate270') {
            const tmp = canvasWidth.value;
            canvasWidth.value = canvasHeight.value;
            canvasHeight.value = tmp;
            imgW.value = canvasWidth.value;
            imgH.value = canvasHeight.value;
            nextTick(() => { createSurface(); drawImage(originalImage); pushHistory(); });
          } else {
            pushHistory();
          }
        } catch(e) { console.error('Transform error:', e); }
        processing.value = false;
      }

      // ===== Presets =====
      function applyPreset(presetId) {
        if (!CanvasKit || !originalImage || !surface) return;
        activePreset.value = presetId;
        activeEffect.value = '';
        processing.value = true;

        try {
          const presetDefs = {
            vintage: () => applyPresetChain(['sepia'], { intensity: 0.7 }, 'vignette', { intensity: 0.4, radius: 0.6 }),
            coldBlue: () => applyPresetShader('colorChannelMix', { redShift: -0.1, greenShift: -0.05, blueShift: 0.15 }),
            warmSunset: () => applyPresetShader('colorChannelMix', { redShift: 0.15, greenShift: 0.05, blueShift: -0.1 }),
            cyberpunk: () => applyPresetShader('colorChannelMix', { redShift: 0.2, greenShift: -0.1, blueShift: 0.3 }),
            dreamy: () => { applyPresetShader('saturation', { amount: 0.6 }); },
            noir: () => applyPresetShader('grayscale', {}),
            retro: () => applyPresetShader('posterize', { levels: 6 }),
            pop: () => applyPresetShader('saturation', { amount: 2.5 }),
            arctic: () => applyPresetShader('colorChannelMix', { redShift: -0.15, greenShift: 0.05, blueShift: 0.2 }),
            autumn: () => applyPresetShader('colorChannelMix', { redShift: 0.15, greenShift: 0.05, blueShift: -0.15 }),
            underwater: () => applyPresetShader('colorChannelMix', { redShift: -0.2, greenShift: 0.1, blueShift: 0.15 }),
            lomo: () => applyPresetChain(['saturation'], { amount: 1.8 }, 'vignette', { intensity: 0.6, radius: 0.5 })
          };

          if (presetDefs[presetId]) presetDefs[presetId]();
        } catch(e) { console.error('Preset error:', e); }
        processing.value = false;
      }

      function applyPresetShader(shaderId, params) {
        Object.assign(shaderParams, params);
        activeEffect.value = shaderId;
        applySkslShader(shaderId);
      }

      function applyPresetChain(shaders, params1, shader2, params2) {
        Object.assign(shaderParams, params1);
        applySkslShader(shaders[0]);
        // Apply second effect on result
        const snapshot = surface.makeImageSnapshot();
        if (originalImage) originalImage.delete();
        originalImage = snapshot;
        Object.assign(shaderParams, params2);
        applySkslShader(shader2);
        // Restore original for future edits
        const finalSnapshot = surface.makeImageSnapshot();
        if (originalImage) originalImage.delete();
        originalImage = finalSnapshot;
      }

      // ===== File Operations =====
      function openFile() { fileInput.value && fileInput.value.click(); }

      function onFileSelected(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          loadImageFromBytes(new Uint8Array(ev.target.result));
        };
        reader.readAsArrayBuffer(file);
        e.target.value = '';
      }

      function onDragOver(e) { isDragOver.value = true; }
      function onDragLeave(e) { isDragOver.value = false; }
      function onDrop(e) {
        isDragOver.value = false;
        const file = e.dataTransfer.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          loadImageFromBytes(new Uint8Array(ev.target.result));
        };
        reader.readAsArrayBuffer(file);
      }

      async function saveFile() {
        if (!surface || !CanvasKit) return;
        const snapshot = surface.makeImageSnapshot();
        const pngBytes = snapshot.encodeToBytes(CanvasKit.ImageFormat.PNG, 100);
        snapshot.delete();
        const blob = new Blob([pngBytes], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'photo-filter-studio.png'; a.click();
        URL.revokeObjectURL(url);
      }

      async function exportFile() {
        if (!surface || !CanvasKit) return;
        const snapshot = surface.makeImageSnapshot();
        const jpegBytes = snapshot.encodeToBytes(CanvasKit.ImageFormat.JPEG, 92);
        snapshot.delete();
        const blob = new Blob([jpegBytes], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'photo-filter-studio.jpg'; a.click();
        URL.revokeObjectURL(url);
      }

      function resetAll() {
        if (history.length > 0) {
          const img = CanvasKit.MakeImageFromEncoded(history[0]);
          if (img) {
            if (originalImage) originalImage.delete();
            originalImage = img;
            drawImage(originalImage);
            pushHistory();
          }
        }
        activeEffect.value = '';
        activePreset.value = '';
      }

      function toggleOriginal() {
        if (!hasImage.value || history.length === 0) return;
        showOriginal.value = !showOriginal.value;
        if (showOriginal.value) {
          const img = CanvasKit.MakeImageFromEncoded(history[0]);
          if (img) { drawImage(img); img.delete(); }
        } else {
          drawImage(originalImage);
        }
      }

      function toggleSplit() { splitView.value = !splitView.value; }

      function fitZoom() {
        if (!centerRef.value || !hasImage.value) return;
        const cw = centerRef.value.clientWidth - 20;
        const ch = centerRef.value.clientHeight - 20;
        const zx = cw / canvasWidth.value;
        const zy = ch / canvasHeight.value;
        zoom.value = Math.min(zx, zy, 1);
      }

      // ===== Lifecycle =====
      function onLocaleChanged() { locale.value = getLocale(); }

      onMounted(() => {
        initCanvasKit();
        window.addEventListener('locale-changed', onLocaleChanged);
      });

      onUnmounted(() => {
        window.removeEventListener('locale-changed', onLocaleChanged);
        if (surface) { surface.delete(); surface = null; }
        if (originalImage) { originalImage.delete(); originalImage = null; }
        if (currentImage) { currentImage.delete(); currentImage = null; }
        history = [];
      });

      return {
        locale, L, loading, processing, mainCanvas, centerRef, fileInput,
        canvasWidth, canvasHeight, hasImage, imgW, imgH, zoom,
        isDragOver, showOriginal, splitView,
        activeCategory, activeEffect, activePreset,
        categories, shaderEffects, colorEffects, blurEffects, imageFilterEffects, blendModes, transformEffects, presets,
        shaderParams, colorParams, blurParams, imageFilterParams, transformParams,
        blendColor, blendOpacity,
        canUndo, canRedo,
        getShaderParams, getColorParams, getBlurParams, getImageFilterParams, getTransformParams,
        openFile, onFileSelected, onDragOver, onDragLeave, onDrop,
        saveFile, exportFile, resetAll, undo, redo,
        toggleOriginal, toggleSplit,
        applyShaderEffect, applyColorEffect, applyBlurEffect, applyImageFilter, applyBlendMode, applyTransformEffect,
        applyPreset, applyCurrentEffect
      };
    }
  };
})(Vue);
