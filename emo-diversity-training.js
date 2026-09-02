import { FaceLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.mjs";

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
const cueInsightList = document.querySelector("#emo-cue-insights");
const energyMeter = document.querySelector("#emo-energy");
const tensionMeter = document.querySelector("#emo-tension");
const mixedMeter = document.querySelector("#emo-mixed");

let activeMedia = null;
let activeObjectUrl = null;
let activeStream = null;
let activeFile = null;
let activeBitmap = null;
let previousFrame = null;
let faceLandmarker = null;
let faceMode = "IMAGE";
let lastCueInsights = [];

const faceModelUrl = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";
const wasmRootUrl = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

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
  if (cueInsightList) cueInsightList.innerHTML = "";
  promptText.textContent = "This tool uses browser-side face expression signals when the face model loads. It cannot know your inner life. Use it as a prompt to journal honestly.";
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
  const mixed = Math.min(1, Math.abs(energy - tension) < 0.18 ? 0.36 + saturationAverage * 0.12 : (energy + tension) * 0.26);

  return { lightAverage, saturationAverage, contrast, warmth, motionScore, energy, tension, mixed };
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function signalAbove(value, threshold, range = 0.35) {
  return clamp01((value - threshold) / range);
}

function signalBelow(value, threshold, range = 0.35) {
  return clamp01((threshold - value) / range);
}

async function ensureFaceLandmarker(mode) {
  if (!faceLandmarker) {
    setStatus("Loading private on-device face expression model...");
    const vision = await FilesetResolver.forVisionTasks(wasmRootUrl);
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: faceModelUrl },
      outputFaceBlendshapes: true,
      runningMode: mode,
      numFaces: 1
    });
    faceMode = mode;
  } else if (faceMode !== mode) {
    await faceLandmarker.setOptions({ runningMode: mode });
    faceMode = mode;
  }
  return faceLandmarker;
}

function getBlendshape(blendshapes, names) {
  const wanted = Array.isArray(names) ? names : [names];
  let score = 0;
  wanted.forEach((name) => {
    score = Math.max(score, blendshapes.get(name) || 0);
  });
  return score;
}

function pointDistance(a, b) {
  if (!a || !b) return 0;
  return Math.hypot((a.x || 0) - (b.x || 0), (a.y || 0) - (b.y || 0));
}

function averagePoints(points) {
  const usable = points.filter(Boolean);
  if (!usable.length) return null;
  return {
    x: usable.reduce((sum, point) => sum + (point.x || 0), 0) / usable.length,
    y: usable.reduce((sum, point) => sum + (point.y || 0), 0) / usable.length
  };
}

