export const expenseCategories = ["Food & Dining", "Transport", "Shopping", "Entertainment", "Housing", "Healthcare", "Utilities", "Travel"];
export const incomeCategories = ["Salary", "Freelance", "Investment", "Other Income"];
const generateMockTransactions = () => {
    const transactions = [];
    const now = new Date();
    const randomAmount = (min, max) => {
        return Number((Math.random() * (max - min) + min).toFixed(2));
    };
    const randomDate = (start, end) => {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };
    const categories = {
        expense: {
            "Food & Dining": ["Whole Foods", "Starbucks", "Uber Eats", "Chipotle", "Local Restaurant"],
            "Transport": ["Uber", "Lyft", "Shell Station", "Chevron", "MTA"],
            "Shopping": ["Amazon", "Target", "Apple", "Nike", "H&M"],
            "Entertainment": ["Netflix", "Spotify", "AMC Theaters", "Steam", "PlayStation"],
            "Housing": ["Rent", "Home Depot", "IKEA", "Mortgage"],
            "Healthcare": ["CVS", "Walgreens", "Doctor Visit", "Dental", "Insurance"],
            "Utilities": ["ConEdison", "PG&E", "AT&T", "Verizon", "Water Bill"],
            "Travel": ["Delta", "United", "Airbnb", "Marriott", "Expedia"]
        },
        income: {
            "Salary": ["Acme Corp", "Tech Solutions Inc", "Global Industries"],
            "Freelance": ["Upwork", "Fiverr", "Client Payment"],
            "Investment": ["Vanguard", "Fidelity", "Robinhood", "Charles Schwab"],
            "Other Income": ["Venmo Transfer", "PayPal Transfer", "Cash Deposit"]
        }
    };
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    for (let i = 0; i < 75; i++) {
        const type = Math.random() > 0.8 ? "income" : "expense";
        let category;
        let merchantList;
        let amount;
        if (type === "income") {
            category = incomeCategories[Math.floor(Math.random() * incomeCategories.length)];
            merchantList = categories.income[category];
            amount = randomAmount(500, 5000);
        }
        else {
            category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
            merchantList = categories.expense[category];
            amount = randomAmount(10, 300);
            if (category === "Housing" || category === "Travel") {
                amount = randomAmount(300, 2000);
            }
        }
        const merchant = merchantList[Math.floor(Math.random() * merchantList.length)];
        const description = `${category} at ${merchant}`;
        transactions.push({
            id: `tx-${Math.random().toString(36).substr(2, 9)}`,
            date: randomDate(sixMonthsAgo, now).toISOString(),
            amount,
            type,
            category,
            description,
            merchant
        });
    }
    // Guarantee current month transactions so dashboard shows real data
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthFixed = [
        { type: "income", category: "Salary", merchant: "Tech Solutions Inc", amount: 5200.00 },
        { type: "income", category: "Freelance", merchant: "Upwork", amount: 850.00 },
        { type: "expense", category: "Housing", merchant: "Rent", amount: 1850.00 },
        { type: "expense", category: "Food & Dining", merchant: "Whole Foods", amount: 87.43 },
        { type: "expense", category: "Utilities", merchant: "AT&T", amount: 89.99 },
        { type: "expense", category: "Transport", merchant: "Uber", amount: 34.50 },
        { type: "expense", category: "Shopping", merchant: "Amazon", amount: 156.78 },
        { type: "expense", category: "Entertainment", merchant: "Netflix", amount: 15.99 },
        { type: "expense", category: "Food & Dining", merchant: "Chipotle", amount: 12.75 },
        { type: "expense", category: "Healthcare", merchant: "CVS", amount: 42.30 },
    ];
    currentMonthFixed.forEach((tx, i) => {
        const txDate = new Date(currentMonthStart);
        txDate.setDate(i + 1);
        transactions.push({
            id: `tx-fixed-${i}`,
            date: txDate.toISOString(),
            amount: tx.amount,
            type: tx.type,
            category: tx.category,
            description: `${tx.category} at ${tx.merchant}`,
            merchant: tx.merchant,
        });
    });
    // Sort by date descending
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
export const mockTransactions = generateMockTransactions();
