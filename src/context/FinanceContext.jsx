import { createContext, useContext, useEffect, useState } from "react";
import { mockTransactions } from "../data/mockTransactions";
const FinanceContext = createContext(undefined);
export function FinanceProvider({ children }) {
    const [transactions, setTransactions] = useState(() => {
        const DATA_VERSION = "v2";
        const storedVersion = localStorage.getItem("finance_data_version");
        if (storedVersion !== DATA_VERSION) {
            localStorage.removeItem("finance_transactions");
            localStorage.setItem("finance_data_version", DATA_VERSION);
            return mockTransactions;
        }
        const saved = localStorage.getItem("finance_transactions");
        if (saved) {
            try {
                return JSON.parse(saved);
            }
            catch (e) {
                return mockTransactions;
            }
        }
        return mockTransactions;
    });
    const [role, setRoleState] = useState(() => {
        return localStorage.getItem("finance_role") || "admin";
    });
    const [theme, setThemeState] = useState(() => {
        if (typeof window !== "undefined" && localStorage.getItem("finance_theme")) {
            return localStorage.getItem("finance_theme");
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    });
    const [filter, setFilterState] = useState({
        search: "",
        type: "all",
        category: "all",
    });
    const [sort, setSort] = useState({
        field: "date",
        direction: "desc",
    });
    useEffect(() => {
        localStorage.setItem("finance_transactions", JSON.stringify(transactions));
    }, [transactions]);
    useEffect(() => {
        localStorage.setItem("finance_role", role);
    }, [role]);
    useEffect(() => {
        localStorage.setItem("finance_theme", theme);
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
    }, [theme]);
    const addTransaction = (tx) => {
        const newTx = {
            ...tx,
            id: `tx-${Math.random().toString(36).substr(2, 9)}`,
        };
        setTransactions((prev) => [newTx, ...prev]);
    };
    const editTransaction = (id, updatedTx) => {
        setTransactions((prev) => prev.map((tx) => (tx.id === id ? { ...updatedTx, id } : tx)));
    };
    const deleteTransaction = (id) => {
        setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    };
    const setRole = (newRole) => setRoleState(newRole);
    const setTheme = (newTheme) => setThemeState(newTheme);
    const setFilter = (newFilter) => setFilterState((prev) => ({ ...prev, ...newFilter }));
    return (<FinanceContext.Provider value={{
            transactions,
            role,
            theme,
            filter,
            sort,
            addTransaction,
            editTransaction,
            deleteTransaction,
            setRole,
            setTheme,
            setFilter,
            setSort,
        }}>
      {children}
    </FinanceContext.Provider>);
}
export function useFinance() {
    const context = useContext(FinanceContext);
    if (context === undefined) {
        throw new Error("useFinance must be used within a FinanceProvider");
    }
    return context;
}