function eyeGeometrySignals(landmarks = []) {
  const leftWidth = pointDistance(landmarks[33], landmarks[133]);
  const rightWidth = pointDistance(landmarks[263], landmarks[362]);
  if (leftWidth < 0.001 || rightWidth < 0.001) {
    return { narrow: 0, wide: 0, browClose: 0, browSlant: 0, browPinch: 0, asymmetry: 0, focus: 0, openRatio: 0, browGapRatio: 1 };
  }
  const leftOpen = pointDistance(landmarks[159], landmarks[145]) / Math.max(leftWidth, 0.001);
  const rightOpen = pointDistance(landmarks[386], landmarks[374]) / Math.max(rightWidth, 0.001);
  const eyeOpenRatio = (leftOpen + rightOpen) / 2;
  const eyeOpenAsymmetry = Math.abs(leftOpen - rightOpen);
  const leftBrow = averagePoints([landmarks[70], landmarks[105], landmarks[107]]);
  const rightBrow = averagePoints([landmarks[300], landmarks[334], landmarks[336]]);
  const leftEyeTop = averagePoints([landmarks[159], landmarks[160], landmarks[158]]);
  const rightEyeTop = averagePoints([landmarks[386], landmarks[385], landmarks[387]]);
  const leftBrowGap = leftEyeTop && leftBrow ? Math.abs(leftEyeTop.y - leftBrow.y) / Math.max(leftWidth, 0.001) : 1;
  const rightBrowGap = rightEyeTop && rightBrow ? Math.abs(rightEyeTop.y - rightBrow.y) / Math.max(rightWidth, 0.001) : 1;
  const browGapRatio = (leftBrowGap + rightBrowGap) / 2;
  const leftInnerBrow = landmarks[107];
  const leftOuterBrow = landmarks[70];
  const rightInnerBrow = landmarks[336];
  const rightOuterBrow = landmarks[300];
  const leftInnerDrop = leftInnerBrow && leftOuterBrow ? (leftInnerBrow.y - leftOuterBrow.y) / Math.max(leftWidth, 0.001) : 0;
  const rightInnerDrop = rightInnerBrow && rightOuterBrow ? (rightInnerBrow.y - rightOuterBrow.y) / Math.max(rightWidth, 0.001) : 0;
  const innerBrowDrop = Math.max(0, (leftInnerDrop + rightInnerDrop) / 2);
  const browPinchWidth = pointDistance(leftInnerBrow, rightInnerBrow) / Math.max((leftWidth + rightWidth) / 2, 0.001);
  const narrow = signalBelow(eyeOpenRatio, 0.3, 0.16);
  const wide = signalAbove(eyeOpenRatio, 0.24, 0.18);
  const browClose = signalBelow(browGapRatio, 0.85, 0.36);
  const browSlant = signalAbove(innerBrowDrop, 0.02, 0.1);
  const browPinch = signalBelow(browPinchWidth, 2.1, 0.7);
  const asymmetry = signalAbove(eyeOpenAsymmetry, 0.04, 0.14);
  return {
    narrow,
    wide,
    browClose,
    browSlant,
    browPinch,
    asymmetry,
    focus: Math.max(narrow, wide * 0.78, browClose, browSlant, browPinch * 0.72, asymmetry * 0.58),
    openRatio: eyeOpenRatio,
    browGapRatio
  };
}

