const mappings = [
    {
        id: 16,
        githubLink: "https://github.com/Eduard007Munteanu/Master_Project_Thesis_3DUI.git"
    },
    {
        id: 21,
        githubLink: "https://github.com/Eduard007Munteanu/3DInterfaceProject.git"
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
    formData.append("github_link", mapping.githubLink);
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

    console.log(`Updated project ${mapping.id} GitHub link -> ${mapping.githubLink}`);
}

console.log("All project GitHub links applied.");
