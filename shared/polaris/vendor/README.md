# Vendored third-party assets (offline, no CDN)

Everything the Polaris module needs at run time is in this folder so the demo works with no network.

| Folder | What | Version | Licence | Source |
| --- | --- | --- | --- | --- |
| `mediapipe/` | MediaPipe Tasks Vision JS bundle + SIMD WASM runtime | 1.1.1 | Apache-2.0 | npm `@mediapipe/tasks-vision` |
| `models/face_landmarker.task` | Face Landmarker (478 landmarks + 52 blendshapes), float16 | v1 | Apache-2.0 | storage.googleapis.com/mediapipe-models |
| `models/blaze_face_short_range.tflite` | BlazeFace short-range face detector | v1 | Apache-2.0 | storage.googleapis.com/mediapipe-models |
| `models/face_recognition_sface_2021dec_int8.onnx` | SFace face embedding (128-d, 112x112), int8 quantised | 2021 Dec | Apache-2.0 | OpenCV Zoo (`opencv/opencv_zoo`) |
| `ort/` | ONNX Runtime Web (wasm, single thread) | 1.30.0 | MIT | npm `onnxruntime-web` |
| `tesseract/` | tesseract.js (UMD + worker), tesseract.js-core 7.0.0 (`relaxedsimd-lstm`, `simd-lstm`, `lstm`), `eng` LSTM best-int traineddata | 7.0.0 | Apache-2.0 | npm `tesseract.js`, `tesseract.js-core`, `@tesseract.js-data/eng` |
| `fonts/DejaVuSansMono-Bold.ttf` | Monospace face used to print the MRZ on the synthetic Demo-camera passport | - | Bitstream Vera / DejaVu (free) | Debian `fonts-dejavu-core` |

Not shipped: the non-SIMD MediaPipe runtime (all current browsers support WASM SIMD), the fp32 SFace model (the int8 model separates same/different people clearly in our tests), the other ONNX Runtime backends (WebGL/WebGPU/threaded).
These models are public research/demo models. For a production deployment replace them with models licensed and evaluated for your risk profile.
