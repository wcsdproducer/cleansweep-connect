
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Calendar, 
  Star, 
  Clock, 
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

const upcomingJobs = [
  { id: 1, client: "Sarah Jenkins", time: "Tomorrow, 09:00 AM", type: "Deep Clean", status: "Confimed", price: "$120" },
  { id: 2, client: "TechFlow Offices", time: "Fri, 06:00 PM", type: "Commercial", status: "Pending", price: "$450" },
  { id: 3, client: "Michael Chen", time: "Sat, 11:30 AM", type: "Residential", status: "Confirmed", price: "$85" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary font-headline">Welcome back, Alex!</h1>
          <p className="text-muted-foreground">You have 3 jobs scheduled for this week.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/schedule">
            <Button className="bg-primary">View Schedule</Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Earnings (July)", value: "$1,450.00", icon: Wallet, color: "text-primary", bg: "bg-primary/10" },
          { label: "Total Jobs", value: "24", icon: Calendar, color: "text-accent", bg: "bg-accent/10" },
          { label: "Avg. Rating", value: "4.9/5", icon: Star, color: "text-yellow-500", bg: "bg-yellow-50" },
          { label: "Hours Worked", value: "112h", icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-primary mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Next Job Card */}
        <Card className="lg:col-span-2 shadow-lg border-none overflow-hidden group">
          <div className="bg-primary p-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <Badge variant="secondary" className="bg-accent text-white border-none px-3">Upcoming Job</Badge>
              <span className="text-white/80 text-sm">Today, 02:00 PM</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Residential Cleaning - Sarah Jenkins</h2>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-4 h-4" />
              <span>123 Highland Ave, Oak Park, IL</span>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Estimated Pay</p>
                <p className="text-xl font-bold text-primary">$120.00</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-xl font-bold text-primary">~3 Hours</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1 bg-accent hover:bg-accent/90">Start Job</Button>
              <Button variant="outline" className="flex-1 border-primary text-primary hover:bg-primary/5">Details</Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick View */}
        <Card className="shadow-md border-none h-fit">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Recent Activity</CardTitle>
            <CardDescription>Updates from your last 48 hours.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { text: "Payment of $450 processed", icon: CheckCircle2, color: "text-green-500" },
              { text: "New message from Admin", icon: MessageSquare, color: "text-blue-500" },
              { text: "Client rated you 5 stars", icon: Star, color: "text-yellow-500" },
              { text: "Schedule updated for Sat", icon: Calendar, color: "text-primary" },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <div className={`p-2 rounded-full bg-white shadow-sm ${activity.color}`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{activity.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Schedule Preview */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-white">
          <CardTitle className="text-xl text-primary font-headline">Upcoming Jobs</CardTitle>
          <Link href="/dashboard/schedule">
            <Button variant="ghost" className="text-primary hover:bg-primary/5">
              Full Schedule <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {upcomingJobs.map((job) => (
              <div key={job.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/5 text-primary rounded-full flex items-center justify-center font-bold">
                    {job.client.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">{job.client}</h4>
                    <p className="text-sm text-muted-foreground">{job.type} • {job.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <span className="font-bold text-lg text-primary">{job.price}</span>
                  <Badge variant={job.status === "Confirmed" ? "default" : "secondary"}>
                    {job.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { MessageSquare } from 'lucide-react';
