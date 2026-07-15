const mappings = [
    {
        id: 24,
        itchLink: "https://garlicxd.itch.io/cgj-group-13-2025"
    }
];

const backendBaseUrl = process.env.BACKEND_BASE_URL || "http://localhost:8080";

for (const mapping of mappings) {
    const projectResponse = await fetch(`${backendBaseUrl}/api/links/${mapping.id}`);
    if (!projectResponse.ok) {
        throw new Error(`Failed to fetch project ${mapping.id}: ${projectResponse.status}`);
    }

    const project = await projectResponse.json();
    const formData = new FormData();
    formData.append("project_name", project.project_name ?? "");
    formData.append("project_summary", project.project_summary ?? "");
    formData.append("description", project.description ?? "");
    formData.append("github_link", project.github_link ?? "");
    formData.append("itch_link", mapping.itchLink);
    formData.append("project_context", project.project_context ?? "");
    formData.append("project_role", project.project_role ?? "");
    formData.append("project_goal", project.project_goal ?? "");
    formData.append("project_languages", project.project_languages ?? "");
    formData.append("project_technologies", project.project_technologies ?? "");
    formData.append("project_takeaways", project.project_takeaways ?? "");
    formData.append("project_category", project.project_category ?? "personal");

    const updateResponse = await fetch(`${backendBaseUrl}/api/links/textData/${mapping.id}`, {
        method: "PUT",
        body: formData
    });

    if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Failed to update project ${mapping.id}: ${updateResponse.status} ${errorText}`);
    }

    console.log(`Updated project ${mapping.id} Itch link -> ${mapping.itchLink}`);
}

console.log("All project Itch links applied.");
