"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  MapPin, 
  ChevronRight, 
  ChevronLeft,
  Filter,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';

export default function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const db = useFirestore();
  const { user } = useUser();

  const jobsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'serviceJobs'),
      where('serviceProviderId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: jobs } = useCollection(jobsQuery);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary font-headline">My Schedule</h1>
          <p className="text-muted-foreground">Manage your upcoming appointments and tasks.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex gap-2 border-primary text-primary hover:bg-primary/5">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button className="bg-primary">Sync with Google</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Calendar Column */}
        <Card className="lg:col-span-4 border-none shadow-md h-fit">
          <CardContent className="p-4">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md w-full"
            />
          </CardContent>
          <div className="p-6 border-t bg-muted/20">
            <h4 className="font-bold text-primary mb-4">Availability Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Mon - Fri</span>
                <span className="font-bold text-primary">08:00 - 18:00</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sat</span>
                <span className="font-bold text-primary">09:00 - 15:00</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sun</span>
                <span className="font-bold text-destructive">Unavailable</span>
              </div>
              <Button variant="ghost" className="w-full text-xs text-accent hover:text-accent/80 hover:bg-accent/5 p-0 h-auto font-bold mt-2">
                Edit Working Hours
              </Button>
            </div>
          </div>
        </Card>

        {/* Jobs Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary font-headline">
              Jobs for {date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost"><ChevronLeft className="w-5 h-5" /></Button>
              <Button size="icon" variant="ghost"><ChevronRight className="w-5 h-5" /></Button>
            </div>
          </div>

          <div className="space-y-4">
            {jobs?.map((job: any, i: number) => (
              <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="w-2 bg-primary group-hover:bg-accent transition-colors" />
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-primary mb-1">{job.clientName}</h3>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none">{job.type}</Badge>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary">${job.price}</span>
                        <p className="text-xs text-muted-foreground">Estimated</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="p-2 rounded-lg bg-muted text-primary"><Clock className="w-4 h-4" /></div>
                        <span className="text-sm font-medium">{job.time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="p-2 rounded-lg bg-muted text-primary"><MapPin className="w-4 h-4" /></div>
                        <span className="text-sm font-medium truncate">{job.address}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button className="flex-1 bg-primary">Directions</Button>
                      <Button variant="outline" className="flex-1 border-primary text-primary hover:bg-primary/5">View Details</Button>
                      <Button variant="ghost" size="icon"><MoreVertical className="w-5 h-5 text-muted-foreground" /></Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {(!jobs || jobs.length === 0) && (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-white rounded-xl shadow-sm border border-dashed border-muted-foreground/20">
                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-primary">No jobs scheduled</h4>
                  <p className="text-muted-foreground">You have a clear day! Enjoy your break.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}