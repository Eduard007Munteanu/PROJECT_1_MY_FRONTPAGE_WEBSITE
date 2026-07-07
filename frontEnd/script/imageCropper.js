export async function openImageCropper(file, options = {}) {
    if (!(file instanceof File) || !file.type.startsWith("image/")) {
        return file;
    }

    const aspectRatio = options.aspectRatio ?? (4 / 3);
    const imageUrl = URL.createObjectURL(file);

    try {
        const image = await loadImage(imageUrl);
        return await createCropperOverlay({
            file,
            image,
            aspectRatio
        });
    } finally {
        URL.revokeObjectURL(imageUrl);
    }
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Failed to load image for cropping."));
        image.src = src;
    });
}

function createCropperOverlay({ file, image, aspectRatio }) {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "image-crop-overlay";

        const modal = document.createElement("div");
        modal.className = "image-crop-modal";

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "image-crop-close";
        closeButton.textContent = "X";

        const title = document.createElement("h2");
        title.className = "image-crop-title";
        title.textContent = "Crop project image";

        const hint = document.createElement("p");
        hint.className = "image-crop-hint";
        hint.textContent = "Drag the image to position it and use zoom if needed.";

        const viewport = document.createElement("div");
        viewport.className = "image-crop-viewport";
        viewport.style.setProperty("--crop-aspect-ratio", String(aspectRatio));

        const cropImage = document.createElement("img");
        cropImage.className = "image-crop-preview";
        cropImage.src = image.src;
        cropImage.alt = "Crop preview";
        cropImage.draggable = false;
        viewport.appendChild(cropImage);

        const controls = document.createElement("div");
        controls.className = "image-crop-controls";

        const zoomLabel = document.createElement("label");
        zoomLabel.className = "image-crop-zoom";

        const zoomText = document.createElement("span");
        zoomText.textContent = "Zoom";

        const zoomInput = document.createElement("input");
        zoomInput.type = "range";
        zoomInput.min = "1";
        zoomInput.max = "3";
        zoomInput.step = "0.01";
        zoomInput.value = "1";

        zoomLabel.append(zoomText, zoomInput);

        const resetButton = document.createElement("button");
        resetButton.type = "button";
        resetButton.className = "image-crop-reset";
        resetButton.textContent = "Reset";

        controls.append(zoomLabel, resetButton);

        const actions = document.createElement("div");
        actions.className = "image-crop-actions";

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.className = "image-crop-cancel";
        cancelButton.textContent = "Cancel";

        const confirmButton = document.createElement("button");
        confirmButton.type = "button";
        confirmButton.className = "image-crop-confirm";
        confirmButton.textContent = "Use crop";

        actions.append(cancelButton, confirmButton);
        modal.append(closeButton, title, hint, viewport, controls, actions);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const state = {
            zoomFactor: 1,
            minScale: 1,
            scale: 1,
            offsetX: 0,
            offsetY: 0,
            pointerId: null,
            dragStartX: 0,
            dragStartY: 0,
            originOffsetX: 0,
            originOffsetY: 0
        };

        const cleanup = (result) => {
            window.removeEventListener("keydown", onKeyDown);
            overlay.remove();
            resolve(result);
        };

        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                cleanup(null);
            }
        };

        const clampOffsets = () => {
            const viewportWidth = viewport.clientWidth;
            const viewportHeight = viewport.clientHeight;
            const displayWidth = image.naturalWidth * state.scale;
            const displayHeight = image.naturalHeight * state.scale;
            const maxOffsetX = Math.max(0, (displayWidth - viewportWidth) / 2);
            const maxOffsetY = Math.max(0, (displayHeight - viewportHeight) / 2);

            state.offsetX = clamp(state.offsetX, -maxOffsetX, maxOffsetX);
            state.offsetY = clamp(state.offsetY, -maxOffsetY, maxOffsetY);
        };

        const renderImage = () => {
            const viewportWidth = viewport.clientWidth;
            const viewportHeight = viewport.clientHeight;
            const displayWidth = image.naturalWidth * state.scale;
            const displayHeight = image.naturalHeight * state.scale;
            const left = ((viewportWidth - displayWidth) / 2) + state.offsetX;
            const top = ((viewportHeight - displayHeight) / 2) + state.offsetY;

            cropImage.style.width = `${displayWidth}px`;
            cropImage.style.height = `${displayHeight}px`;
            cropImage.style.left = `${left}px`;
            cropImage.style.top = `${top}px`;
        };

        const applyZoom = () => {
            state.scale = state.minScale * state.zoomFactor;
            clampOffsets();
            renderImage();
        };

        const resetState = () => {
            const viewportWidth = viewport.clientWidth;
            const viewportHeight = viewport.clientHeight;
            state.minScale = Math.max(
                viewportWidth / image.naturalWidth,
                viewportHeight / image.naturalHeight
            );
            state.zoomFactor = 1;
            state.offsetX = 0;
            state.offsetY = 0;
            zoomInput.value = "1";
            applyZoom();
        };

        const exportCrop = async () => {
            const viewportWidth = viewport.clientWidth;
            const viewportHeight = viewport.clientHeight;
            const displayWidth = image.naturalWidth * state.scale;
            const displayHeight = image.naturalHeight * state.scale;
            const left = ((viewportWidth - displayWidth) / 2) + state.offsetX;
            const top = ((viewportHeight - displayHeight) / 2) + state.offsetY;

            const sourceX = Math.max(0, -left / state.scale);
            const sourceY = Math.max(0, -top / state.scale);
            const sourceWidth = Math.min(image.naturalWidth - sourceX, viewportWidth / state.scale);
            const sourceHeight = Math.min(image.naturalHeight - sourceY, viewportHeight / state.scale);

            const canvas = document.createElement("canvas");
            canvas.width = Math.round(sourceWidth);
            canvas.height = Math.round(sourceHeight);

            const context = canvas.getContext("2d");
            if (!context) {
                throw new Error("Failed to create image crop context.");
            }

            context.drawImage(
                image,
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                0,
                0,
                canvas.width,
                canvas.height
            );

            const mimeType = normalizeImageMimeType(file.type);
            const croppedBlob = await canvasToBlob(canvas, mimeType);
            return new File([croppedBlob], file.name, { type: mimeType });
        };

        viewport.addEventListener("pointerdown", (event) => {
            event.preventDefault();
            state.pointerId = event.pointerId;
            state.dragStartX = event.clientX;
            state.dragStartY = event.clientY;
            state.originOffsetX = state.offsetX;
            state.originOffsetY = state.offsetY;
            viewport.setPointerCapture(event.pointerId);
        });

        viewport.addEventListener("pointermove", (event) => {
            if (state.pointerId !== event.pointerId) return;

            state.offsetX = state.originOffsetX + (event.clientX - state.dragStartX);
            state.offsetY = state.originOffsetY + (event.clientY - state.dragStartY);
            clampOffsets();
            renderImage();
        });

        const releasePointer = (event) => {
            if (state.pointerId !== event.pointerId) return;
            viewport.releasePointerCapture(event.pointerId);
            state.pointerId = null;
        };

        viewport.addEventListener("pointerup", releasePointer);
        viewport.addEventListener("pointercancel", releasePointer);

        viewport.addEventListener("wheel", (event) => {
            event.preventDefault();
            const nextZoom = clamp(
                Number(zoomInput.value) + (event.deltaY < 0 ? 0.08 : -0.08),
                1,
                3
            );
            zoomInput.value = String(nextZoom);
            state.zoomFactor = nextZoom;
            applyZoom();
        }, { passive: false });

        zoomInput.addEventListener("input", () => {
            state.zoomFactor = Number(zoomInput.value);
            applyZoom();
        });

        resetButton.addEventListener("click", resetState);
        cancelButton.addEventListener("click", () => cleanup(null));
        closeButton.addEventListener("click", () => cleanup(null));
        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                cleanup(null);
            }
        });

        confirmButton.addEventListener("click", async () => {
            confirmButton.disabled = true;
            confirmButton.textContent = "Saving crop...";

            try {
                const croppedFile = await exportCrop();
                cleanup(croppedFile);
            } catch (error) {
                console.error(error);
                confirmButton.disabled = false;
                confirmButton.textContent = "Use crop";
            }
        });

        window.addEventListener("keydown", onKeyDown);
        requestAnimationFrame(resetState);
    });
}

function canvasToBlob(canvas, mimeType) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error("Failed to export cropped image."));
                return;
            }
            resolve(blob);
        }, mimeType, 0.92);
    });
}

function normalizeImageMimeType(mimeType) {
    return ["image/png", "image/jpeg", "image/webp"].includes(mimeType)
        ? mimeType
        : "image/png";
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
