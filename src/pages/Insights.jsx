import { useMemo } from "react";
import { useFinance } from "../context/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { formatCurrency } from "../lib/format";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
export default function Insights() {
    const { transactions } = useFinance();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const insights = useMemo(() => {
        // Top spending category
        const expensesByCategory = {};
        let totalExpenses = 0;
        // Monthly comparison
        const monthlyDataMap = {};
        // Previous vs Current Month
        let currentMonthExpense = 0;
        let prevMonthExpense = 0;
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        transactions.forEach(tx => {
            const date = new Date(tx.date);
            const isExpense = tx.type === "expense";
            // Category aggregation
            if (isExpense) {
                expensesByCategory[tx.category] = (expensesByCategory[tx.category] || 0) + tx.amount;
                totalExpenses += tx.amount;
                // Month comparison
                if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                    currentMonthExpense += tx.amount;
                }
                else if (date.getMonth() === prevMonth && date.getFullYear() === prevMonthYear) {
                    prevMonthExpense += tx.amount;
                }
            }
            // Monthly bar chart aggregation
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyDataMap[monthKey]) {
                monthlyDataMap[monthKey] = {
                    income: 0,
                    expense: 0,
                    month: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date),
                    rawDate: new Date(date.getFullYear(), date.getMonth(), 1)
                };
            }
            if (isExpense) {
                monthlyDataMap[monthKey].expense += tx.amount;
            }
            else {
                monthlyDataMap[monthKey].income += tx.amount;
            }
        });
        const sortedCategories = Object.entries(expensesByCategory)
            .map(([name, amount]) => ({ name, amount, percentage: (amount / totalExpenses) * 100 }))
            .sort((a, b) => b.amount - a.amount);
        const highestCategory = sortedCategories[0];
        const monthlyData = Object.values(monthlyDataMap)
            .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
            .slice(-6); // Last 6 months
        const avgMonthlySpending = monthlyData.length > 0
            ? monthlyData.reduce((acc, val) => acc + val.expense, 0) / monthlyData.length
            : 0;
        let momChange = 0;
        if (prevMonthExpense > 0) {
            momChange = ((currentMonthExpense - prevMonthExpense) / prevMonthExpense) * 100;
        }
        return {
            highestCategory,
            totalExpenses,
            topCategories: sortedCategories.slice(0, 5),
            monthlyData,
            avgMonthlySpending,
            currentMonthExpense,
            prevMonthExpense,
            momChange
        };
    }, [transactions, currentMonth, currentYear]);
    return (<div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Insights & Analytics</h1>
        <p className="text-muted-foreground">Deep dive into your spending patterns and financial health.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary text-primary-foreground border-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/80">Highest Spending Category</CardTitle>
          </CardHeader>
          <CardContent>
            {insights.highestCategory ? (<>
                <div className="text-2xl font-bold">{insights.highestCategory.name}</div>
                <div className="text-3xl font-mono mt-2">{formatCurrency(insights.highestCategory.amount)}</div>
                <p className="text-sm text-primary-foreground/80 mt-1">
                  {insights.highestCategory.percentage.toFixed(1)}% of total expenses
                </p>
              </>) : (<div className="text-sm">Not enough data</div>)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Monthly Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{formatCurrency(insights.avgMonthlySpending)}</div>
            <p className="text-sm text-muted-foreground mt-1">Based on last {insights.monthlyData.length} months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Month-over-Month Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold font-mono">{Math.abs(insights.momChange).toFixed(1)}%</div>
              {insights.momChange > 0 ? (<Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10 gap-1">
                  <TrendingUp className="h-3 w-3"/> Up
                </Badge>) : (<Badge variant="outline" className="text-success border-success/30 bg-success/10 gap-1">
                  <TrendingDown className="h-3 w-3"/> Down
                </Badge>)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">vs previous month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={insights.monthlyData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))"/>
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10}/>
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`}/>
                  <Tooltip formatter={(value) => formatCurrency(value)} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}/>
                  <Legend verticalAlign="top" height={36} iconType="circle"/>
                  <Bar dataKey="income" name="Income" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} maxBarSize={40}/>
                  <Bar dataKey="expense" name="Expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} maxBarSize={40}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {insights.topCategories.map((cat, idx) => (<div key={cat.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="font-medium flex items-center gap-2">
                      <span className="text-muted-foreground font-mono">{idx + 1}.</span> {cat.name}
                    </div>
                    <div className="font-mono">{formatCurrency(cat.amount)}</div>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${cat.percentage}%` }}/>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">{cat.percentage.toFixed(1)}%</div>
                </div>))}
              {insights.topCategories.length === 0 && (<div className="text-center text-muted-foreground py-8">No expense data available</div>)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);
}
