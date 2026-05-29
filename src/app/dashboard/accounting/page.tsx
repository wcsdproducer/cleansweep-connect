"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  ArrowUpRight, 
  FileText, 
  Download,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

const data = [
  { month: 'Jan', earnings: 1200 },
  { month: 'Feb', earnings: 1500 },
  { month: 'Mar', earnings: 1800 },
  { month: 'Apr', earnings: 1400 },
  { month: 'May', earnings: 2200 },
  { month: 'Jun', earnings: 2500 },
];

export default function AccountingPage() {
  const db = useFirestore();
  const { user } = useUser();

  const invoicesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'serviceProviders', user.uid, 'payoutTransactions'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: invoices } = useCollection(invoicesQuery);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary font-headline">Accounting & Payments</h1>
          <p className="text-muted-foreground">Track your earnings and manage invoices.</p>
        </div>
        <Button className="bg-primary flex gap-2">
          <Download className="w-4 h-4" /> Download Report
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md bg-primary text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Wallet className="w-24 h-24" />
          </div>
          <CardContent className="p-8">
            <p className="text-primary-foreground/80 font-medium mb-2">Available Balance</p>
            <h2 className="text-5xl font-bold mb-6">$842.50</h2>
            <div className="flex gap-3">
              <Button variant="secondary" className="bg-white text-primary hover:bg-accent hover:text-white border-none">
                Withdraw Now
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-8 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-green-50 text-green-600">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Monthly Earnings</p>
                <h3 className="text-2xl font-bold text-primary">$3,240.00</h3>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12.5% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-8 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Pending Payouts</p>
                <h3 className="text-2xl font-bold text-primary">$215.00</h3>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Scheduled for: Wednesday, July 20</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-primary font-headline">Earnings Overview</CardTitle>
            <CardDescription>Visual breakdown of your income over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="earnings" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#19CCCC' : '#1F70B2'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl text-primary font-headline">Recent Invoices</CardTitle>
              <CardDescription>Manage your latest billing transactions.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices?.map((inv: any, i: number) => (
                  <TableRow key={i} className="cursor-pointer group">
                    <TableCell className="font-medium text-primary pl-6">
                      <div className="flex flex-col">
                        <span>{inv.invoiceId}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">{inv.date}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{inv.client}</TableCell>
                    <TableCell className="font-bold">{inv.amount}</TableCell>
                    <TableCell>
                      <Badge variant={inv.status === 'Paid' ? 'default' : 'outline'} className={inv.status === 'Paid' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none' : ''}>
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" className="group-hover:text-primary"><Download className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}