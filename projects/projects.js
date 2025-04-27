import { fetchJSON, renderProjects } from '../global.js';

async function main() {
    const projects = await fetchJSON('../lib/projects.json');
    const projectsContainer = document.querySelector('.projects');
    const titleElement = document.querySelector('.projects-title');

    if (projects && projectsContainer) {
        renderProjects(projects, projectsContainer, 'h2');
    }

    if (projects && titleElement) {
        titleElement.textContent = `Projects (${projects.length})`;
    }
}

main();