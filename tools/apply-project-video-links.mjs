const mappings = [
    { id: 16, videoLink: "https://youtu.be/wVwFxQTfxM4" },
    { id: 18, videoLink: "https://youtu.be/hntkPuQ-ElU" },
    { id: 21, videoLink: "https://youtu.be/K1G7UcNhBRU" },
    { id: 22, videoLink: "https://www.youtube.com/shorts/qTsVf2NR8T0" },
    { id: 24, videoLink: "https://youtube.com/shorts/zxPkuOnMegE" },
    { id: 25, videoLink: "https://www.youtube.com/watch?v=snn11Bwbdd8" }
];

const backendBaseUrl = process.env.BACKEND_BASE_URL || "http://localhost:8080";

for (const mapping of mappings) {
    const formData = new FormData();
    formData.append("video_link", mapping.videoLink);

    const response = await fetch(`${backendBaseUrl}/api/links/bigData/${mapping.id}`, {
        method: "PUT",
        body: formData
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update project ${mapping.id}: ${response.status} ${errorText}`);
    }

    console.log(`Updated project ${mapping.id} -> ${mapping.videoLink}`);
}

console.log("All project video links applied.");
