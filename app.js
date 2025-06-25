const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const transactionForm = document.getElementById("transactionForm");
const descInput = document.getElementById("desc");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const transactionList = document.getElementById("transactionList");
const themeToggle = document.getElementById("themeToggle");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function renderTransactions() {
  transactionList.innerHTML = "";
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((txn, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${txn.desc}</td>
      <td>PKR ${txn.amount}</td>
      <td>${txn.type}</td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteTransaction(${index})">Delete</button></td>
    `;
    transactionList.appendChild(row);

    if (txn.type === "income") totalIncome += txn.amount;
    else totalExpense += txn.amount;
  });

  income.textContent = `PKR ${totalIncome}`;
  expense.textContent = `PKR ${totalExpense}`;
  balance.textContent = `PKR ${totalIncome - totalExpense}`;
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransactions();
}

transactionForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const desc = descInput.value;
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;
  if (!desc || !amount) return;

  transactions.push({ desc, amount, type });
  localStorage.setItem("transactions", JSON.stringify(transactions));
  descInput.value = "";
  amountInput.value = "";
  renderTransactions();
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("theme-dark");
  document.body.classList.toggle("theme-light");
});

renderTransactions();
