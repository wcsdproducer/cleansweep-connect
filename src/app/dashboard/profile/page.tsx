
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Star, Camera, CheckCircle2, User, Mail, Phone, MapPin } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-primary font-headline">My Profile</h1>
        <Button className="bg-primary px-8">Save Changes</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column - Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-md overflow-hidden">
            <div className="h-24 bg-primary relative">
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <div className="relative group">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarImage src="https://picsum.photos/seed/profile/200/200" />
                    <AvatarFallback>AP</AvatarFallback>
                  </Avatar>
                  <button className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
            <CardContent className="pt-14 pb-8 text-center space-y-4">
              <div>
                <h3 className="text-xl font-bold text-primary">Alex Peterson</h3>
                <p className="text-sm text-muted-foreground">Professional Cleaner</p>
              </div>
              <div className="flex justify-center gap-2">
                <Badge variant="secondary" className="bg-accent/10 text-accent border-none">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                </Badge>
                <Badge variant="secondary" className="bg-yellow-50 text-yellow-600 border-none">
                  <Star className="w-3 h-3 mr-1 fill-yellow-600" /> 4.9 Rating
                </Badge>
              </div>
              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <User className="w-4 h-4 text-primary" />
                  <span>Joined March 2023</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>248 Completed Jobs</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-primary">Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span>Background Check</span>
                <span className="text-green-500 font-bold">Passed</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Liability Insurance</span>
                <span className="text-green-500 font-bold">Active</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>W-9 Form</span>
                <span className="text-green-500 font-bold">Verified</span>
              </div>
              <Button variant="outline" className="w-full text-xs h-8 border-primary text-primary hover:bg-primary/5">
                Update Documents
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="md:col-span-2">
          <Card className="border-none shadow-md">
            <CardHeader className="border-b">
              <CardTitle className="text-xl text-primary font-headline">Account Details</CardTitle>
              <CardDescription>Update your personal and business information.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fname">First Name</Label>
                  <Input id="fname" defaultValue="Alex" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lname">Last Name</Label>
                  <Input id="lname" defaultValue="Peterson" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue="alex.p@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+1 (555) 123-4567" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Service Area / City</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="address" className="pl-10" defaultValue="Chicago, IL & Surrounding Suburbs" />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-bold text-primary">Service Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {['Residential', 'Deep Clean', 'Commercial', 'Eco-Friendly', 'Post-Construction'].map((tag) => (
                    <Badge key={tag} variant="outline" className="px-3 py-1 cursor-pointer hover:bg-primary hover:text-white transition-colors border-primary/20">
                      {tag}
                    </Badge>
                  ))}
                  <Badge variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-accent hover:text-white transition-colors bg-accent/10 text-accent border-none">
                    + Add Specialty
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Label htmlFor="bio">Professional Bio</Label>
                <textarea 
                  id="bio"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  defaultValue="Highly experienced cleaning professional with over 5 years in residential and commercial sanitation. Dedicated to providing a spotless environment with a keen eye for detail."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
