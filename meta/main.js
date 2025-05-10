import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
let xScale, yScale;
let globalCommits = [];

async function loadData() {
    const data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: +row.line,
        depth: +row.depth,
        length: +row.length,
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime),
    }));
    return data;
}

function processCommits(data) {
    return d3
        .groups(data, (d) => d.commit)
        .map(([commit, lines]) => {
            let first = lines[0];
            let { author, date, time, timezone, datetime } = first;

            let commitInfo = {
                id: commit,
                url: 'https://github.com/vis-society/lab-7/commit/' + commit, // update repo URL if needed
                author,
                date,
                time,
                timezone,
                datetime,
                hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                totalLines: lines.length,
            };

            // Add `lines` as a non-enumerable property
            Object.defineProperty(commitInfo, 'lines', {
                value: lines,
                enumerable: false, // Don't show in console by default
                writable: false,
                configurable: true,
            });

            return commitInfo;
        });
}



function renderCommitInfo(data, commits) {
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');

    // Total lines of code
    dl.append('dt').html('Total <abbr title="Lines of Code">LOC</abbr>');
    dl.append('dd').text(data.length);

    // Total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);

    // Number of files
    const numFiles = d3.groups(data, d => d.file).length;
    dl.append('dt').text('Number of files');
    dl.append('dd').text(numFiles);

    // Longest line length
    const longestLine = d3.max(data, d => d.length);
    dl.append('dt').text('Longest line (chars)');
    dl.append('dd').text(longestLine);

    // Average line length
    const avgLineLength = d3.mean(data, d => d.length).toFixed(2);
    dl.append('dt').text('Average line length');
    dl.append('dd').text(avgLineLength);

    // Maximum depth
    const maxDepth = d3.max(data, d => d.depth);
    dl.append('dt').text('Maximum depth');
    dl.append('dd').text(maxDepth);

    // Most common time of day
    const workByPeriod = d3.rollups(
        data,
        v => v.length,
        d => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
    );
    const topEntry = d3.greatest(workByPeriod, d => d[1]);
    const topPeriod = topEntry ? topEntry[0] : 'N/A';

    dl.append('dt').text('Most active time of day');
    dl.append('dd').text(topPeriod || 'N/A');
}

// function renderScatterPlot(data, commits) {
//     const width = 1000;
//     const height = 600;
//     const margin = { top: 10, right: 10, bottom: 30, left: 40 };

//     const usableArea = {
//         top: margin.top,
//         right: width - margin.right,
//         bottom: height - margin.bottom,
//         left: margin.left,
//         width: width - margin.left - margin.right,
//         height: height - margin.top - margin.bottom,
//     };

//     const xScale = d3
//         .scaleTime()
//         .domain(d3.extent(commits, (d) => d.datetime))
//         .range([usableArea.left, usableArea.right])
//         .nice();

//     const yScale = d3
//         .scaleLinear()
//         .domain([0, 24])
//         .range([usableArea.bottom, usableArea.top]);

//     const svg = d3
//         .select('#chart')
//         .append('svg')
//         .attr('viewBox', `0 0 ${width} ${height}`)
//         .style('overflow', 'visible');

//     // Add horizontal gridlines
//     svg.append('g')
//         .attr('class', 'gridlines')
//         .attr('transform', `translate(${usableArea.left}, 0)`)
//         .call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

//     // Add Y axis
//     svg.append('g')
//         .attr('transform', `translate(${usableArea.left}, 0)`)
//         .call(
//             d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00')
//         );

//     // Add X axis
//     svg.append('g')
//         .attr('transform', `translate(0, ${usableArea.bottom})`)
//         .call(d3.axisBottom(xScale));

//     // Add scatter dots
//     svg.append('g')
//         .attr('class', 'dots')
//         .selectAll('circle')
//         .data(commits)
//         .join('circle')
//         .attr('cx', (d) => xScale(d.datetime))
//         .attr('cy', (d) => yScale(d.hourFrac))
//         .attr('r', 5)
//         .attr('fill', 'steelblue');
//     const dots = svg.append('g').attr('class', 'dots');
//     dots
//         .selectAll('circle')
//         .data(commits)
//         .join('circle')
//         .attr('cx', (d) => xScale(d.datetime))
//         .attr('cy', (d) => yScale(d.hourFrac))
//         .attr('r', 5)
//         .attr('fill', 'steelblue')
//         .on('mouseenter', (event, commit) => {
//             renderTooltipContent(commit);
//             updateTooltipVisibility(true);
//             updateTooltipPosition(event); // Initial position
//         })
//         .on('mousemove', (event) => {
//             updateTooltipPosition(event); // Updates as you move
//         })
//         .on('mouseleave', () => {
//             updateTooltipVisibility(false);
//         });

