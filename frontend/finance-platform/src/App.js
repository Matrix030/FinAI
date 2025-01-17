import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import { CategoryScale, LinearScale, BarElement } from "chart.js";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './styles.css';



ChartJS.register(CategoryScale, LinearScale, BarElement);

ChartJS.register(ArcElement, Tooltip, Legend);


function App() {
    const [transactions, setTransactions] = useState([]);
    const [formData, setFormData] = useState({
        type: "income",
        amount: "",
        description: "",
    });

    // Financial summaries
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [netBalance, setNetBalance] = useState(0);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const filteredTransactions = transactions.filter((transaction) => {
      if (!startDate || !endDate) return true; // Show all if no date is selected
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
  });
  
  const pieChartData = {
    labels: ["Income", "Expenses"],
    datasets: [
        {
            data: [
                filteredTransactions
                    .filter((t) => t.type === "income")
                    .reduce((sum, t) => sum + t.amount, 0),
                filteredTransactions
                    .filter((t) => t.type === "expense")
                    .reduce((sum, t) => sum + t.amount, 0),
            ],
            backgroundColor: ["#36A2EB", "#FF6384"],
            hoverBackgroundColor: ["#36A2EB", "#FF6384"],
        },
    ],
};


const pieChartOptions = {
  plugins: {
      legend: {
          position: "bottom",
      },
  },
};

<div className= "chart-container">
    <h2>Income vs. Expenses</h2>
    <Pie data={pieChartData} options={pieChartOptions} />
</div>

const barChartData = {
  labels: filteredTransactions.map((t, index) => `Transaction ${index + 1}`),
  datasets: [
      {
          label: "Income",
          data: filteredTransactions.map((t) =>
              t.type === "income" ? t.amount : 0
          ),
          backgroundColor: "#36A2EB",
      },
      {
          label: "Expenses",
          data: filteredTransactions.map((t) =>
              t.type === "expense" ? t.amount : 0
          ),
          backgroundColor: "#FF6384",
      },
  ],
};

const barChartOptions = {
  plugins: {
      legend: {
          position: "top",
      },
  },
  scales: {
      x: { beginAtZero: true },
      y: { beginAtZero: true },
  },
};

<div className="chart-container">
  <h2>Transaction Trends</h2>
  <Bar data={barChartData} options={barChartOptions} />
</div>


  

    // Fetch transactions from the backend
    useEffect(() => {
        fetch("http://127.0.0.1:5000/transactions")
            .then((response) => response.json())
            .then((data) => {
                setTransactions(data.transactions);
                calculateSummaries(data.transactions);
            });
    }, []);

    // Calculate financial summaries
    const calculateSummaries = (transactions) => {
        const income = transactions
            .filter((t) => t.type === "income")
            .reduce((acc, t) => acc + t.amount, 0);
        const expenses = transactions
            .filter((t) => t.type === "expense")
            .reduce((acc, t) => acc + t.amount, 0);
        setTotalIncome(income);
        setTotalExpenses(expenses);
        setNetBalance(income - expenses);
    };

    // Handle form input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        fetch("http://127.0.0.1:5000/add_transaction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === "success") {
                    alert("Transaction added successfully!");
                    // Refresh the transaction list
                    fetch("http://127.0.0.1:5000/transactions")
                        .then((response) => response.json())
                        .then((data) => {
                            setTransactions(data.transactions);
                            calculateSummaries(data.transactions);
                        });
                } else {
                    alert("Failed to add transaction.");
                }
            });
    };

    return (
      <div>
          <h1>AI Financial Platform</h1>
  
          <h2>Add a Transaction</h2>
          <form onSubmit={handleSubmit}>
              <label>
                  Type:
                  <select name="type" value={formData.type} onChange={handleChange}>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                  </select>
              </label>
              <br />
              <label>
                  Amount:
                  <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                  />
              </label>
              <br />
              <label>
                  Description:
                  <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                  />
              </label>
              <br />
              <button type="submit">Add Transaction</button>
          </form>
  
          <h2>Financial Summaries</h2>
          <p>Total Income: ${totalIncome.toFixed(2)}</p>
          <p>Total Expenses: ${totalExpenses.toFixed(2)}</p>
          <p>Net Balance: ${netBalance.toFixed(2)}</p>
  
          <h2>Filter by Date</h2>
          <div className="date-filters">
              <label>
                  Start Date:
                  <ReactDatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      dateFormat="yyyy-MM-dd"
                  />
              </label>
              <label>
                  End Date:
                  <ReactDatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      dateFormat="yyyy-MM-dd"
                  />
              </label>
          </div>
  
          <h2>Transactions</h2>
          <ul>
              {filteredTransactions.map((transaction) => (
                  <li key={transaction.id}>
                      {transaction.type.toUpperCase()}: ${transaction.amount} - {transaction.description}
                  </li>
              ))}
          </ul>
  
          <div style={{ width: "50%", margin: "auto" }}>
              <h2>Income vs. Expenses</h2>
              <Pie data={pieChartData} />
          </div>
  
          <div style={{ width: "75%", margin: "auto", marginTop: "20px" }}>
              <h2>Transaction Trends</h2>
              <Bar data={barChartData} />
          </div>
      </div>
  );
  
}

export default App;
