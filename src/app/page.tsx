
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ShieldCheck, Zap, Star, Users, Briefcase } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-cleaning');
  const teamImg = PlaceHolderImages.find(img => img.id === 'team-cleaning');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="px-6 lg:px-12 h-20 flex items-center bg-white border-b sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-primary tracking-tight font-headline">CleanPro Connect</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-8 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden md:block" href="#benefits">
            Benefits
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden md:block" href="#how-it-works">
            How it Works
          </Link>
          <Link href="/register">
            <Button variant="outline" className="hidden sm:inline-flex border-primary text-primary hover:bg-primary hover:text-white">
              Join as Provider
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-primary hover:bg-primary/90">Sign In</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="container px-6 mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col space-y-8 max-w-2xl">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 text-accent font-semibold text-sm w-fit border border-accent/20">
                <Star className="w-4 h-4 mr-2 fill-accent" />
                Trusted by 5,000+ Cleaners Nationwide
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold font-headline leading-tight text-primary">
                Be Your Own Boss with CleanPro.
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Connect with residential and commercial clients in your area. We handle the marketing, booking, and payments. You focus on what you do best.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 w-full sm:w-auto">
                    Get Started Now
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 w-full sm:w-auto">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative h-[450px] lg:h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl">
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
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-24 bg-white">
          <div className="container px-6 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-4xl font-bold font-headline text-primary">Why Partner With Us?</h2>
              <p className="text-muted-foreground text-lg">We provide the tools you need to grow your independent cleaning business.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
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
                <Card key={idx} className="border-none shadow-lg bg-background/50 hover:shadow-xl transition-shadow">
                  <CardContent className="pt-10 pb-10 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <benefit.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 bg-primary text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/10 -skew-x-12 transform translate-x-1/2" />
          <div className="container px-6 mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h2 className="text-4xl lg:text-5xl font-bold font-headline">Ready to Join the Team?</h2>
                <ul className="space-y-4">
                  {[
                    "Background checks included",
                    "Insurance coverage provided",
                    "CleanPro brand credibility",
                    "Advanced mobile dashboard",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-lg">
                      <CheckCircle className="text-accent w-6 h-6 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="h-14 px-10 text-lg text-primary bg-white hover:bg-accent hover:text-white border-none">
                    Start Your Application
                  </Button>
                </Link>
              </div>
              <div className="hidden lg:block relative h-[500px] w-full rounded-2xl overflow-hidden">
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

      <footer className="py-12 bg-background border-t">
        <div className="container px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-primary w-6 h-6" />
            <span className="text-xl font-bold text-primary tracking-tight font-headline">CleanPro Connect</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 CleanPro National Cleaning Company. All rights reserved.</p>
          <div className="flex gap-6">
            <Link className="text-sm text-muted-foreground hover:text-primary" href="#">Privacy</Link>
            <Link className="text-sm text-muted-foreground hover:text-primary" href="#">Terms</Link>
            <Link className="text-sm text-muted-foreground hover:text-primary" href="#">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
