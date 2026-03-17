
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ShieldCheck, Zap, Star, Users, Briefcase, ChevronRight, Sparkles } from 'lucide-react';
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
            width={160}
            height={45}
            priority
          />
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-8 items-center">
          <Link className="text-sm font-bold text-foreground/70 hover:text-primary transition-colors hidden md:block" href="#benefits">
            Benefits
          </Link>
          <Link href="/register">
            <Button variant="outline" className="hidden sm:inline-flex border-primary text-primary hover:bg-primary hover:text-white rounded-xl font-bold">
              Join as Provider
            </Button>
          </Link>
          <Link href="/login">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 font-bold shadow-lg shadow-primary/20">Sign In</Button>
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
                <Star className="w-4 h-4 mr-2 fill-primary" />
                Rated 4.9/5 by Professionals
              </div>
              <h1 className="text-foreground font-extrabold leading-[1.1]">
                Reclaim Your Time with <span className="text-primary">CleanSweep</span>
              </h1>
              <p className="text-muted-foreground text-xl font-medium max-w-lg leading-relaxed">
                Professional home cleaning services tailored to your life. From recurring visits to deep cleans, we bring the sparkle back to your space.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/register">
                  <Button size="lg" className="h-16 px-10 text-lg bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-2xl shadow-primary/30 w-full sm:w-auto font-bold transition-all hover:scale-105">
                    Get Started Now <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="secondary" className="h-16 px-10 text-lg rounded-2xl w-full sm:w-auto font-bold bg-white/50 backdrop-blur-md">
                  View Our Services
                </Button>
              </div>
              
              <div className="flex items-center gap-4 pt-8">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-accent-foreground shadow-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-foreground text-lg font-bold">Bonded & Insured</h4>
                  <p className="text-muted-foreground font-medium">Your home is safe in our hands.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-32 bg-secondary/50">
          <div className="container px-6 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-foreground font-bold">Why Partner With Us?</h2>
              <p className="text-muted-foreground text-lg font-medium">We provide the tools you need to grow your independent cleaning business.</p>
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

        {/* Call to Action */}
        <section className="py-32 bg-foreground text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 transform translate-x-1/2" />
          <div className="container px-6 mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-12">
                <h2 className="text-white text-5xl font-extrabold leading-tight">Ready to Join the Team?</h2>
                <ul className="space-y-8">
                  {[
                    "Background checks included",
                    "Insurance coverage provided",
                    "CleanSweep brand credibility",
                    "Advanced mobile dashboard",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-6 text-2xl font-bold">
                      <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center text-accent-foreground shadow-lg">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button size="lg" className="h-20 px-14 text-2xl text-accent-foreground bg-accent hover:bg-accent/90 rounded-[2rem] shadow-2xl shadow-accent/30 border-none transition-all hover:scale-105 font-extrabold">
                    Start Your Application
                  </Button>
                </Link>
              </div>
              <div className="hidden lg:block relative h-[600px] w-full rounded-[4rem] overflow-hidden shadow-2xl border border-white/10">
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
          <Link href="/">
            <Image 
              src="https://firebasestorage.googleapis.com/v0/b/studio-3673070449-f277c.firebasestorage.app/o/CleanSweep-Layer%2011%20copy.png?alt=media&token=e060532e-cc86-43f8-8780-76371d95c936"
              alt="CleanSweep Logo"
              width={140}
              height={40}
            />
          </Link>
          <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">© 2024 CleanSweep National. All rights reserved.</p>
          <div className="flex gap-10">
            <Link className="text-sm font-extrabold text-muted-foreground hover:text-primary transition-colors" href="#">Privacy</Link>
            <Link className="text-sm font-extrabold text-muted-foreground hover:text-primary transition-colors" href="#">Terms</Link>
            <Link className="text-sm font-extrabold text-muted-foreground hover:text-primary transition-colors" href="#">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
