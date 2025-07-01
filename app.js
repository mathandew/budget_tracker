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

const currencySelect = document.getElementById("currencySelect");
let currency = localStorage.getItem("currency") || "PKR";
currencySelect.value = currency;

const categoryCanvas = document.getElementById("categoryChart");
let categoryChart = null;

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let pieChart = null;
let lineChart = null;

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

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

    income.textContent = `${currency} ${totalIncome}`;
  expense.textContent = `${currency} ${totalExpense}`;
  balance.textContent = `${currency} ${totalIncome - totalExpense}`;

  categoryFilter.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat || "uncategorized";
    option.textContent = cat ? cat : "Uncategorized";
    categoryFilter.appendChild(option);
  });

  renderPieChart(totalIncome, totalExpense);
  renderLineChart(transactions);
  updateMonthlySummary();
  
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransactions();
}

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

themeSelect.addEventListener("change", () => {
  document.body.className = "";
  document.body.classList.add(`theme-${themeSelect.value}`);
});

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

categoryFilter.addEventListener("change", renderTransactions);

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

function renderCategoryChart(data) {
  if (categoryChart) categoryChart.destroy();

  const categoryTotals = {};

  data.forEach(txn => {
    if (txn.type === "expense") {
      categoryTotals[txn.category] = (categoryTotals[txn.category] || 0) + txn.amount;
    }
  });

  const labels = Object.keys(categoryTotals);
  const values = Object.values(categoryTotals);
  const colors = labels.map(() => `hsl(${Math.random() * 360}, 70%, 60%)`);

  categoryChart = new Chart(categoryCanvas, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors
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


function updateMonthlySummary() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  let monthIncome = 0;
  let monthExpense = 0;

  transactions.forEach(txn => {
    const txnDate = new Date(txn.date);
    if (txnDate.getMonth() === month && txnDate.getFullYear() === year) {
      if (txn.type === "income") monthIncome += txn.amount;
      else monthExpense += txn.amount;
    }
  });

  const monthBalance = monthIncome - monthExpense;
 document.getElementById("monthlySummary").textContent =
  `This month's balance: ${currency} ${monthBalance} (Income: ${currency} ${monthIncome}, Expense: ${currency} ${monthExpense})`;
}

currencySelect.addEventListener("change", () => {
  currency = currencySelect.value;
  localStorage.setItem("currency", currency);
  renderTransactions();
});

renderTransactions();
renderCategoryChart(transactions);
