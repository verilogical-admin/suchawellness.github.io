const fileInput = document.querySelector("#emo-file");
const preview = document.querySelector("#emo-preview");
const startCameraButton = document.querySelector("#emo-camera-start");
const analyzeButton = document.querySelector("#emo-analyze");
const clearButton = document.querySelector("#emo-clear");
const statusText = document.querySelector("#emo-status");
const label = document.querySelector("#emo-label");
const summary = document.querySelector("#emo-summary");
const promptText = document.querySelector("#emo-prompt");
const energyMeter = document.querySelector("#emo-energy");
const tensionMeter = document.querySelector("#emo-tension");
const mixedMeter = document.querySelector("#emo-mixed");

let activeMedia = null;
let activeObjectUrl = null;
let activeStream = null;
let activeFile = null;
let activeBitmap = null;
let previousFrame = null;

function setStatus(message) {
  if (statusText) statusText.textContent = message;
}

function clearObjectUrl() {
  if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);
  activeObjectUrl = null;
}

function stopCamera() {
  if (activeStream) {
    activeStream.getTracks().forEach((track) => track.stop());
    activeStream = null;
  }
}

function clearBitmap() {
  if (activeBitmap?.close) activeBitmap.close();
  activeBitmap = null;
}

function resetPreview() {
  stopCamera();
  clearObjectUrl();
  clearBitmap();
  previousFrame = null;
  activeMedia = null;
  activeFile = null;
  if (fileInput) fileInput.value = "";
  preview.innerHTML = '<span class="placeholder">Choose a photo/video or start the camera for a private check-in.</span>';
  label.textContent = "No media analyzed yet.";
  summary.textContent = "Your browser-only reflection will appear here after analysis.";
  promptText.textContent = "This tool reads simple visual cues like light, contrast, color balance, and movement. It cannot know your inner life. Use it as a prompt to journal honestly.";
  [energyMeter, tensionMeter, mixedMeter].forEach((meter) => {
    meter.style.width = "0";
  });
  setStatus("Ready. For best reflection, use a clear, well-lit face image.");
}

function setPreviewMedia(element) {
  preview.replaceChildren(element);
  activeMedia = element;
}

function loadFile(file) {
  if (!file) return;
  stopCamera();
  clearObjectUrl();
  clearBitmap();
  activeFile = file;
  previousFrame = null;

  if (file.type.startsWith("video/")) {
    activeObjectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = activeObjectUrl;
    video.controls = true;
    video.muted = true;
    video.playsInline = true;
    video.addEventListener("loadeddata", () => setStatus("Video loaded locally. Play or pause on a clear frame, then analyze."));
    setPreviewMedia(video);
    return;
  }

  if (!file.type.startsWith("image/")) {
    setStatus("Choose a photo or video file.");
    return;
  }

  const img = document.createElement("img");
  img.alt = "Selected local face reflection";
  img.onload = () => {
    setStatus("Photo loaded locally. Analyzing this browser-only frame now.");
    analyzeVisibleFrame();
  };
  img.onerror = () => setStatus("This photo could not be loaded by the browser.");
  setPreviewMedia(img);

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    img.src = String(reader.result || "");
  });
  reader.addEventListener("error", () => setStatus("This photo could not be read on this device."));
  reader.readAsDataURL(file);

  decodeImageFile(file).then((bitmap) => {
    if (activeFile !== file) {
      if (bitmap?.close) bitmap.close();
      return;
    }
    clearBitmap();
    activeBitmap = bitmap;
    activeMedia = bitmap;
    setStatus("Photo decoded locally. Running browser-only analysis.");
    analyzeVisibleFrame();
  }).catch(() => {
    setStatus("Photo preview loaded. Click Analyze after it appears.");
  });
}

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    setStatus("This browser does not support camera access.");
    return;
  }
  stopCamera();
  clearObjectUrl();
  previousFrame = null;
  try {
    activeStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
    const video = document.createElement("video");
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.srcObject = activeStream;
    setPreviewMedia(video);
    setStatus("Camera is running locally in this browser. Nothing is uploaded.");
  } catch (error) {
    setStatus(error?.name === "NotAllowedError" ? "Camera permission was not allowed." : "Camera could not start on this device.");
  }
}

function frameSourceReady(media) {
  if (!media) return false;
  if (media instanceof HTMLImageElement) return Boolean(media.naturalWidth && media.naturalHeight);
  if (media instanceof HTMLVideoElement) return Boolean(media.videoWidth && media.videoHeight);
  if (typeof ImageBitmap !== "undefined" && media instanceof ImageBitmap) return Boolean(media.width && media.height);
  return false;
}

function drawFrame(media) {
  if (!frameSourceReady(media)) return null;
  const width = media instanceof HTMLImageElement ? media.naturalWidth : media.width || media.videoWidth;
  const height = media instanceof HTMLImageElement ? media.naturalHeight : media.height || media.videoHeight;
  const scale = Math.min(1, 180 / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(media, 0, 0, canvas.width, canvas.height);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

async function decodeImageFile(file) {
  if (!file?.type?.startsWith("image/")) throw new Error("Not an image file.");
  if (typeof createImageBitmap === "function") return createImageBitmap(file);

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", () => reject(new Error("Could not read image.")));
    reader.readAsDataURL(file);
  });

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image."));
    img.src = dataUrl;
  });
}

