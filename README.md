# UrbanSfM: Multi-View 3D Reconstruction & Virtual Tour (CS436)

This repository contains my implementation of a complete **Structure from Motion (SfM)** pipeline developed for the CS436 “3D Scene Reconstruction & Virtual Tour” project. The system reconstructs a **sparse 3D point cloud** and **camera trajectory** from a sequence of images, progressing from basic feature extraction to a full incremental SfM pipeline.

The project is implemented week-wise, following the course deliverables:

- **Week 1:** SIFT features & image preprocessing
- **Week 2:** Two-view geometry, relative pose, and triangulation
- **Week 3:** Full incremental SfM (PnP, triangulation, BA, pruning)
- **Week 4–5:** View-graph construction & Photosynth-style virtual tour

Outputs include `.ply` point clouds and detailed Jupyter notebooks for each stage.

---

## 📁 Repository Structure

```
.
├── Dataset/                         # Image sequences for reconstruction
│
├── UrbanSfM_Project.pdf             # Official CS436 project description
├── Deliverables.pdf                 # Weekly tasks & marking scheme
│
├── Week1_25100190_25100334.ipynb    # Week 1: SIFT, preprocessing, matching
├── Week2_25100190_25100334.ipynb    # Week 2: Essential matrix + 2-view SfM
├── Week3_25100190_25100334.ipynb    # Week 3: Full incremental SfM
│
├── week2_two_view_cloud.ply         # Example 2-view point cloud (Week 2)
└── week3_pointcloud.ply             # Final sparse point cloud (Week 3)
```

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

```
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

You can visualize them using:

```python
import open3d as o3d
pcd = o3d.io.read_point_cloud("week3_pointcloud.ply")
o3d.visualization.draw_geometries([pcd])
```

---

## 📜 Notes

This project follows the exact structure required by CS436 and implements:
- 2-view SfM
- Multi-view incremental SfM
- Pose-only BA
- Custom point filtering & keypoint-to-3D remapping
- Feature preprocessing pipeline
- Colorized sparse cloud generation

---

## 📄 License

This work is for **academic use only** as part of CS436.
You may reference or adapt the code but not redistribute it as a standalone product.

---

## ✨ Author
**Muhammad Musab Ali Chaudhry and Areesha Khan**
LUMS — CS436 (Computer Vision & Robotics)
