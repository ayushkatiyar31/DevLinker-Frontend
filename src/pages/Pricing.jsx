import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { 
  Sparkles, 
  Check, 
  ArrowLeft,
  Crown,
  Zap,
  Star,
  Infinity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { createPaymentOrder, verifyPayment } from "@/services/paymentService";

let razorpayScriptPromise;
function loadRazorpayScript() {
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

const plans = [
  {
    id: "bronze",
    name: "Bronze",
    price: "Free",
    description: "Perfect for getting started",
    icon: Zap,
    color: "from-amber-600 to-amber-800",
    features: [
      "10 swipes per day",
      "Basic feed ranking",
      "5 connections per month",
      "Standard profile visibility",
      "Basic filters"
    ],
    notIncluded: [
      "Undo swipes",
      "See who liked you",
      "Advanced filters",
      "Profile boost",
      "Direct messaging"
    ]
  },
  {
    id: "silver",
    name: "Silver",
    price: "$9.99",
    period: "/month",
    description: "Most popular choice",
    icon: Star,
    color: "from-gray-400 to-gray-600",
    popular: true,
    features: [
      "Unlimited swipes",
      "Undo last swipe",
      "See who liked your profile",
      "Advanced filters",
      "20 connections per month",
      "Priority in feed",
      "Read receipts"
    ],
    notIncluded: [
      "Profile boost",
      "Unlimited connections",
      "Direct messaging without match"
    ]
  },
  {
    id: "gold",
    name: "Gold",
    price: "$19.99",
    period: "/month",
    description: "For power networkers",
    icon: Crown,
    color: "from-yellow-500 to-amber-600",
    features: [
      "Everything in Silver",
      "Unlimited connections",
      "Direct message without matching",
      "Profile boost (5x visibility)",
      "Gold badge on profile",
      "Priority support",
      "Early access to new features",
      "Advanced analytics"
    ],
    notIncluded: []
  }
];

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const [payingPlanId, setPayingPlanId] = useState(null);

  const handleUpgrade = async (plan) => {
    if (!plan?.id || plan.price === "Free") return;

    setPayingPlanId(plan.id);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load Razorpay checkout.");
        return;
      }

      const order = await createPaymentOrder(plan.id);

      const options = {
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "Devlinker",
        description: `${plan.name} membership`,
        notes: order.notes,
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_payment_id: response?.razorpay_payment_id,
              razorpay_order_id: response?.razorpay_order_id,
              razorpay_signature: response?.razorpay_signature,
            });
            toast.success("Premium activated successfully.");
          } catch (err) {
            toast.error(err?.message || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => {
            // user closed checkout
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        const msg = response?.error?.description || "Payment failed";
        toast.error(msg);
      });

      rzp.open();
    } catch (err) {
      const message = err?.message || "Failed to start payment";
      if (/unauthori|jwt|login/i.test(message)) {
        toast.error("Please login to upgrade.");
      } else {
        toast.error(message);
      }
    } finally {
      setPayingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold gradient-text">Devlinker</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link to="/feed">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to App
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 gradient-primary">Premium Plans</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Unlock Your <span className="gradient-text">Full Potential</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Choose the plan that fits your networking goals. Upgrade anytime.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className={cn(
                "text-sm",
                billingPeriod === "monthly" ? "text-foreground" : "text-muted-foreground"
              )}>
                Monthly
              </span>
              <button
                className="relative w-14 h-8 rounded-full bg-muted p-1 transition-colors"
                onClick={() => setBillingPeriod(prev => prev === "monthly" ? "yearly" : "monthly")}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full gradient-primary transition-transform",
                  billingPeriod === "yearly" && "translate-x-6"
                )} />
              </button>
              <span className={cn(
                "text-sm",
                billingPeriod === "yearly" ? "text-foreground" : "text-muted-foreground"
              )}>
                Yearly
                <Badge variant="secondary" className="ml-2 text-xs">Save 20%</Badge>
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const price = billingPeriod === "yearly" && plan.price !== "Free"
                ? `$${(parseFloat(plan.price.replace("$", "")) * 0.8 * 12).toFixed(0)}`
                : plan.price;
              const period = billingPeriod === "yearly" && plan.price !== "Free" ? "/year" : plan.period;
              
              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative p-6 rounded-2xl glass transition-all hover-lift cursor-pointer",
                    plan.popular && "border-2 border-primary",
                    selectedPlan === plan.id && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary">
                      Most Popular
                    </Badge>
                  )}

                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br",
                    plan.color
                  )}>
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>

                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">{price}</span>
                    {period && <span className="text-muted-foreground">{period}</span>}
                  </div>

                  <Button 
                    className={cn(
                      "w-full mb-6",
                      plan.id === "gold" && "gradient-primary"
                    )}
                    variant={plan.id === "gold" ? "default" : "outline"}
                    disabled={plan.price !== "Free" && payingPlanId === plan.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpgrade(plan);
                    }}
                  >
                    {plan.price === "Free"
                      ? "Current Plan"
                      : payingPlanId === plan.id
                        ? "Redirecting..."
                        : "Upgrade Now"}
                  </Button>

                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 opacity-50">
                        <div className="w-5 h-5 shrink-0 mt-0.5" />
                        <span className="text-sm line-through">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQ */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            <div className="max-w-2xl mx-auto space-y-4">
              {[
                { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time. No questions asked." },
                { q: "What payment methods do you accept?", a: "We accept all major credit cards, PayPal, and Apple Pay." },
                { q: "Is there a free trial?", a: "Yes! All paid plans come with a 7-day free trial." }
              ].map((faq, index) => (
                <div key={index} className="p-4 rounded-xl glass text-left">
                  <h3 className="font-medium mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
