// Expense & Budget Visualizer
// Vanilla JS, data is stored in the browser with Local Storage.

const STORAGE_KEYS = {
  transactions: "ebv_transactions",
  categories: "ebv_categories",
  theme: "ebv_theme",
  sort: "ebv_sort",
};

const DEFAULT_CATEGORIES = ["Food", "Transport", "Fun"];
const BASE_COLORS = ["#2ecc71", "#3498db", "#e67e22"];

// ---------- State ----------
let transactions = load(STORAGE_KEYS.transactions, []);
let categories = load(STORAGE_KEYS.categories, DEFAULT_CATEGORIES);
let sortBy = load(STORAGE_KEYS.sort, "newest");
let chart = null;

// ---------- DOM ----------
const form = document.getElementById("transaction-form");
const nameInput = document.getElementById("item-name");
const amountInput = document.getElementById("item-amount");
const categorySelect = document.getElementById("item-category");
const formError = document.getElementById("form-error");

const newCategoryInput = document.getElementById("new-category");
const addCategoryBtn = document.getElementById("add-category");
const categoryError = document.getElementById("category-error");

const listEl = document.getElementById("transaction-list");
const emptyList = document.getElementById("empty-list");
const sortSelect = document.getElementById("sort-by");

const totalEl = document.getElementById("total-balance");
const countEl = document.getElementById("transaction-count");

const canvas = document.getElementById("category-chart");
const emptyChart = document.getElementById("empty-chart");

const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

// ---------- Local Storage helpers ----------
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // Storage might be full or blocked. The app still works for this session.
  }
}

// ---------- Formatting ----------
const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function formatMoney(value) {
  return currency.format(value);
}

// ---------- Colors ----------
function colorFor(category) {
  const index = categories.indexOf(category);
  if (index >= 0 && index < BASE_COLORS.length) return BASE_COLORS[index];
  // Extra categories get evenly spread hues
  const hue = ((index < 0 ? 0 : index) * 67) % 360;
  return "hsl(" + hue + ", 60%, 55%)";
}

// ---------- Rendering ----------
function renderCategories() {
  const current = categorySelect.value;
  categorySelect.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose a category";
  categorySelect.appendChild(placeholder);

  categories.forEach(function (cat) {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  if (categories.includes(current)) categorySelect.value = current;
}

function getSortedTransactions() {
  const list = transactions.slice();
  switch (sortBy) {
    case "amount-desc":
      return list.sort(function (a, b) { return b.amount - a.amount; });
    case "amount-asc":
      return list.sort(function (a, b) { return a.amount - b.amount; });
    case "category":
      return list.sort(function (a, b) { return a.category.localeCompare(b.category); });
    default:
      return list.sort(function (a, b) { return b.id - a.id; });
  }
}

function renderList() {
  listEl.innerHTML = "";
  const sorted = getSortedTransactions();

  emptyList.hidden = sorted.length > 0;

  sorted.forEach(function (t) {
    const li = document.createElement("li");
    li.className = "transaction-item";

    const info = document.createElement("div");
    info.className = "transaction-info";

    const name = document.createElement("div");
    name.className = "transaction-name";
    name.textContent = t.name;

    const amount = document.createElement("div");
    amount.className = "transaction-amount";
    amount.textContent = formatMoney(t.amount);

    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = t.category;

    info.appendChild(name);
    info.appendChild(amount);
    info.appendChild(chip);

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete-btn";
    del.textContent = "Delete";
    del.setAttribute("aria-label", "Delete " + t.name);
    del.addEventListener("click", function () {
      deleteTransaction(t.id);
    });

    li.appendChild(info);
    li.appendChild(del);
    listEl.appendChild(li);
  });
}

function renderBalance() {
  const total = transactions.reduce(function (sum, t) { return sum + t.amount; }, 0);
  totalEl.textContent = formatMoney(total);

  const n = transactions.length;
  countEl.textContent = n === 0
    ? "No transactions yet"
    : n + (n === 1 ? " transaction" : " transactions");
}

function chartTextColor() {
  return getComputedStyle(document.documentElement).getPropertyValue("--ink").trim();
}

function renderChart() {
  const totals = {};
  transactions.forEach(function (t) {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });

  const labels = Object.keys(totals);
  const values = labels.map(function (l) { return totals[l]; });
  const hasData = labels.length > 0;

  canvas.hidden = !hasData;
  emptyChart.hidden = hasData;

  if (!hasData) {
    if (chart) { chart.destroy(); chart = null; }
    return;
  }

  const colors = labels.map(colorFor);

  if (!chart) {
    chart = new Chart(canvas, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [{ data: values, backgroundColor: colors, borderWidth: 0 }],
      },
      options: {
        plugins: {
          legend: { position: "bottom", labels: { color: chartTextColor() } },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return " " + ctx.label + ": " + formatMoney(ctx.parsed);
              },
            },
          },
        },
      },
    });
  } else {
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.data.datasets[0].backgroundColor = colors;
    chart.options.plugins.legend.labels.color = chartTextColor();
    chart.update();
  }
}

function renderAll() {
  renderBalance();
  renderList();
  renderChart();
}

// ---------- Actions ----------
function showError(el, message) {
  el.textContent = message;
  el.hidden = false;
}

function hideError(el) {
  el.hidden = true;
  el.textContent = "";
}

function addTransaction(event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categorySelect.value;

  if (!name || amountInput.value === "" || !category) {
    showError(formError, "Please fill in all fields before adding.");
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    showError(formError, "Amount must be a number greater than 0.");
    return;
  }

  hideError(formError);

  transactions.push({
    id: Date.now(),
    name: name,
    amount: amount,
    category: category,
  });
  save(STORAGE_KEYS.transactions, transactions);

  form.reset();
  nameInput.focus();
  renderAll();
}

function deleteTransaction(id) {
  transactions = transactions.filter(function (t) { return t.id !== id; });
  save(STORAGE_KEYS.transactions, transactions);
  renderAll();
}

function addCategory() {
  const value = newCategoryInput.value.trim();

  if (!value) {
    showError(categoryError, "Type a category name first.");
    return;
  }
  const exists = categories.some(function (c) {
    return c.toLowerCase() === value.toLowerCase();
  });
  if (exists) {
    showError(categoryError, "That category already exists.");
    return;
  }

  hideError(categoryError);
  categories.push(value);
  save(STORAGE_KEYS.categories, categories);

  newCategoryInput.value = "";
  renderCategories();
  categorySelect.value = value;
}

// ---------- Theme ----------
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
  themeToggle.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
  );
  if (chart) {
    chart.options.plugins.legend.labels.color = chartTextColor();
    chart.update();
  }
}

function toggleTheme() {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  save(STORAGE_KEYS.theme, next);
  applyTheme(next);
}

function initTheme() {
  const saved = load(STORAGE_KEYS.theme, null);
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
}

// ---------- Events ----------
form.addEventListener("submit", addTransaction);
addCategoryBtn.addEventListener("click", addCategory);
newCategoryInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    addCategory();
  }
});
sortSelect.addEventListener("change", function () {
  sortBy = sortSelect.value;
  save(STORAGE_KEYS.sort, sortBy);
  renderList();
});
themeToggle.addEventListener("click", toggleTheme);

// ---------- Init ----------
sortSelect.value = sortBy;
renderCategories();
renderAll();
initTheme();
