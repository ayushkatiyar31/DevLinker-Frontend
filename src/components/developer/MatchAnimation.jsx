import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, X } from "lucide-react";
import { resolveBackendAssetUrl } from "@/lib/apiClient";

export function MatchAnimation({ developer, onClose, onMessage }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 text-center animate-bounce-in">
        <Button variant="ghost" size="icon" className="absolute -top-12 right-0" onClick={onClose}><X className="w-6 h-6" /></Button>
        <div className="relative mb-8"><Sparkles className="w-20 h-20 mx-auto text-primary animate-glow" /></div>
        <h1 className="text-4xl font-bold mb-4 gradient-text">It's a Match!</h1>
        <p className="text-muted-foreground mb-8">You and {developer?.name} have liked each other</p>
        <div className="flex justify-center items-center gap-4 mb-8">
          <div className="w-24 h-24 rounded-full border-4 border-primary overflow-hidden animate-float">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=me`} alt="You" className="w-full h-full object-cover" />
          </div>
          <div className="text-4xl">💜</div>
          <div className="w-24 h-24 rounded-full border-4 border-primary overflow-hidden animate-float" style={{ animationDelay: "0.5s" }}>
            <img src={resolveBackendAssetUrl(developer?.avatar_url) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${developer?.id}`} alt={developer?.name} className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" size="lg" onClick={onClose}>Keep Swiping</Button>
          <Button size="lg" className="gradient-primary gap-2" onClick={onMessage}><MessageCircle className="w-5 h-5" />Send Message</Button>
        </div>
      </div>
    </div>
  );
}
