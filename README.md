# Breast Cancer Detection

A web-based histology image analysis application built with React, Flask, and PyTorch. The application allows users to upload an image and receive a model-generated classification of the image as benign or malignant.

> **Medical Disclaimer:** This project is for educational and research purposes only. It is not a medical diagnostic tool and should not be used as a substitute for professional medical advice, diagnosis, or treatment.

## Overview

This project uses a **ResNet18 model with pre-trained weight** from PyTorch's `torchvision` library as the underlying deep learning architecture.

The application consists of:

- A **React + Vite frontend** for the user interface
- A **Flask backend** for handling image requests and model inference
- **PyTorch** for running the ResNet-18 model

Users can upload a histology image through the frontend, which is sent to the Flask backend for processing.

## Architecture

```text
                 React + Vite
                      |
                      | POST /predict
                      | Image
                      v
                Flask Backend
                      |
                      v
                  PyTorch
                      |
                      v
                ResNet-18
                      |
                      v
              Model Prediction
                      |
                      v
                 JSON Response
                      |
                      v
                React Frontend