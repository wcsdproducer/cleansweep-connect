import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ShieldCheck, Zap, Star, Users, Briefcase, ChevronRight, Sparkles, Check } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-cleaning');
  const teamImg = PlaceHolderImages.find(img => img.id === 'team-cleaning');

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="px-6 lg:px-12 h-20 flex items-center bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <Link className="flex items-center justify-center" href="/">
          <Image 
            src="https://firebasestorage.googleapis.com/v0/b/studio-3673070449-f277c.firebasestorage.app/o/CleanSweep-Layer%2011%20copy.png?alt=media&token=e060532e-cc86-43f8-8780-76371d95c936"
            alt="CleanSweep Logo"
            width={220}
            height={60}
            priority
          />
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-8 items-center">
          <Link className="text-sm font-bold text-foreground/70 hover:text-primary transition-colors hidden md:block" href="#benefits">
            Provider Benefits
          </Link>
          <Link href="/register">
            <Button variant="outline" className="hidden sm:inline-flex border-primary text-primary hover:bg-primary hover:text-white rounded-xl font-bold">
              Join as Provider
            </Button>
          </Link>
          <Link href="/login">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 font-bold shadow-lg shadow-primary/20">Provider Login</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[calc(100vh-80px)] flex items-center py-20 overflow-hidden">
          {/* Background Image */}
          {heroImg && (
            <div className="absolute inset-0 z-0">
              <Image
                src={heroImg.imageUrl}
                alt={heroImg.description}
                fill
                className="object-cover object-center"
                priority
                data-ai-hint={heroImg.imageHint}
              />
              {/* Overlay for legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent lg:from-white/90 lg:via-white/60" />
            </div>
          )}

          <div className="container relative z-10 px-6 mx-auto">
            <div className="flex flex-col space-y-8 max-w-2xl animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/20 text-primary font-bold text-sm w-fit backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2 fill-primary" />
                Join the #1 Platform for Cleaning Pros
              </div>
              <h1 className="text-foreground font-extrabold leading-[1.1]">
                Grow Your Cleaning Business with <span className="text-primary">CleanSweep</span>
              </h1>
              <p className="text-muted-foreground text-xl font-medium max-w-lg leading-relaxed">
                Connect with high-quality clients, set your own schedule, and get paid weekly. We handle the bookings so you can focus on the work.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/register">
                  <Button size="lg" className="h-16 px-10 text-lg bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-2xl shadow-primary/30 w-full sm:w-auto font-bold transition-all hover:scale-105">
                    Start Your Application <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#benefits">
                  <Button size="lg" variant="secondary" className="h-16 px-10 text-lg rounded-2xl w-full sm:w-auto font-bold bg-white/50 backdrop-blur-md">
                    Learn How It Works
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center gap-4 pt-8">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-accent-foreground shadow-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-foreground text-lg font-bold">Industry-Leading Pay</h4>
                  <p className="text-muted-foreground font-medium">Keep more of what you earn with our transparent fee structure.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-32 bg-secondary/50">
          <div className="container px-6 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-foreground font-bold">Why CleanSweep for Pros?</h2>
              <p className="text-muted-foreground text-lg font-medium">We provide the tools and clients you need to run a successful independent cleaning business.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  title: "Flexible Schedule",
                  desc: "You're the boss. Set your own availability and choose only the jobs that fit your lifestyle and location.",
                  icon: Zap,
                },
                {
                  title: "Steady Stream of Jobs",
                  desc: "Stop spending money on marketing. We bring a constant flow of bookings directly to your dashboard.",
                  icon: Users,
                },
                {
                  title: "Fast Weekly Payouts",
                  desc: "Get paid directly to your bank account every single week. No more chasing clients or waiting for checks.",
                  icon: Briefcase,
                },
              ].map((benefit, idx) => (
                <Card key={idx} className="border-none shadow-xl bg-white hover:-translate-y-2 transition-all duration-500 rounded-[2.5rem] p-4">
                  <CardContent className="pt-12 pb-12 flex flex-col items-center text-center space-y-6">
                    <div className="w-24 h-24 rounded-[2rem] bg-secondary flex items-center justify-center text-primary shadow-inner transition-transform group-hover:rotate-6">
                      <benefit.icon className="w-12 h-12" />
                    </div>
                    <h3 className="text-foreground text-2xl">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed font-medium">{benefit.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action - Refined Recruitment Section */}
        <section className="py-24 bg-primary text-white overflow-hidden relative">
          <div className="container px-6 mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col gap-10">
                <h2 className="text-white text-5xl font-extrabold leading-tight tracking-tight">
                  Ready to Be Your Own Boss?
                </h2>
                <ul className="flex flex-col gap-6">
                  {[
                    "Professional liability insurance coverage",
                    "Marketing and client booking handled for you",
                    "Dedicated provider support team",
                    "Advanced mobile dashboard for business management",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-4 text-xl font-semibold">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                        <Check className="w-5 h-5 stroke-[3px]" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-8">
                  <Link href="/register">
                    <Button size="lg" className="h-16 px-10 text-xl text-[#0E2531] font-extrabold bg-accent hover:bg-accent/90 rounded-2xl shadow-xl shadow-black/10 border-none transition-all hover:scale-105">
                      Apply to Join Now
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative h-[500px] w-full lg:h-[600px] rounded-[3rem] lg:rounded-[5rem] overflow-hidden shadow-2xl">
                {teamImg && (
                  <Image
                    src={teamImg.imageUrl}
                    alt={teamImg.description}
                    fill
                    className="object-cover"
                    data-ai-hint={teamImg.imageHint}
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="pt-20 pb-10 bg-white border-t">
        <div className="container px-6 mx-auto">
          {/* Top Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-16">
            <Link href="/">
              <Image 
                src="https://firebasestorage.googleapis.com/v0/b/studio-3673070449-f277c.firebasestorage.app/o/CleanSweep-Layer%2011%20copy.png?alt=media&token=e060532e-cc86-43f8-8780-76371d95c936"
                alt="CleanSweep Logo"
                width={240}
                height={65}
              />
            </Link>
            <div className="flex gap-10">
              <Link className="text-sm font-extrabold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest" href="#">Provider Agreement</Link>
              <Link className="text-sm font-extrabold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest" href="#">Support</Link>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-10 border-t flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
              © 2026 CleanSweep National. Provider Network.
            </p>
            <div className="flex gap-8">
              <Link className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-[0.2em]" href="#">Privacy Policy</Link>
              <Link className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-[0.2em]" href="#">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
