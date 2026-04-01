import { useFinance } from "../context/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { formatCurrency, formatDate } from "../lib/format";
import { ArrowDownRight, ArrowUpRight, DollarSign, Percent } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend } from "recharts";
import { useMemo } from "react";
import { Badge } from "../components/ui/badge";
export default function Dashboard() {
    const { transactions } = useFinance();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const stats = useMemo(() => {
        let totalIncome = 0;
        let totalExpense = 0;
        let monthlyIncome = 0;
        let monthlyExpense = 0;
        transactions.forEach((tx) => {
            const txDate = new Date(tx.date);
            const isCurrentMonth = txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
            if (tx.type === "income") {
                totalIncome += tx.amount;
                if (isCurrentMonth)
                    monthlyIncome += tx.amount;
            }
            else {
                totalExpense += tx.amount;
                if (isCurrentMonth)
                    monthlyExpense += tx.amount;
            }
        });
        const totalBalance = totalIncome - totalExpense;
        const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0;
        return { totalBalance, monthlyIncome, monthlyExpense, savingsRate };
    }, [transactions, currentMonth, currentYear]);
    const balanceTrendData = useMemo(() => {
        // Group transactions by month
        const monthlyData = {};
        const sortedTxs = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let runningBalance = 0;
        sortedTxs.forEach((tx) => {
            const date = new Date(tx.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' }).format(date);
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { income: 0, expense: 0, balance: runningBalance };
            }
            if (tx.type === "income") {
                monthlyData[monthKey].income += tx.amount;
                runningBalance += tx.amount;
            }
            else {
                monthlyData[monthKey].expense += tx.amount;
                runningBalance -= tx.amount;
            }
            monthlyData[monthKey].balance = runningBalance;
        });
        return Object.entries(monthlyData).map(([key, data]) => {
            const [year, month] = key.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1);
            return {
                month: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date),
                balance: data.balance,
            };
        });
    }, [transactions]);
    const expenseCategoryData = useMemo(() => {
        const categories = {};
        transactions
            .filter((tx) => tx.type === "expense")
            .forEach((tx) => {
            categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
        });
        return Object.entries(categories)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // top 5
    }, [transactions]);
    const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
    return (<div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">Your financial summary for {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date())}.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{formatCurrency(stats.totalBalance)}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-success"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-success">{formatCurrency(stats.monthlyIncome)}</div>
            <p className="text-xs text-muted-foreground mt-1">Current month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-destructive"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-destructive">{formatCurrency(stats.monthlyExpense)}</div>
            <p className="text-xs text-muted-foreground mt-1">Current month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{stats.savingsRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Of monthly income</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Balance Trend</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={balanceTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10}/>
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} dx={-10}/>
                  <Tooltip formatter={(value) => [formatCurrency(value), "Balance"]} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}/>
                  <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseCategoryData} cx="50%" cy="45%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {expenseCategoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}/>
                  <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((tx) => (<div key={tx.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{tx.merchant}</span>
                  <span className="text-xs text-muted-foreground">{tx.category} • {formatDate(tx.date)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={tx.type === "income" ? "text-success border-success/30 bg-success/10" : "text-destructive border-destructive/30 bg-destructive/10"}>
                    {tx.type}
                  </Badge>
                  <span className={`font-mono font-medium ${tx.type === "income" ? "text-success" : ""}`}>
                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </span>
                </div>
              </div>))}
          </div>
        </CardContent>
      </Card>
    </div>);
}
