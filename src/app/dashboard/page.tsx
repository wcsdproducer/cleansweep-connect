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
  MapPin,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, limit, where } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const db = useFirestore();
  const { user } = useUser();

  const jobsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'serviceJobs'),
      where('serviceProviderId', '==', user.uid),
      limit(5)
    );
  }, [db, user]);

  const { data: jobs, isLoading: jobsLoading } = useCollection(jobsQuery);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-foreground tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">You have {jobs?.length || 0} jobs scheduled for this week.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/schedule">
            <Button className="bg-primary text-white hover:bg-primary/90 rounded-2xl px-6 h-12 shadow-lg shadow-primary/20">
              View Schedule
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Earnings (July)", value: "$1,450.00", icon: Wallet, color: "text-primary", bg: "bg-primary/10" },
          { label: "Total Jobs", value: "24", icon: Calendar, color: "text-accent", bg: "bg-accent/10" },
          { label: "Avg. Rating", value: "4.9/5", icon: Star, color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Hours Worked", value: "112h", icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 rounded-[2rem] bg-white">
            <CardContent className="p-8 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-foreground mt-2">{stat.value}</h3>
              </div>
              <div className={`p-4 rounded-[1.25rem] ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-7 h-7" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Next Job Card */}
        <Card className="lg:col-span-2 shadow-2xl border-none overflow-hidden group rounded-[2.5rem] bg-white">
          <div className="bg-primary p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <Badge variant="secondary" className="bg-accent text-accent-foreground border-none px-4 py-1.5 font-bold uppercase tracking-widest text-[10px]">Upcoming Job</Badge>
                <span className="text-white/80 font-semibold">{jobs?.[0]?.time || 'No upcoming jobs'}</span>
              </div>
              <h2 className="text-white text-3xl font-bold mb-3">{jobs?.[0]?.type} - {jobs?.[0]?.clientName}</h2>
              <div className="flex items-center gap-2 text-white/90 font-medium">
                <MapPin className="w-5 h-5 text-accent" />
                <span>{jobs?.[0]?.address || '---'}</span>
              </div>
            </div>
          </div>
          <CardContent className="p-10">
            <div className="grid sm:grid-cols-2 gap-10 mb-10">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Estimated Pay</p>
                <p className="text-3xl font-bold text-primary">${jobs?.[0]?.price || '0.00'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Duration</p>
                <p className="text-3xl font-bold text-primary">~3 Hours</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl h-14 font-bold text-lg shadow-xl shadow-accent/10 transition-all hover:scale-105">Start Job</Button>
              <Button variant="outline" className="flex-1 border-primary text-primary hover:bg-primary/5 rounded-2xl h-14 font-bold text-lg">Details</Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick View */}
        <Card className="shadow-xl border-none h-fit rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-8 border-b bg-secondary/30">
            <CardTitle className="text-xl text-foreground font-bold">Recent Activity</CardTitle>
            <CardDescription className="font-medium">Updates from your last 48 hours.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-2">
            {[
              { text: "Payment of $450 processed", icon: CheckCircle2, color: "text-accent", bg: "bg-accent/10" },
              { text: "New message from Admin", icon: MessageSquare, color: "text-primary", bg: "bg-primary/10" },
              { text: "Client rated you 5 stars", icon: Star, color: "text-orange-500", bg: "bg-orange-10" },
              { text: "Schedule updated for Sat", icon: Calendar, color: "text-blue-500", bg: "bg-blue-10" },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-secondary/50 transition-all cursor-pointer group">
                <div className={`p-3 rounded-xl bg-white shadow-sm group-hover:shadow-md transition-all ${activity.color}`}>
                  <activity.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-foreground/80">{activity.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Schedule Preview */}
      <Card className="border-none shadow-xl overflow-hidden rounded-[2.5rem] bg-white">
        <CardHeader className="flex flex-row items-center justify-between p-8 border-b bg-white">
          <CardTitle className="text-2xl text-foreground font-bold">Weekly Schedule</CardTitle>
          <Link href="/dashboard/schedule">
            <Button variant="ghost" className="text-primary hover:bg-primary/5 font-bold rounded-xl px-4">
              Full Schedule <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-secondary">
            {jobs?.map((job: any, i: number) => (
              <div key={i} className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-secondary/20 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary/5 text-primary rounded-2xl flex items-center justify-center font-bold text-2xl shadow-inner">
                    {job.clientName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-xl">{job.clientName}</h4>
                    <p className="text-sm text-muted-foreground font-medium">{job.type} • {job.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 self-end sm:self-auto">
                  <span className="font-bold text-2xl text-primary">${job.price}</span>
                  <Badge className={cn(
                    "px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest",
                    job.status === "Confirmed" ? "bg-accent text-accent-foreground" : "bg-secondary text-primary"
                  )}>
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