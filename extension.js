// on load

const toolbar = document.querySelector("#js-issues-toolbar");

if (toolbar) {
    const datesFilter = toolbar.querySelector("#dates-select-menu");

    if (! datesFilter) {
        editToolbar(toolbar);
    }
}

// on change

const root = document.querySelector("#repo-content-pjax-container");
const config = { childList: true };

const callback = function(mutations, _observer) {
    const container = mutations
        .filter(m => m.type === "childList")
        .filter(m => m.addedNodes.length == 1)
        .map(m => m.addedNodes[0])
        .filter(n => n.className === "js-check-all-container")
        [0];

    if (! container) { return; }

    const toolbar = container.querySelector("#js-issues-toolbar");

    if (! toolbar) { return; }

    editToolbar(toolbar);
};

const observer = new MutationObserver(callback);

observer.observe(root, config);

// edit toolbar

function editToolbar(toolbar) {
    const filters = toolbar.querySelectorAll(".table-list-header-toggle")[1];
    const filterList = filters.querySelectorAll("details");
    const lastFilter = filterList[filterList.length - 1];
    const datesFilter = buildDatesFilter(lastFilter);
    filters.appendChild(datesFilter);
    editLastChild(lastFilter);
}

function editLastChild(node) {
    node.classList.remove("pr-3");
    node.classList.remove("pr-sm-0");
}

function buildDatesFilter(filter) {
    const node = filter.cloneNode(true);
    node.setAttribute("id", "dates-select-menu");
    editNodeSummary(node);
    editNodeDetails(node);
    return node;
}

function editNodeSummary(node) {
    const summary = node.querySelector("summary");
    summary.setAttribute("title", "Dates");
    summary.setAttribute("data-ga-click", "Issues, Table filter, Dates");
    summary.firstChild.textContent = "Dates";
}

function editNodeDetails(node) {
    const details = node.querySelector("details-menu");
    editDetailsHeader(details);
    editDetailsList(details);
}

function editDetailsHeader(details) {
    details.setAttribute("aria-label", "Select dates")
    const headerTitle = details.querySelector(".SelectMenu-title");
    headerTitle.innerText = "Select dates";
    const headerCloseButton= details.querySelector(".SelectMenu-closeButton");
    headerCloseButton.setAttribute("data-toggle-for", "dates-select-menu");
}

function editDetailsList(details) {
    const list = details.querySelector(".SelectMenu-list");
    list.innerHTML = "";
    const [startDate, endDate] = parseInput();
    const startDateInput = buildDate("start", startDate);
    const endDateInput = buildDate("end", endDate);
    const button = buildButton();
    list.appendChild(startDateInput);
    list.appendChild(endDateInput);
    list.appendChild(button);
}

function parseInput() {
    const input = document.querySelector("#js-issues-search");
    const value = input.value;
    const regex = new RegExp("closed:>=(\\S*) |closed:<=(\\S*) |closed:(\\S*)\\.\\.(\\S*) ");
    const matches = regex.exec(value);
    if (matches) {
        if (matches[1]) {
            return [matches[1], ""];
        } else if (matches[2]) {
            return ["", matches[2]];
        } else if (matches[3] && matches[4]) {
            return [matches[3], matches[4]];
        }
    } 
    return ["", ""];
}

function buildButton() {
    const button = document.createElement("button");
    button.setAttribute("class", "SelectMenu-item");
    button.setAttribute("style", "font-weight: 600");
    button.innerText = "Apply";
    button.addEventListener("click", function() {
        applyDates();
    });
    return button;
}

function buildDate(name, value) {
    const item = document.createElement("div");
    item.setAttribute("class", "SelectMenu-filter");
    item.setAttribute("style", "display: flex; justify-content: space-between; align-items: center; padding: 4px 4px 4px 16px");
    
    const label = document.createElement("label");
    label.setAttribute("for", `dates-filter-${name}`);
    label.setAttribute("style", "font-weight: normal");
    label.innerText = `${name[0].toUpperCase()}${name.slice(1)} date`;
    
    const input = document.createElement("input");
    input.setAttribute("id", `dates-filter-${name}`);
    input.setAttribute("type", "date");
    input.setAttribute("class", "form-control");
    input.value = value;
    
    item.appendChild(label);
    item.appendChild(input);
    return item;
}

function applyDates() {
    const startDate = document.querySelector("#dates-filter-start").value;
    const endDate = document.querySelector("#dates-filter-end").value;
    const queryString = buildQueryString(startDate, endDate);
    updateInput(queryString);
    document.querySelector(".subnav-search").submit();
}

function buildQueryString(startDate, endDate) {
    if (startDate && endDate) {
        return `closed:${startDate}..${endDate} `;
    } else if (startDate) {
        return `closed:>=${startDate} `;
    } else if (endDate) {
        return `closed:<=${endDate} `;
    } else {
        return "";
    }
}

function updateInput(queryString) {
    const input = document.querySelector("#js-issues-search");
    const value = input.value;
    const regex = new RegExp("closed:\\\S* ");
    if (regex.test(value)) {
        input.value = value.replace(regex, queryString);
    } else {
        input.value = `${value} ${queryString}`;
    }
}