function blendshapeScores(categories, landmarks = []) {
  const blendshapes = new Map(categories.map((category) => [category.categoryName, category.score]));
  const eyeGeometry = eyeGeometrySignals(landmarks);
  const smileLeft = getBlendshape(blendshapes, "mouthSmileLeft");
  const smileRight = getBlendshape(blendshapes, "mouthSmileRight");
  const smile = (smileLeft + smileRight) / 2;
  const frown = (getBlendshape(blendshapes, "mouthFrownLeft") + getBlendshape(blendshapes, "mouthFrownRight")) / 2;
  const browInner = getBlendshape(blendshapes, "browInnerUp");
  const browDown = (getBlendshape(blendshapes, "browDownLeft") + getBlendshape(blendshapes, "browDownRight")) / 2;
  const eyeWide = (getBlendshape(blendshapes, "eyeWideLeft") + getBlendshape(blendshapes, "eyeWideRight")) / 2;
  const eyeSquint = (getBlendshape(blendshapes, "eyeSquintLeft") + getBlendshape(blendshapes, "eyeSquintRight")) / 2;
  const eyeDown = (getBlendshape(blendshapes, "eyeLookDownLeft") + getBlendshape(blendshapes, "eyeLookDownRight")) / 2;
  const jawOpen = getBlendshape(blendshapes, "jawOpen");
  const mouthPress = (getBlendshape(blendshapes, "mouthPressLeft") + getBlendshape(blendshapes, "mouthPressRight")) / 2;
  const mouthShrug = Math.max(getBlendshape(blendshapes, "mouthShrugLower"), getBlendshape(blendshapes, "mouthShrugUpper"));
  const mouthDimple = (getBlendshape(blendshapes, "mouthDimpleLeft") + getBlendshape(blendshapes, "mouthDimpleRight")) / 2;
  const mouthLowerDown = (getBlendshape(blendshapes, "mouthLowerDownLeft") + getBlendshape(blendshapes, "mouthLowerDownRight")) / 2;
  const mouthUpperUp = (getBlendshape(blendshapes, "mouthUpperUpLeft") + getBlendshape(blendshapes, "mouthUpperUpRight")) / 2;
  const mouthStretch = (getBlendshape(blendshapes, "mouthStretchLeft") + getBlendshape(blendshapes, "mouthStretchRight")) / 2;
  const noseSneer = (getBlendshape(blendshapes, "noseSneerLeft") + getBlendshape(blendshapes, "noseSneerRight")) / 2;
  const smileAsymmetry = Math.abs(smileLeft - smileRight);
  const neutral = getBlendshape(blendshapes, "_neutral");
  const expressive = Math.max(smile, frown, browInner, browDown, eyeWide, jawOpen, mouthPress);
  const browDownStrong = Math.max(signalAbove(browDown, 0.18, 0.34), eyeGeometry.browClose, eyeGeometry.browSlant * 0.95);
  const squintStrong = Math.max(signalAbove(eyeSquint, 0.16, 0.32), eyeGeometry.narrow);
  const eyeNarrow = clamp01(squintStrong * 0.5 + signalBelow(eyeWide, 0.14, 0.24) * 0.18 + eyeGeometry.narrow * 0.46);
  const pressStrong = signalAbove(mouthPress, 0.18, 0.32);
  const eyeWideStrong = Math.max(signalAbove(eyeWide, 0.14, 0.34), eyeGeometry.wide);
  const narrowAnger = Math.min(browDownStrong + signalAbove(browDown, 0.24, 0.34) * 0.2, eyeNarrow + squintStrong * 0.14);
  const wideAnger = Math.min(eyeWideStrong, browDownStrong * 0.62 + pressStrong * 0.38);
  const angryEyes = Math.max(narrowAnger, wideAnger);
  const roundWideEyeIntensity = eyeGeometry.wide * signalBelow(jawOpen, 0.18, 0.18);
  const angerEyePattern = Math.max(
    Math.min(eyeGeometry.narrow, Math.max(eyeGeometry.browClose, eyeGeometry.browSlant, eyeGeometry.browPinch)),
    Math.min(roundWideEyeIntensity, Math.max(eyeGeometry.browSlant, eyeGeometry.browClose)),
    Math.min(eyeGeometry.focus, Math.max(eyeGeometry.browSlant, eyeGeometry.browClose) * 0.82 + pressStrong * 0.18)
  );
  const geometryAnger = Math.max(angerEyePattern, eyeGeometry.browPinch * eyeGeometry.browSlant, Math.min(eyeGeometry.wide * 0.52, Math.max(eyeGeometry.browSlant, eyeGeometry.browClose)));
  const intenseEyes = Math.max(angryEyes * 0.7, geometryAnger, Math.min(signalAbove(browDown, 0.2, 0.34), Math.max(squintStrong, eyeWideStrong * 0.48)));
  const eyeExpression = Math.max(eyeGeometry.focus, eyeGeometry.narrow, eyeGeometry.wide, eyeGeometry.browClose, eyeGeometry.browSlant, eyeGeometry.browPinch, squintStrong, eyeWideStrong);
  const angerCore = intenseEyes * 0.72 + browDownStrong * 0.16 + squintStrong * 0.08 + pressStrong * 0.04;
  const sadnessMouth = Math.max(signalAbove(frown, 0.03, 0.22), signalAbove(mouthShrug, 0.04, 0.24), signalAbove(mouthLowerDown, 0.04, 0.26));
  const sadnessBrow = signalAbove(browInner, 0.05, 0.26);
  const lowAngleSadBias = Math.min(signalAbove(eyeDown, 0.08, 0.3), signalBelow(sadnessMouth, 0.14, 0.14), signalBelow(sadnessBrow, 0.14, 0.14));
  const sadnessCore = clamp01(sadnessMouth * 0.62 + sadnessBrow * 0.38 - lowAngleSadBias * 0.42);
  const clearSmile = signalAbove(smile, 0.22, 0.34);
  const surpriseCore = Math.min(signalAbove(eyeWide, 0.14, 0.34), Math.max(signalAbove(jawOpen, 0.12, 0.34), signalAbove(mouthStretch, 0.12, 0.32)));
  const disgustCore = Math.max(signalAbove(noseSneer, 0.08, 0.26), signalAbove(mouthUpperUp, 0.08, 0.28));
  const contemptCore = Math.min(signalAbove(smileAsymmetry, 0.12, 0.3), Math.max(signalAbove(mouthPress, 0.14, 0.3), signalAbove(mouthDimple, 0.08, 0.28)));
  const fearCore = Math.min(signalAbove(eyeWide, 0.12, 0.34) + sadnessBrow * 0.24, signalAbove(jawOpen, 0.1, 0.34) + pressStrong * 0.2);
  lastCueInsights = [
    { name: "Eye expression cue", value: eyeExpression, text: "overall eye intensity from eye openness, brow closeness, brow slant, and asymmetry" },
    { name: "Anger eye cue", value: Math.max(angerEyePattern, geometryAnger, eyeGeometry.browClose * eyeGeometry.narrow), text: "lowered brow with narrowed eyes, tense wide eyes, or mouth press" },
    { name: "Surprise cue", value: surpriseCore, text: "wide eyes with jaw opening or stretched mouth" },
    { name: "Sadness cue", value: sadnessCore, text: "inner brow lift with downturned or heavy mouth signals" },
    { name: "Disgust cue", value: disgustCore, text: "nose sneer or upper-lip raise" },
    { name: "Contempt cue", value: contemptCore, text: "one-sided mouth movement with distancing tension" },
    { name: "Happy cue", value: clearSmile, text: "clear smile signal, especially when sadness cues are low" },
    { name: "Fear cue", value: fearCore, text: "wide eyes with alert brow or mouth tension" }
  ].sort((a, b) => b.value - a.value);
  const eyeOnlyAnger = Math.max(angerEyePattern, geometryAnger);

  return [
    { name: "Happy", value: clamp01(clearSmile * 0.72 + mouthDimple * 0.14 + signalBelow(eyeExpression, 0.16, 0.2) * 0.08 - sadnessCore * 0.42 - sadnessMouth * 0.18 - frown * 0.32 - mouthPress * 0.16) },
    { name: "Sad", value: clamp01(sadnessCore * 0.7 + sadnessMouth * 0.16 + Math.max(eyeDown, sadnessBrow, eyeGeometry.browClose * 0.32) * 0.18 - lowAngleSadBias * 0.34 - browDownStrong * 0.12 - clearSmile * 0.2) },
    { name: "Shameful", value: clamp01(pressStrong * 0.18 + Math.max(eyeDown, eyeGeometry.narrow * 0.6) * 0.36 + sadnessBrow * 0.22 + sadnessMouth * 0.1 - browDownStrong * 0.18 - smile * 0.36) },
    { name: "Angry", value: clamp01(angerCore * 0.56 + angerEyePattern * 0.22 + intenseEyes * 0.08 + eyeGeometry.browSlant * 0.08 + browDownStrong * 0.04 + eyeOnlyAnger * 0.05 - sadnessBrow * 0.16 - sadnessMouth * 0.1 - smile * 0.34) },
    { name: "Disgusted", value: clamp01(disgustCore * 0.72 + signalAbove(noseSneer, 0.08, 0.26) * 0.14 + signalAbove(mouthUpperUp, 0.08, 0.28) * 0.1 - clearSmile * 0.2 - sadnessCore * 0.14 - angerCore * 0.12) },
    { name: "Contempt", value: clamp01(contemptCore * 0.62 + signalAbove(smileAsymmetry, 0.12, 0.3) * 0.16 + signalAbove(mouthDimple, 0.08, 0.28) * 0.08 - clearSmile * 0.22 - sadnessCore * 0.14 - disgustCore * 0.1) },
    { name: "Surprised", value: clamp01(surpriseCore * 0.78 + eyeWideStrong * 0.12 + signalAbove(jawOpen, 0.12, 0.34) * 0.1 - roundWideEyeIntensity * 0.14 - wideAnger * 0.3 - intenseEyes * 0.16 - sadnessBrow * 0.18 - browDownStrong * 0.24 - pressStrong * 0.12 - smile * 0.14) },
    { name: "Fearful", value: clamp01(fearCore * 0.52 + Math.max(eyeWideStrong, eyeGeometry.wide) * 0.18 + sadnessBrow * 0.2 + pressStrong * 0.06 + mouthStretch * 0.04 - surpriseCore * 0.12 - browDownStrong * 0.16 - smile * 0.24) },
    { name: "Calm", value: clamp01(neutral * 0.18 + (1 - expressive) * 0.08 + (1 - mouthPress) * 0.02 - Math.max(sadnessCore, clearSmile, angerCore, intenseEyes, eyeExpression, fearCore, surpriseCore, disgustCore, contemptCore, pressStrong) * 0.72 - smile * 0.12) }
  ].sort((a, b) => b.value - a.value);
}

