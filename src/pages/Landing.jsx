import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Users, 
  MessageCircle, 
  Zap, 
  Shield, 
  Globe,
  ArrowRight,
  Check,
  Star,
  Code2,
  Rocket,
  Heart,
  ChevronRight,
  Play
} from "lucide-react";
import heroNetwork from "@/assets/hero-network.jpg";

const features = [
  {
    icon: Users,
    title: "Smart Matching",
    description: "AI-powered algorithm matches you with developers based on skills, experience, and goals."
  },
  {
    icon: MessageCircle,
    title: "Real-time Chat",
    description: "Instant messaging with read receipts, typing indicators, and media sharing."
  },
  {
    icon: Zap,
    title: "Swipe to Connect",
    description: "Intuitive swipe interface to quickly discover and connect with relevant developers."
  },
  {
    icon: Shield,
    title: "Verified Profiles",
    description: "Trust verified developers with skill badges and professional credentials."
  },
  {
    icon: Globe,
    title: "Global Network",
    description: "Connect with developers worldwide, 24/7, across all time zones."
  },
  {
    icon: Rocket,
    title: "Project Collaboration",
    description: "Find co-founders, team members, or hackathon partners for your next venture."
  }
];

const stats = [
  { value: "50K+", label: "Active Developers" },
  { value: "100K+", label: "Connections Made" },
  { value: "5K+", label: "Projects Started" },
  { value: "98%", label: "Satisfaction Rate" }
];

const techStack = [
  "React", "Node.js", "Python", "TypeScript", "Go", "Rust", "AWS", "Docker"
];

export default function Landing() {
  const linkedinUrl = "https://www.linkedin.com/in/shivendra-keshari-46aa67256/";

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold gradient-text">Devlinker</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="gradient-primary shadow-lg" size="sm">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Completely Redesigned */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-30 dark:opacity-50"
            style={{
              backgroundImage: `url(${heroNetwork})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/80" />
          
          {/* Animated Orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-foreground/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 animate-fade-in">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium">#1 Developer Networking Platform</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight animate-slide-up">
                Where <span className="gradient-text">Developers</span> Build{" "}
                <span className="relative inline-block">
                  Connections
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 10C50 2 150 2 198 10" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg animate-slide-up" style={{ animationDelay: "0.1s" }}>
                Swipe, match, and collaborate with talented developers worldwide. 
                Find your next co-founder, team member, or mentor in seconds.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <Link to="/signup">
                  <Button size="lg" className="gradient-primary shadow-xl hover:shadow-2xl transition-all gap-2 text-lg px-8 h-14">
                    Start Matching Free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="gap-2 h-14 px-8">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </Button>
              </div>
              
              {/* Social Proof */}
              <div className="flex items-center gap-4 pt-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                      key={i} 
                      className="w-10 h-10 rounded-full border-2 border-background bg-muted overflow-hidden"
                    >
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                        alt=""
                        className="w-full h-full"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Loved by 50,000+ developers</p>
                </div>
              </div>
            </div>
            
            {/* Right Content - Floating Cards */}
            <div className="relative hidden lg:block">
                  <p className="text-sm text-muted-foreground">
                    Made with love by{" "}
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-foreground transition-colors"
                    >
                      Shivendra Keshari
                    </a>
                  </p>
              <div className="relative h-[600px]">
                {/* Main Card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 animate-float">
                  <div className="rounded-3xl glass shadow-2xl overflow-hidden border border-border/50">
                    <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent-foreground/20">
                      <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"
                        alt="Developer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold">Sarah Chen</h3>
                          <p className="text-primary text-sm">Full Stack Developer</p>
                        </div>
                        <Badge className="gradient-primary">Premium</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {["React", "Node.js", "TypeScript"].map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button variant="outline" className="flex-1 rounded-full">
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button className="flex-1 rounded-full gradient-primary">
                          Connect
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Badge 1 */}
                <div className="absolute top-20 right-0 animate-float" style={{ animationDelay: "1s" }}>
                  <div className="px-4 py-3 rounded-2xl glass shadow-lg border border-border/50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">New Match!</p>
                      <p className="text-xs text-muted-foreground">You matched with Alex</p>
                    </div>
                  </div>
                </div>
                
                {/* Floating Badge 2 */}
                <div className="absolute bottom-20 left-0 animate-float" style={{ animationDelay: "1.5s" }}>
                  <div className="px-4 py-3 rounded-2xl glass shadow-lg border border-border/50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">5 New Messages</p>
                      <p className="text-xs text-muted-foreground">From your connections</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/50 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Ticker */}
      <section className="py-8 overflow-hidden bg-muted/20">
        <div className="flex animate-[scroll_20s_linear_infinite]">
          {[...techStack, ...techStack, ...techStack].map((tech, index) => (
            <div key={index} className="flex items-center gap-4 px-8">
              <Code2 className="w-5 h-5 text-primary" />
              <span className="text-lg font-medium whitespace-nowrap">{tech}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 gradient-primary">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to <span className="gradient-text">Connect</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed to help you find, connect, and collaborate with the right developers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group p-8 rounded-3xl glass hover-lift transition-all duration-300 border border-border/50 hover:border-primary/30"
              >
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4">How It Works</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Start Connecting in <span className="gradient-text">3 Steps</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                step: "01", 
                title: "Create Your Profile", 
                desc: "Showcase your skills, experience, and what you're looking for in 2 minutes.",
                icon: Users
              },
              { 
                step: "02", 
                title: "Swipe & Match", 
                desc: "Browse developer profiles and swipe right on those who interest you.",
                icon: Heart
              },
              { 
                step: "03", 
                title: "Connect & Build", 
                desc: "Start chatting and building amazing projects together.",
                icon: Rocket
              }
            ].map((item, index) => (
              <div key={index} className="relative text-center p-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl gradient-primary mb-6 shadow-xl">
                  <item.icon className="w-10 h-10 text-primary-foreground" />
                </div>
                <div className="text-7xl font-bold text-primary/10 absolute top-0 left-1/2 -translate-x-1/2">{item.step}</div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-muted-foreground text-lg">{item.desc}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-24 -right-4 w-8">
                    <ChevronRight className="w-8 h-8 text-primary/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 md:p-16 rounded-3xl gradient-primary overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-64 h-64 bg-primary-foreground rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary-foreground rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary-foreground">
                Ready to Find Your Next Connection?
              </h2>
              <p className="text-xl mb-10 text-primary-foreground/80 max-w-2xl mx-auto">
                Join 50,000+ developers already networking on Devlinker. It's free to get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button size="lg" variant="secondary" className="gap-2 text-lg px-10 h-14 shadow-xl">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="outline" className="gap-2 text-lg px-10 h-14 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold gradient-text">Devlinker</span>
              </div>
              <p className="text-muted-foreground max-w-md mb-6">
                The #1 platform for developers to network, collaborate, and build amazing things together.
              </p>
              <div className="flex gap-4">
                {["Twitter", "GitHub", "LinkedIn", "Discord"].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
                    <span className="sr-only">{social}</span>
                    <Globe className="w-5 h-5 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Devlinker. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
