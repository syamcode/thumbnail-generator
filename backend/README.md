# Backend Documentation

This README provides detailed information about the backend service of the application. It covers the prerequisites, installation, testing, and an explanation of the thumbnail generation algorithm.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Testing](#testing)
4. [Thumbnail Generation Algorithm](#thumbnail-generation-algorithm)

---

## Prerequisites

- **Node.js**: Ensure you have Node.js installed. This project uses `pnpm` as the package manager.
- **FFmpeg**: The backend requires FFmpeg to be installed for video processing. Install it from [FFmpeg.org](https://ffmpeg.org/).

---

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/your-repository.git
   cd your-repository/backend
   ```

2. Install dependencies using `pnpm`:

   ```bash
   pnpm install
   ```

3. Start the backend server:
   ```bash
   pnpm start
   ```

---

## Testing

Run the tests to ensure everything is working as expected:

```bash
pnpm test
```

You can also check the test coverage:

```bash
pnpm test -- --coverage
```

---

## Thumbnail Generation Algorithm

The thumbnail generation algorithm processes video frames to identify keyframes for creating a GIF. The steps are as follows:

1. **Frame Extraction**:
   FFmpeg is used to extract frames from the video at regular intervals.

2. **Frame Analysis**:
   Each extracted frame is analyzed using the following visual criteria:

   - **Contrast**: Measures the difference between light and dark areas in the frame.
   - **Brightness**: Evaluates the overall illumination of the frame.
   - **Sharpness**: Assesses the clarity and level of detail in the frame.

3. **Keyframe Selection**:
   Frames with the highest scores based on the criteria above are selected as keyframes.

4. **GIF Creation**:
   The selected keyframes are stitched together using FFmpeg to create the final GIF.

This algorithm ensures that the generated GIF represents the most visually significant parts of the video.

---
