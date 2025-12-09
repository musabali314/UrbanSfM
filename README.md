# UrbanSfM: Multi-View 3D Reconstruction & Virtual Tour (CS436)

This repository contains my implementation of a complete **Structure from Motion (SfM)** pipeline developed for the CS436 “3D Scene Reconstruction & Virtual Tour” project. The system reconstructs a **sparse 3D point cloud** and **camera trajectory** from a sequence of images, progressing from basic feature extraction to a full incremental SfM pipeline.

The project is implemented week-wise following the course deliverables:

- **Week 1:** SIFT features & image preprocessing
- **Week 2:** Two-view geometry, relative pose, and triangulation
- **Week 3:** Full incremental SfM (PnP, triangulation, BA, pruning)
- **Week 4–5:** View-graph construction & Photosynth-style virtual tour

Outputs include `.ply` point clouds, detailed Jupyter notebooks for each stage, and an **interactive web-based viewer** to explore reconstructed scenes.

---

## 📁 Repository Structure

```text
.
├── Dataset/                             # Image sequences for reconstruction
│
├── UrbanSfM_Project.pdf                 # Official CS436 project description
├── Deliverables.pdf                     # Weekly tasks & marking scheme
├── UrbanSfM - Multi-View 3D Reconstruction and Photosynth-Style Virtual Navigation.pdf  # Project Paper
│
├── Week1_25100190_25100334.ipynb        # Week 1: SIFT, preprocessing, matching
├── Week2_25100190_25100334.ipynb        # Week 2: Essential matrix + 2-view SfM
├── Week3_25100190_25100334.ipynb        # Week 3: Full incremental SfM
├── week3_pointcloud.ply                 # Final sparse point cloud (Week 3)
│
└── Interactive Viewer/                  # Web-based 3D viewer & tour
    ├── 3js_App_Guide.pdf                # Notes/guide for the Three.js viewer
    ├── Agisoft Metashape Cameras.json   # Camera poses exported from Metashape
    ├── Agisoft Metashape PCD (low quality sample for github).ply
    ├── index.html                       # Viewer front-end (Three.js + UI)
    ├── tour.js                          # Viewer logic, camera navigation, etc.
```

> **Note:** For the **interactive viewer demonstration**, we step slightly outside the Week 3 limited-area reconstruction (which only covers a smaller corner of the scene) and instead use a **full-room point cloud** generated from the same SfM pipeline logic but reconstructed over a larger space.
> The `.ply` in the `Interactive Viewer/` folder is a **sample sparse point cloud** suitable for lightweight visualization on GitHub and in the web viewer.

---

## 🛠️ Environment Setup

### **Install required libraries**

```bash
pip install numpy opencv-contrib-python open3d scipy matplotlib
```

**Requirements:**
- Python 3.9+
- OpenCV (with contrib for SIFT)
- SciPy `least_squares` (bundle adjustment)
- Open3D for point cloud visualization

---

## 📸 Dataset Format

Place your dataset in:

```text
Dataset/Option 1/
    ├── img_0001.jpg
    ├── img_0002.jpg
    ├── ...
```

Ensure the dataset has rich texture, good lighting, and ~60–80% overlap between images.

---

## 🚀 Running the Full SfM Pipeline (Week 3)

Inside the notebook:

```python
from SfM import run_week3_sfm
run_week3_sfm(
    dataset_path="Dataset/Option 6",
    base_i=1,
    base_j=2,
    ba_interval=10
)
```

This performs:
- SIFT feature extraction
- Initial pair pose recovery
- Incremental view registration via PnP
- Triangulation of new 3D points
- Pose-only bundle adjustment
- Point pruning + color extraction
- Point cloud saving (`week3_pointcloud.ply`)

---

## 📦 Output

The reconstruction outputs:
- `week2_two_view_cloud.ply` — Raw two-view reconstruction
- `week3_pointcloud.ply` — Final sparse map from all images
---

## 🌐 Interactive Web-Based Viewer (Virtual Tour)

In addition to the notebooks, the repository includes an **interactive Three.js viewer** that lets you:

- Load a **sparse point cloud** (`.ply`)
- Visualize **camera poses** as clickable nodes
- “Jump” between views, approximating a **Photosynth-style virtual tour**

This viewer lives in the `Interactive Viewer/` folder and uses:

- `Agisoft Metashape PCD.ply` — a **sample full-room sparse point cloud** used for demonstration (lighter, GitHub-friendly version)
- `Agisoft Metashape Cameras.json` — camera extrinsics exported from Metashape and converted to JSON
- `index.html` + `tour.js` — the front-end that uses **Three.js** to render the scene and navigate between camera viewpoints

> 📌 **Design choice:**
> For Week 3, the reconstructed area was a **limited corner** of the scene, which is perfect for demonstrating the core SfM pipeline but visually less compelling as an interactive “tour”.
> To better showcase the use of the viewer, we generated a **larger, room-scale point cloud** using the same reconstruction principles and used that for the viewer demo.
> The point cloud stored in `Interactive Viewer/` is a **sample sparse version** tailored for GitHub and browser performance.

### ▶️ Viewer Demo (Embedded)

Below is an embedded demo video (`Viewer_Demo.mp4`) showing the interactive viewer in action:


https://github.com/user-attachments/assets/4ac5b0ac-1715-435a-b568-6d733397817a





```

### 🔧 Running the Viewer Locally

To run the interactive viewer on your machine:

1. Navigate to the `Interactive Viewer/` directory:
   ```bash
   cd "Interactive Viewer"
   ```

2. Start a simple HTTP server (required because the viewer uses ES modules & `fetch`):
   ```bash
   # Python 3
   python -m http.server 8000
   ```
   or
   ```bash
   python3 -m http.server 8000
   ```

3. Open your browser and go to:
   ```text
   http://localhost:8000/index.html
   ```

You should see:

- The **sparse point cloud** rendered in 3D
- **Blue camera nodes** (or similar markers) scattered in the room
- Clicking on a camera node moves the virtual camera to the corresponding pose and updates the view, giving a **virtual tour** experience.

---

## 📜 Notes

This project follows the exact structure required by CS436 and implements:

- 2-view SfM
- Multi-view incremental SfM
- Pose-only BA
- Custom point filtering & keypoint-to-3D remapping
- Feature preprocessing pipeline
- Colorized sparse cloud generation
- A web-based interactive viewer to explore reconstructed scenes and camera trajectories

## ✨ Author

**Muhammad Musab Ali Chaudhry and Areesha Khan**
LUMS — CS436 (Computer Vision & Robotics)
