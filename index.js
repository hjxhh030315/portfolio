// import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';
// async function main() {
//     // Fetch and render projects
//     const projects = await fetchJSON('./lib/projects.json');
//     const latestProjects = projects.slice(0, 3);
//     const projectsContainer = document.querySelector('.latest-projects');

//     if (latestProjects && projectsContainer) {
//         renderProjects(latestProjects, projectsContainer, 'h2');
//     }

//     // Fetch GitHub data
//     const githubData = await fetchGitHubData('hjxhh030315'); // <-- Your GitHub username

//     if (profileStats && githubData) {
//         profileStats.innerHTML = `
//         <dl>
//           <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
//           <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
//           <dt>Followers:</dt><dd>${githubData.followers}</dd>
//           <dt>Following:</dt><dd>${githubData.following}</dd>
//         </dl>
//       `;
//     }
// }

// main();

import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';
async function main() {
    // Fetch and render projects
    const projects = await fetchJSON('./lib/projects.json');
    const latestProjects = projects.slice(0, 3);
    const projectsContainer = document.querySelector('.latest-projects');

    if (latestProjects && projectsContainer) {
        renderProjects(latestProjects, projectsContainer, 'h2');
    }

    // Fetch GitHub data
    const githubData = await fetchGitHubData('hjxhh030315'); // <-- Your GitHub username
    const profileStats = document.querySelector('#profile-stats');

    if (profileStats && githubData) {
        profileStats.innerHTML = `
        <dl>
          <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
          <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
          <dt>Followers:</dt><dd>${githubData.followers}</dd>
          <dt>Following:</dt><dd>${githubData.following}</dd>
        </dl>
      `;
    }
}

main();