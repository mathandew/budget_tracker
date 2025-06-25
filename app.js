const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const transactionForm = document.getElementById("transactionForm");
const descInput = document.getElementById("desc");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const transactionList = document.getElementById("transactionList");
const categoryFilter = document.getElementById("categoryFilter");
const themeSelect = document.getElementById("themeSelect");
const exportBtn = document.getElementById("exportBtn");
const chartCanvas = document.getElementById("chart");
const lineCanvas = document.getElementById("lineChart");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let pieChart = null;
let lineChart = null;

// Utility to get today's date in YYYY-MM-DD
function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

// Render transaction list and charts
function renderTransactions() {
  transactionList.innerHTML = "";
  let totalIncome = 0;
  let totalExpense = 0;
  const selectedCategory = categoryFilter.value;
  const categories = new Set(["all"]);

  transactions.forEach((txn, index) => {
    if (selectedCategory !== "all" && txn.category !== selectedCategory) return;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${txn.desc}</td>
      <td>PKR ${txn.amount}</td>
      <td>${txn.type}</td>
      <td>${txn.category || "-"}</td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteTransaction(${index})">Delete</button></td>
    `;
    transactionList.appendChild(row);

    categories.add(txn.category);
    if (txn.type === "income") totalIncome += txn.amount;
    else totalExpense += txn.amount;
  });

  income.textContent = `PKR ${totalIncome}`;
  expense.textContent = `PKR ${totalExpense}`;
  balance.textContent = `PKR ${totalIncome - totalExpense}`;

  // Update category dropdown
  categoryFilter.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat || "uncategorized";
    option.textContent = cat ? cat : "Uncategorized";
    categoryFilter.appendChild(option);
  });

  renderPieChart(totalIncome, totalExpense);
  renderLineChart(transactions);
}

// Delete a transaction
function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransactions();
}

// Add transaction
transactionForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const desc = descInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;
  const category = categoryInput.value.trim() || "Uncategorized";
  const date = getTodayDate();

  if (!desc || !amount || amount <= 0) return;

  transactions.push({ desc, amount, type, category, date });
  localStorage.setItem("transactions", JSON.stringify(transactions));
  transactionForm.reset();
  renderTransactions();
});

// Theme switcher
themeSelect.addEventListener("change", () => {
  document.body.className = "";
  document.body.classList.add(`theme-${themeSelect.value}`);
});

// Export to CSV
exportBtn.addEventListener("click", () => {
  let csv = "Description,Amount,Type,Category,Date\n";
  transactions.forEach(txn => {
    csv += `"${txn.desc}",${txn.amount},${txn.type},"${txn.category}",${txn.date}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "budget_tracker.csv";
  link.click();
});

// Filter by category
categoryFilter.addEventListener("change", renderTransactions);

// Render pie chart
function renderPieChart(incomeValue, expenseValue) {
  if (pieChart) pieChart.destroy();

  pieChart = new Chart(chartCanvas, {
    type: "doughnut",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{
        data: [incomeValue, expenseValue],
        backgroundColor: ["#198754", "#dc3545"],
        borderColor: "#fff"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

// Render line chart (daily totals)
function renderLineChart(data) {
  if (lineChart) lineChart.destroy();

  const totalsByDate = {};

  data.forEach(txn => {
    if (!totalsByDate[txn.date]) {
      totalsByDate[txn.date] = 0;
    }
    totalsByDate[txn.date] += txn.type === "income" ? txn.amount : -txn.amount;
  });

  const sortedDates = Object.keys(totalsByDate).sort();
  const values = sortedDates.map(date => totalsByDate[date]);

  lineChart = new Chart(lineCanvas, {
    type: "line",
    data: {
      labels: sortedDates,
      datasets: [{
        label: "Net Amount (Income - Expense)",
        data: values,
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13, 110, 253, 0.2)",
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top"
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Init
renderTransactions();
