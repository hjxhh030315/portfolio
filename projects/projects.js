import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

let selectedIndex = -1;
let projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const titleElement = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');

if (projects && projectsContainer) {
    renderProjects(projects, projectsContainer, 'h2');
}
if (projects && titleElement) {
    titleElement.textContent = `Projects (${projects.length})`;
}
renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
    const query = event.target.value.toLowerCase();
    const filtered = projects.filter((project) => {
        return Object.values(project).join(' ').toLowerCase().includes(query);
    });
    renderProjects(filtered, projectsContainer, 'h2');
    renderPieChart(filtered);
});

function renderPieChart(projectList) {
    const svg = d3.select('#projects-pie-plot');
    const legend = d3.select('.legend');
    svg.selectAll('*').remove();
    legend.selectAll('*').remove();

    const rolledData = d3.rollups(
        projectList,
        (v) => v.length,
        (d) => d.year
    );

    const data = rolledData.map(([year, count]) => ({
        value: count,
        label: year
    }));

    const arcGen = d3.arc().innerRadius(0).outerRadius(50);
    const pie = d3.pie().value((d) => d.value);
    const arcData = pie(data);
    const colors = d3.scaleOrdinal(d3.schemeTableau10);

    svg.selectAll('path')
        .data(arcData)
        .enter()
        .append('path')
        .attr('d', arcGen)
        .attr('fill', (_, i) => colors(i))
        .attr('cursor', 'pointer')
        .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''))
        .on('click', function(_, d) {
            const i = svg.selectAll('path').nodes().indexOf(this);
            selectedIndex = selectedIndex === i ? -1 : i;

            svg.selectAll('path')
                .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));

            legend.selectAll('li')
                .attr('class', (_, idx) => (idx === selectedIndex ? 'legend-item selected' : 'legend-item'));

            if (selectedIndex === -1) {
                renderProjects(projectList, projectsContainer, 'h2');
            } else {
                const selectedYear = data[selectedIndex].label;
                const filtered = projectList.filter((p) => p.year === selectedYear);
                renderProjects(filtered, projectsContainer, 'h2');
            }
        });


    data.forEach((d, idx) => {
        legend.append('li')
            .attr('class', idx === selectedIndex ? 'legend-item selected' : 'legend-item')
            .attr('style', `--color:${colors(idx)}`)
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}