function analyzePixels(frame) {
  const data = frame.data;
  const luminance = [];
  let totalLight = 0;
  let totalSaturation = 0;
  let totalWarmth = 0;
  let totalBlue = 0;
  let motion = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const light = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    luminance.push(light);
    totalLight += light;
    totalSaturation += max === 0 ? 0 : (max - min) / max;
    totalWarmth += r + g * 0.28;
    totalBlue += b;

    if (previousFrame?.data?.length === data.length) {
      motion += Math.abs(data[i] - previousFrame.data[i]) + Math.abs(data[i + 1] - previousFrame.data[i + 1]) + Math.abs(data[i + 2] - previousFrame.data[i + 2]);
    }
  }

  const count = luminance.length || 1;
  const lightAverage = totalLight / count;
  const saturationAverage = totalSaturation / count;
  const contrast = Math.sqrt(luminance.reduce((sum, value) => sum + (value - lightAverage) ** 2, 0) / count);
  const warmth = totalWarmth / Math.max(totalBlue, 1);
  const motionScore = Math.min(1, motion / (count * 255 * 3 * 0.12));
  previousFrame = frame;

  const energy = Math.min(1, lightAverage * 0.45 + saturationAverage * 0.38 + motionScore * 0.3);
  const tension = Math.min(1, contrast * 1.9 + motionScore * 0.42 + (warmth < 1.05 ? 0.16 : 0));
  const mixed = Math.min(1, Math.abs(energy - tension) < 0.18 ? 0.58 + saturationAverage * 0.22 : (energy + tension) * 0.32);

  return { lightAverage, saturationAverage, contrast, warmth, motionScore, energy, tension, mixed };
}

function classifySignal(signal) {
  const confidence = Math.round(Math.max(signal.energy, signal.tension, signal.mixed) * 100);

  if (signal.energy > 0.58 && signal.tension > 0.48) {
    const emotion = signal.warmth > 1.24 ? "angry or excited" : "anxious or angry";
    return {
      emotion,
      confidence,
      label: `Possible emotion: ${emotion}`,
      summary: "The frame has higher visual energy and tension cues. A useful check-in: is this anger, excitement, pressure, alertness, irritation, or mixed intensity?",
      prompt: "Journal prompt: What is my body preparing me to do, and is that action actually needed right now?"
    };
  }
  if (signal.energy > 0.55) {
    const emotion = signal.warmth > 1.18 ? "happy or hopeful" : "surprised or energized";
    return {
      emotion,
      confidence,
      label: `Possible emotion: ${emotion}`,
      summary: "The frame shows brighter, more active visual cues. This may pair with happiness, enthusiasm, openness, momentum, or social energy.",
      prompt: "Journal prompt: What feels alive or important here, and how can I channel it cleanly?"
    };
  }
  if (signal.tension > 0.54) {
    const emotion = signal.mixed > 0.62 ? "shame or guarded fear" : "anxious or tense";
    return {
      emotion,
      confidence,
      label: `Possible emotion: ${emotion}`,
      summary: "The frame shows stronger contrast or alertness cues. That can be a prompt to check for shame, fear, stress, caution, fatigue, or pressure.",
      prompt: "Journal prompt: What am I protecting, and what boundary or reassurance would help?"
    };
  }
  if (signal.lightAverage < 0.36 && signal.saturationAverage < 0.34) {
    const emotion = "sad or tired";
    return {
      emotion,
      confidence,
      label: `Possible emotion: ${emotion}`,
      summary: "The frame is visually quieter and dimmer. This can be a reason to check for sadness, tiredness, heaviness, or simple lighting limits.",
      prompt: "Journal prompt: Do I need rest, support, food, movement, privacy, or a kinder interpretation?"
    };
  }
  const emotion = signal.mixed > 0.56 ? "mixed or uncertain" : "calm or neutral";
  return {
    emotion,
    confidence,
    label: `Possible emotion: ${emotion}`,
    summary: "The frame has moderate cues without a strong visible signal. That may reflect calm, neutrality, mixed emotion, privacy, or simply an image with limited emotional information.",
    prompt: "Journal prompt: What emotion is easy to name, and what smaller emotion might be underneath it?"
  };
}

function updateResult(signal) {
  const result = classifySignal(signal);
  label.textContent = result.label;
  summary.textContent = `${result.summary} Signal strength: ${result.confidence}%. This is not a diagnosis or proof of emotion. It is a private reflection cue generated from simple on-device visual signals.`;
  promptText.textContent = result.prompt;
  energyMeter.style.width = `${Math.round(signal.energy * 100)}%`;
  tensionMeter.style.width = `${Math.round(signal.tension * 100)}%`;
  mixedMeter.style.width = `${Math.round(signal.mixed * 100)}%`;
  setStatus("Analysis complete locally in this browser. No upload happened.");
}

async function analyzeVisibleFrame() {
  let frame = drawFrame(activeMedia);
  if (!frame && activeFile?.type?.startsWith("image/")) {
    setStatus("Decoding photo locally before analysis...");
    try {
      clearBitmap();
      activeBitmap = await decodeImageFile(activeFile);
      activeMedia = activeBitmap;
      frame = drawFrame(activeMedia);
    } catch {
      setStatus("This photo could not be decoded for analysis.");
      return;
    }
  }
  if (!frame) {
    setStatus("Choose a loaded photo/video or start the camera before analyzing.");
    return;
  }
  updateResult(analyzePixels(frame));
}

fileInput?.addEventListener("change", (event) => loadFile(event.target.files?.[0]));
startCameraButton?.addEventListener("click", startCamera);
analyzeButton?.addEventListener("click", () => analyzeVisibleFrame());
clearButton?.addEventListener("click", resetPreview);
window.addEventListener("pagehide", stopCamera);
