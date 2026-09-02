const fileInput = document.querySelector("#emo-file");
const preview = document.querySelector("#emo-preview");
const startCameraButton = document.querySelector("#emo-camera-start");
const analyzeButton = document.querySelector("#emo-analyze");
const clearButton = document.querySelector("#emo-clear");
const statusText = document.querySelector("#emo-status");
const label = document.querySelector("#emo-label");
const summary = document.querySelector("#emo-summary");
const promptText = document.querySelector("#emo-prompt");
const emotionList = document.querySelector("#emo-emotions");
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
  if (emotionList) emotionList.innerHTML = "";
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

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function emotionScores(signal) {
  const warmBoost = clamp01((signal.warmth - 1) * 0.8);
  const coolBoost = clamp01((1.12 - signal.warmth) * 0.9);
  const stillness = 1 - signal.motionScore;
  const lowLight = 1 - signal.lightAverage;
  const lowSaturation = 1 - signal.saturationAverage;

  return [
    { name: "Happy", value: clamp01(signal.lightAverage * 0.42 + signal.saturationAverage * 0.34 + warmBoost * 0.24 - signal.tension * 0.12) },
    { name: "Sad", value: clamp01(lowLight * 0.42 + lowSaturation * 0.32 + stillness * 0.18 - signal.energy * 0.1) },
    { name: "Shameful", value: clamp01(signal.mixed * 0.34 + signal.tension * 0.28 + lowLight * 0.22 + stillness * 0.12) },
    { name: "Angry", value: clamp01(signal.tension * 0.34 + signal.saturationAverage * 0.26 + warmBoost * 0.22 + signal.energy * 0.18) },
    { name: "Fearful", value: clamp01(signal.tension * 0.42 + coolBoost * 0.24 + signal.contrast * 0.22 + signal.mixed * 0.12) },
    { name: "Calm", value: clamp01((1 - signal.tension) * 0.38 + stillness * 0.3 + signal.lightAverage * 0.18 + lowSaturation * 0.14) }
  ].sort((a, b) => b.value - a.value);
}

function renderEmotionScores(scores) {
  if (!emotionList) return;
  emotionList.innerHTML = scores.map((score) => {
    const percent = Math.round(score.value * 100);
    return `<div class="emotion-row"><b>${score.name}</b><div class="meter"><i style="width:${percent}%"></i></div><span>${percent}%</span></div>`;
  }).join("");
}

function classifySignal(signal) {
  const scores = emotionScores(signal);
  const primary = scores[0] || { name: "Mixed", value: signal.mixed };
  const confidence = Math.round(primary.value * 100);

  if (primary.name === "Happy") {
    return {
      emotion: primary.name,
      confidence,
      scores,
      label: "Primary possible emotion: Happy",
      summary: "The strongest visible cue pattern points toward happiness, hope, openness, or positive energy.",
      prompt: "Journal prompt: What feels good, alive, or meaningful here?"
    };
  }
  if (primary.name === "Sad") {
    return {
      emotion: primary.name,
      confidence,
      scores,
      label: "Primary possible emotion: Sad",
      summary: "The strongest visible cue pattern points toward sadness, tiredness, heaviness, or low emotional energy.",
      prompt: "Journal prompt: What loss, disappointment, need, or fatigue might want care?"
    };
  }
  if (primary.name === "Shameful") {
    return {
      emotion: primary.name,
      confidence,
      scores,
      label: "Primary possible emotion: Shameful",
      summary: "The strongest visible cue pattern points toward shame, guardedness, self-consciousness, or wanting to withdraw.",
      prompt: "Journal prompt: What part of me needs dignity, reassurance, or protection from harsh judgment?"
    };
  }
  if (primary.name === "Angry") {
    return {
      emotion: primary.name,
      confidence,
      scores,
      label: "Primary possible emotion: Angry",
      summary: "The strongest visible cue pattern points toward anger, irritation, intensity, or mobilized energy.",
      prompt: "Journal prompt: What boundary, fairness need, or blocked goal might be underneath this?"
    };
  }
  if (primary.name === "Fearful") {
    return {
      emotion: primary.name,
      confidence,
      scores,
      label: "Primary possible emotion: Fearful",
      summary: "The strongest visible cue pattern points toward fear, anxiety, alertness, or threat scanning.",
      prompt: "Journal prompt: What would help me feel safer or more prepared right now?"
    };
  }
  return {
    emotion: primary.name,
    confidence,
    scores,
    label: "Primary possible emotion: Calm",
    summary: "The strongest visible cue pattern points toward calm, neutrality, steadiness, or low activation.",
    prompt: "Journal prompt: What is settled, and what still needs gentle attention?"
  };
}

function updateResult(signal) {
  const result = classifySignal(signal);
  label.textContent = result.label;
  summary.textContent = `${result.summary} Signal strength: ${result.confidence}%. This is not a diagnosis or proof of emotion. It is a private reflection cue generated from simple on-device visual signals.`;
  renderEmotionScores(result.scores);
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
