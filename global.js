console.log("IT’S ALIVE!");

function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

// // Get all nav links
// const navLinks = $$("nav a");

// // Find the current page link
// const currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname
// );



// if (currentLink) {
//     // or if (currentLink !== undefined)
//     currentLink.classList.add('current');
// }

document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
      Theme:
      <select>
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
    `
);

const select = document.querySelector('.color-scheme select');
const html = document.documentElement;

// Load saved preference from localStorage (if any)
const saved = localStorage.getItem('color-scheme');
if (saved) {
    html.style.colorScheme = saved;
    select.value = saved;
}

// Update theme on change
select.addEventListener('change', () => {
    const value = select.value;
    html.style.colorScheme = value;
    localStorage.setItem('color-scheme', value);
});


const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1") ?
    "/" :
    "/portfolio/";




let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'resume/', title: 'Resume' },
    { url: 'contact/', title: 'Contact' },
    { url: 'https://github.com/hjxhh030315', title: 'GitHub', external: true }
];

let nav = document.createElement("nav");
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;

    // Add BASE_PATH to internal links
    url = !url.startsWith("http") ? BASE_PATH + url : url;

    // Check if this is the current page
    let isCurrent = !p.external && location.pathname === new URL(url, location.origin).pathname;

    // Build the <a> tag with optional class and target
    // nav.insertAdjacentHTML(
    //     "beforeend",
    //     `<a href="${url}" ${p.external ? 'target="_blank"' : ''} class="${isCurrent ? 'current' : ''}">${title}</a>`
    // );
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    a.classList.toggle(
        "current",
        a.host === location.host && a.pathname === location.pathname
    );

    // Open external links in new tab
    if (a.host !== location.host) {
        a.target = "_blank";
    }

    nav.append(a)
}

function setColorScheme(scheme) {
    document.documentElement.style.colorScheme = scheme;
    localStorage.colorScheme = scheme;
    const select = document.querySelector(".color-scheme select");
    if (select) select.value = scheme;
}


if ("colorScheme" in localStorage) {
    setColorScheme(localStorage.colorScheme);
}

// Listen for dropdown changes
document
    .querySelector(".color-scheme select")
    .addEventListener("change", (event) => {
        setColorScheme(event.target.value);
    });

const form = document.querySelector("form");

form.addEventListener("submit", (event) => {
    event.preventDefault(); // stop default submission

    const data = new FormData(form);
    const params = [];

    for (let [name, value] of data) {
        params.push(`${name}=${encodeURIComponent(value)}`);
    }

    const url = `${form.action}?${params.join("&")}`;
    location.href = url;
});