// }

export function renderScatterPlot(data, commits) {
    globalCommits = commits;

    const width = 1000;
    const height = 600;
    const margin = { top: 10, right: 10, bottom: 30, left: 40 };
    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };

    // Sort commits so smaller dots are on top
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);

    xScale = d3
        .scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))
        .range([usableArea.left, usableArea.right])
        .nice();

    yScale = d3.scaleLinear().domain([0, 24]).range([usableArea.bottom, usableArea.top]);

    const svg = d3
        .select('#chart')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('overflow', 'visible');

    svg.append('g')
        .attr('class', 'gridlines')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    svg.append('g')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(d3.axisLeft(yScale).tickFormat((d) => `${String(d % 24).padStart(2, '0')}:00`));

    svg.append('g')
        .attr('transform', `translate(0, ${usableArea.bottom})`)
        .call(d3.axisBottom(xScale));

    const dots = svg.append('g').attr('class', 'dots');
    dots
        .selectAll('circle')
        .data(sortedCommits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', (d) => rScale(d.totalLines))
        .attr('fill', 'steelblue')
        .style('fill-opacity', 0.7)
        .on('mouseenter', (event, commit) => {
            d3.select(event.currentTarget).style('fill-opacity', 1);
            renderTooltipContent(commit);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
        })
        .on('mousemove', (event) => updateTooltipPosition(event))
        .on('mouseleave', (event) => {
            d3.select(event.currentTarget).style('fill-opacity', 0.7);
            updateTooltipVisibility(false);
        });

    // Brush setup
    svg.call(d3.brush().on('start brush end', brushed));
    svg.selectAll('.dots, .overlay ~ *').raise();
}

function brushed(event) {
    const selection = event.selection;

    d3.selectAll('circle').classed('selected', (d) => isCommitSelected(selection, d));
    renderSelectionCount(selection);
    renderLanguageBreakdown(selection);
}

function isCommitSelected(selection, commit) {
    if (!selection) return false;
    const [
        [x0, y0],
        [x1, y1]
    ] = selection;
    const x = xScale(commit.datetime);
    const y = yScale(commit.hourFrac);
    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
}

export function renderSelectionCount(selection) {
    const selectedCommits = selection ?
        globalCommits.filter((d) => isCommitSelected(selection, d)) :
        [];

    const countElement = document.querySelector('#selection-count');
    countElement.textContent = `${selectedCommits.length || 'No'} commits selected`;
    return selectedCommits;
}

export function renderLanguageBreakdown(selection) {
    const selectedCommits = selection ?
        globalCommits.filter((d) => isCommitSelected(selection, d)) :
        [];

    const container = document.getElementById('language-breakdown');
    if (!selectedCommits.length) {
        container.innerHTML = '';
        return;
    }

    const lines = selectedCommits.flatMap((d) => d.lines);
    const breakdown = d3.rollup(lines, (v) => v.length, (d) => d.type);

    container.innerHTML = '';
    for (const [lang, count] of breakdown) {
        const proportion = count / lines.length;
        const formatted = d3.format('.1~%')(proportion);
        container.innerHTML += `<dt>${lang}</dt><dd>${count} lines (${formatted})</dd>`;
    }
}

function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY + 10}px`;
}

function renderTooltipContent(commit) {
    if (!commit) return;

    document.getElementById('commit-link').href = commit.url;
    document.getElementById('commit-link').textContent = commit.id;
    document.getElementById('commit-date').textContent = commit.datetime.toLocaleDateString('en', {
        dateStyle: 'full',
    });
    document.getElementById('commit-author').textContent = commit.author;
    document.getElementById('commit-time').textContent = commit.time;
    document.getElementById('commit-lines').textContent = commit.totalLines;
}


let data = await loadData();
let commits = processCommits(data);
renderCommitInfo(data, commits); // optional
renderScatterPlot(data, commits); // this is the key