function renderEmotionScores(scores) {
  if (!emotionList) return;
  emotionList.innerHTML = scores.map((score) => {
    const percent = Math.round(score.value * 100);
    return `<div class="emotion-row"><b>${score.name} cue</b><div class="meter"><i style="width:${percent}%"></i></div><span>${percent}%</span></div>`;
  }).join("");
}

function renderCueInsights() {
  if (!cueInsightList) return;
  const visibleInsights = lastCueInsights.filter((cue) => cue.value >= 0.08).slice(0, 4);
  if (!visibleInsights.length) {
    cueInsightList.innerHTML = "<li>No strong micro-cue family stood out.</li>";
    return;
  }
  cueInsightList.innerHTML = visibleInsights.map((cue) => {
    const percent = Math.round(cue.value * 100);
    return `<li><b>${cue.name}:</b> ${percent}% - ${cue.text}.</li>`;
  }).join("");
}

function classifyScores(scores) {
  const sortedScores = [...scores].sort((a, b) => b.value - a.value);
  const angry = sortedScores.find((score) => score.name === "Angry");
  const happy = sortedScores.find((score) => score.name === "Happy");
  const sad = sortedScores.find((score) => score.name === "Sad");
  let primary = sortedScores[0] || { name: "Calm", value: 0 };
  if (primary.name === "Calm") {
    const topNonCalm = sortedScores.find((score) => score.name !== "Calm") || { value: 0 };
    if (topNonCalm.value >= 0.16 || primary.value < 0.34 || primary.value < topNonCalm.value + 0.14) {
      primary = topNonCalm;
    }
  }
  const happySadGap = happy && sad ? Math.abs(happy.value - sad.value) : 1;
  if (happy && sad && happySadGap <= 0.12 && Math.max(happy.value, sad.value) >= 0.18) {
    const confidence = Math.round(Math.max(happy.value, sad.value) * 100);
    return {
      emotion: "Mixed sad-happy cues",
      confidence,
      scores,
      label: "Primary possible emotion: Mixed sad-happy cues",
      summary: "The visible cue pattern is too close to separate cleanly between sadness and happiness. This often happens with polite smiles, bittersweet expressions, tired smiles, or a face that does not match the inner feeling.",
      prompt: "Journal prompt: Is this more joy, sadness, relief, exhaustion, politeness, or a mix?"
    };
  }
  if (primary.name === "Angry") {
    const nextNonAngry = sortedScores.find((score) => score.name !== "Angry") || { value: 0 };
    if (!angry || angry.value < 0.3 || angry.value < nextNonAngry.value + 0.06) {
      primary = nextNonAngry;
    }
  } else if (angry && angry.value >= 0.34 && primary.value <= angry.value + 0.04) {
    primary = angry;
  }
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
  if (primary.name === "Disgusted") {
    return {
      emotion: primary.name,
      confidence,
      scores,
      label: "Primary possible emotion: Disgusted",
      summary: "The strongest visible cue pattern points toward disgust, aversion, rejection, or a strong no response.",
      prompt: "Journal prompt: What feels wrong, unwanted, unsafe, or out of alignment?"
    };
  }
  if (primary.name === "Contempt") {
    return {
      emotion: primary.name,
      confidence,
      scores,
      label: "Primary possible emotion: Contempt",
      summary: "The strongest visible cue pattern points toward contempt, dismissal, superiority, or emotional distancing.",
      prompt: "Journal prompt: Is there disrespect, resentment, disappointment, or a need for distance underneath this?"
    };
  }
  if (primary.name === "Surprised") {
    return {
      emotion: primary.name,
      confidence,
      scores,
      label: "Primary possible emotion: Surprised",
      summary: "The strongest visible cue pattern points toward surprise, startle, sudden attention, or unexpectedness.",
      prompt: "Journal prompt: What changed, caught my attention, or interrupted my expectation?"
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
  const result = classifyScores(signal.scores);
  const energy = Math.max(signal.scores.find((score) => score.name === "Happy")?.value || 0, signal.scores.find((score) => score.name === "Angry")?.value || 0, signal.scores.find((score) => score.name === "Fearful")?.value || 0, signal.scores.find((score) => score.name === "Surprised")?.value || 0);
  const tension = Math.max(signal.scores.find((score) => score.name === "Angry")?.value || 0, signal.scores.find((score) => score.name === "Fearful")?.value || 0, signal.scores.find((score) => score.name === "Shameful")?.value || 0, signal.scores.find((score) => score.name === "Surprised")?.value || 0, signal.scores.find((score) => score.name === "Disgusted")?.value || 0, signal.scores.find((score) => score.name === "Contempt")?.value || 0);
  const mixed = signal.scores[1] ? clamp01(signal.scores[1].value / Math.max(signal.scores[0].value, 0.01)) : 0;
  label.textContent = result.label;
  summary.textContent = `${result.summary} Primary signal strength: ${result.confidence}%. The other bars are lower-confidence facial cue scores, not simultaneous emotion labels. This is not a diagnosis or proof of emotion. It is a private reflection cue generated from simple on-device visual signals.`;
  renderEmotionScores(result.scores);
  renderCueInsights();
  promptText.textContent = result.prompt;
  energyMeter.style.width = `${Math.round(energy * 100)}%`;
  tensionMeter.style.width = `${Math.round(tension * 100)}%`;
  mixedMeter.style.width = `${Math.round(mixed * 100)}%`;
  setStatus("Analysis complete locally in this browser. No upload happened.");
}

async function analyzeVisibleFrame() {
  let media = activeMedia;
  if (!frameSourceReady(media) && activeFile?.type?.startsWith("image/")) {
    setStatus("Decoding photo locally before analysis...");
    try {
      clearBitmap();
      activeBitmap = await decodeImageFile(activeFile);
      activeMedia = activeBitmap;
      media = activeBitmap;
    } catch {
      setStatus("This photo could not be decoded for analysis.");
      return;
    }
  }
  if (!frameSourceReady(media)) {
    setStatus("Choose a loaded photo/video or start the camera before analyzing.");
    return;
  }
  const mode = media instanceof HTMLVideoElement ? "VIDEO" : "IMAGE";
  try {
    const landmarker = await ensureFaceLandmarker(mode);
    const result = mode === "VIDEO" ? landmarker.detectForVideo(media, performance.now()) : landmarker.detect(media);
    const categories = result.faceBlendshapes?.[0]?.categories;
    if (!categories?.length) {
      label.textContent = "No face expression detected.";
      summary.textContent = "I could not find a clear face expression in this photo or video frame. Try a front-facing, uncropped face with visible eyes and mouth.";
      if (emotionList) emotionList.innerHTML = "";
      if (cueInsightList) cueInsightList.innerHTML = "";
      setStatus("No face expression found. Nothing was uploaded.");
      return;
    }
    updateResult({ scores: blendshapeScores(categories, result.faceLandmarks?.[0] || []) });
  } catch (error) {
    label.textContent = "Face model could not run.";
    summary.textContent = "The browser could not load or run the on-device face expression model. Check the internet connection for model download, then try again.";
    setStatus(error?.message || "Face expression model failed to run.");
  }
}

fileInput?.addEventListener("change", (event) => loadFile(event.target.files?.[0]));
startCameraButton?.addEventListener("click", startCamera);
analyzeButton?.addEventListener("click", () => analyzeVisibleFrame());
clearButton?.addEventListener("click", resetPreview);
window.addEventListener("pagehide", stopCamera);
