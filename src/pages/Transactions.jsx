import { useState, useMemo } from "react";
import { useFinance } from "../context/FinanceContext";
import { formatCurrency, formatDate } from "../lib/format";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Card, CardContent } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Search, Download, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { expenseCategories, incomeCategories } from "../data/mockTransactions";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { useToast } from "../hooks/use-toast";
const formSchema = z.object({
    date: z.string().min(1, "Date is required"),
    amount: z.coerce.number().positive("Amount must be positive"),
    type: z.enum(["income", "expense"]),
    category: z.string().min(1, "Category is required"),
    merchant: z.string().min(1, "Merchant is required"),
    description: z.string(),
});
export default function Transactions() {
    const { transactions, role, filter, setFilter, sort, setSort, addTransaction, deleteTransaction, editTransaction } = useFinance();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            amount: 0,
            type: "expense",
            category: "",
            merchant: "",
            description: "",
        },
    });
    const selectedType = form.watch("type");
    const availableCategories = selectedType === "income" ? incomeCategories : expenseCategories;
    const handleOpenDialog = (tx) => {
        if (tx) {
            setEditingId(tx.id);
            form.reset({
                date: tx.date.split('T')[0],
                amount: tx.amount,
                type: tx.type,
                category: tx.category,
                merchant: tx.merchant,
                description: tx.description,
            });
        }
        else {
            setEditingId(null);
            form.reset({
                date: new Date().toISOString().split('T')[0],
                amount: undefined,
                type: "expense",
                category: "",
                merchant: "",
                description: "",
            });
        }
        setIsDialogOpen(true);
    };
    const onSubmit = (data) => {
        const payload = {
            ...data,
            date: new Date(data.date).toISOString(),
        };
        if (editingId) {
            editTransaction(editingId, payload);
            toast({ title: "Transaction updated" });
        }
        else {
            addTransaction(payload);
            toast({ title: "Transaction added" });
        }
        setIsDialogOpen(false);
    };
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            deleteTransaction(id);
            toast({ title: "Transaction deleted" });
        }
    };
    const exportCSV = () => {
        const headers = ["Date", "Type", "Category", "Merchant", "Description", "Amount"];
        const rows = filteredAndSortedTransactions.map(tx => [
            new Date(tx.date).toLocaleDateString(),
            tx.type,
            tx.category,
            `"${tx.merchant}"`,
            `"${tx.description}"`,
            tx.amount.toString()
        ]);
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const filteredAndSortedTransactions = useMemo(() => {
        let result = [...transactions];
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            result = result.filter(tx => tx.merchant.toLowerCase().includes(searchLower) ||
                tx.description.toLowerCase().includes(searchLower));
        }
        if (filter.type !== "all") {
            result = result.filter(tx => tx.type === filter.type);
        }
        if (filter.category !== "all") {
            result = result.filter(tx => tx.category === filter.category);
        }
        result.sort((a, b) => {
            let comparison = 0;
            if (sort.field === "date") {
                comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
            }
            else if (sort.field === "amount") {
                comparison = a.amount - b.amount;
            }
            return sort.direction === "asc" ? comparison : -comparison;
        });
        return result;
    }, [transactions, filter, sort]);
    const allCategories = useMemo(() => {
        const cats = new Set();
        transactions.forEach(tx => cats.add(tx.category));
        return Array.from(cats).sort();
    }, [transactions]);
    return (<div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Manage and review your financial activity.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={exportCSV} className="gap-2">
            <Download className="h-4 w-4"/>
            Export CSV
          </Button>
          {role === "admin" && (<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                  <Plus className="h-4 w-4"/>
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="type" render={({ field }) => (<FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select type"/></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="expense">Expense</SelectItem>
                              <SelectItem value="income">Income</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>)}/>
                      <FormField control={form.control} name="date" render={({ field }) => (<FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl><Input type="date" {...field}/></FormControl>
                          <FormMessage />
                        </FormItem>)}/>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="amount" render={({ field }) => (<FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field}/></FormControl>
                          <FormMessage />
                        </FormItem>)}/>
                      <FormField control={form.control} name="category" render={({ field }) => (<FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Category"/></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableCategories.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>)}/>
                    </div>

                    <FormField control={form.control} name="merchant" render={({ field }) => (<FormItem>
                        <FormLabel>Merchant / Source</FormLabel>
                        <FormControl><Input placeholder="e.g. Whole Foods" {...field}/></FormControl>
                        <FormMessage />
                      </FormItem>)}/>

                    <FormField control={form.control} name="description" render={({ field }) => (<FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl><Input placeholder="Additional details" {...field}/></FormControl>
                        <FormMessage />
                      </FormItem>)}/>
                    
                    <div className="flex justify-end pt-4">
                      <Button type="submit">{editingId ? "Save Changes" : "Add Transaction"}</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>)}
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
              <Input placeholder="Search merchants..." className="pl-9" value={filter.search} onChange={(e) => setFilter({ search: e.target.value })}/>
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
              <Select value={filter.type} onValueChange={(val) => setFilter({ type: val })}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filter.category} onValueChange={(val) => setFilter({ category: val })}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCategories.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={`${sort.field}-${sort.direction}`} onValueChange={(val) => {
            const [field, direction] = val.split('-');
            setSort({ field: field, direction: direction });
        }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="amount-desc">Highest Amount</SelectItem>
                  <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead>Merchant / Details</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  {role === "admin" && <TableHead className="w-[50px]"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTransactions.length === 0 ? (<TableRow>
                    <TableCell colSpan={role === "admin" ? 6 : 5} className="h-32 text-center text-muted-foreground">
                      No transactions found matching your criteria.
                    </TableCell>
                  </TableRow>) : (filteredAndSortedTransactions.map((tx) => (<TableRow key={tx.id}>
                      <TableCell className="font-mono text-sm">{formatDate(tx.date)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{tx.merchant}</div>
                        {tx.description && tx.description !== tx.merchant && (<div className="text-xs text-muted-foreground truncate max-w-[200px]">{tx.description}</div>)}
                        <div className="text-xs text-muted-foreground md:hidden mt-1">{tx.category}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {tx.category}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className={tx.type === "income" ? "text-success border-success/30 bg-success/10" : "text-destructive border-destructive/30 bg-destructive/10"}>
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-mono font-medium ${tx.type === "income" ? "text-success" : ""}`}>
                        {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </TableCell>
                      {role === "admin" && (<TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4"/>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDialog(tx)}>
                                <Pencil className="mr-2 h-4 w-4"/>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(tx.id)}>
                                <Trash2 className="mr-2 h-4 w-4"/>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>)}
                    </TableRow>)))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>);
}
