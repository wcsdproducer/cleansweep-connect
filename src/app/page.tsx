import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ShieldCheck, Zap, Star, Users, Briefcase, ChevronRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-cleaning');
  const teamImg = PlaceHolderImages.find(img => img.id === 'team-cleaning');

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="px-6 lg:px-12 h-20 flex items-center bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-foreground tracking-tight">CleanSweep</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-8 items-center">
          <Link className="text-sm font-semibold hover:text-primary transition-colors hidden md:block" href="#benefits">
            Benefits
          </Link>
          <Link className="text-sm font-semibold hover:text-primary transition-colors hidden md:block" href="#how-it-works">
            How it Works
          </Link>
          <Link href="/register">
            <Button variant="outline" className="hidden sm:inline-flex border-primary text-primary hover:bg-primary hover:text-white rounded-xl">
              Join as Provider
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6">Sign In</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[calc(100vh-80px)] flex items-center py-20 overflow-hidden">
          <div className="container px-6 mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col space-y-8 max-w-2xl animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm w-fit">
                <Star className="w-4 h-4 mr-2 fill-primary" />
                Rated 4.9/5 by Professionals
              </div>
              <h1 className="text-foreground">
                Reclaim Your Time with <span className="text-primary">CleanSweep</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-lg">
                Professional home cleaning services tailored to your life. From recurring visits to deep cleans, we bring the sparkle back to your space.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/register">
                  <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl shadow-primary/20 w-full sm:w-auto">
                    Get Started Now <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="secondary" className="h-14 px-8 text-lg rounded-2xl w-full sm:w-auto">
                  View Our Services
                </Button>
              </div>
            </div>
            <div className="relative h-[500px] lg:h-[600px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right-8 duration-700">
              {heroImg && (
                <Image
                  src={heroImg.imageUrl}
                  alt={heroImg.description}
                  fill
                  className="object-cover"
                  priority
                  data-ai-hint={heroImg.imageHint}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-10 left-10 right-10 p-6 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-accent-foreground shadow-lg">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">Bonded & Insured</h4>
                    <p className="text-white/80 text-sm">Your home is safe in our hands.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-32 bg-secondary/50">
          <div className="container px-6 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-foreground">Why Partner With Us?</h2>
              <p className="text-muted-foreground text-lg">We provide the tools you need to grow your independent cleaning business.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  title: "Flexible Schedule",
                  desc: "Work when you want. Set your own availability and choose the jobs that fit your lifestyle.",
                  icon: Zap,
                },
                {
                  title: "Steady Income",
                  desc: "No more hunting for clients. We provide a consistent stream of jobs every single week.",
                  icon: Users,
                },
                {
                  title: "Weekly Payments",
                  desc: "Get paid directly to your bank account every week. No invoicing headaches or payment delays.",
                  icon: Briefcase,
                },
              ].map((benefit, idx) => (
                <Card key={idx} className="border-none shadow-xl bg-white hover:-translate-y-2 transition-all duration-300 rounded-[2rem] p-4">
                  <CardContent className="pt-10 pb-10 flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center text-primary shadow-inner">
                      <benefit.icon className="w-10 h-10" />
                    </div>
                    <h3 className="text-foreground">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{benefit.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Premium Cleaning Plan Section - Brand Card Styles */}
        <section className="py-32 bg-white">
          <div className="container px-6 mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Card 1: Premium Cleaning */}
              <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden group">
                <div className="relative h-64 w-full">
                  <Image src="https://picsum.photos/seed/clean_premium/600/400" alt="Premium Cleaning" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 left-4">
                    <div className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full uppercase tracking-widest">Recurring</div>
                  </div>
                </div>
                <CardContent className="p-10 space-y-6">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-bold text-sm uppercase tracking-wider">Premium Cleaning</span>
                  </div>
                  <h3 className="text-foreground leading-tight">The perfect maintenance plan for busy families.</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span>Regular maintenance</span>
                    </li>
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span>Same professional team</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Card 2: Bonded & Insured (Primary Color Background) */}
              <Card className="bg-primary border-none shadow-2xl rounded-[2.5rem] p-10 flex flex-col justify-between text-white">
                <div className="space-y-6">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <ShieldCheck className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-white text-3xl">Bonded & Insured</h2>
                  <p className="text-white/80 leading-relaxed">
                    Your home is safe with us. We carry full liability insurance and bonding for your total peace of mind.
                  </p>
                </div>
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl h-14 font-bold text-lg mt-8 shadow-xl shadow-black/10">
                  View Policy Details
                </Button>
              </Card>

              {/* Card 3: Background Checked (Verification Status Style) */}
              <Card className="bg-secondary border-none shadow-xl rounded-[2.5rem] p-10 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-primary">
                    <Users className="w-6 h-6" />
                    <span className="font-bold">Background Checked</span>
                  </div>
                  <p className="text-muted-foreground text-sm">Every CleanSweep professional undergoes rigorous screening and multi-stage background verification.</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 border border-primary/10 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Verification Status</span>
                    <CheckCircle className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">100% Verified</div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-32 bg-foreground text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 -skew-x-12 transform translate-x-1/2" />
          <div className="container px-6 mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-10">
                <h2 className="text-white text-5xl">Ready to Join the Team?</h2>
                <ul className="space-y-6">
                  {[
                    "Background checks included",
                    "Insurance coverage provided",
                    "CleanSweep brand credibility",
                    "Advanced mobile dashboard",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-4 text-xl font-medium">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button size="lg" className="h-16 px-12 text-xl text-accent-foreground bg-accent hover:bg-accent/90 rounded-2xl shadow-2xl shadow-accent/20 border-none transition-all hover:scale-105">
                    Start Your Application
                  </Button>
                </Link>
              </div>
              <div className="hidden lg:block relative h-[550px] w-full rounded-[3rem] overflow-hidden shadow-2xl">
                {teamImg && (
                  <Image
                    src={teamImg.imageUrl}
                    alt={teamImg.description}
                    fill
                    className="object-cover"
                    data-ai-hint={teamImg.imageHint}
                  />
                )}
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 bg-white border-t">
        <div className="container px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">CleanSweep</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">© 2024 CleanSweep National Cleaning Company. All rights reserved.</p>
          <div className="flex gap-8">
            <Link className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors" href="#">Privacy</Link>
            <Link className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors" href="#">Terms</Link>
            <Link className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors" href="#">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Sparkles, MessageSquare } from 'lucide-react';