import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const languageColors = {
  typescript: "text-blue-400",
  javascript: "text-yellow-400",
  python: "text-green-400",
  go: "text-cyan-400",
  rust: "text-orange-400",
  solidity: "text-purple-400",
  sql: "text-pink-400",
  bash: "text-gray-400",
  json: "text-amber-400",
};

export function CodeBlock({ code, language = "typescript", className }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple syntax highlighting - just the structure
  const highlightCode = (code) => {
    return code
      .replace(/(const|let|var|function|return|if|else|for|while|import|export|from|async|await|class|extends|new|this)/g, '<span class="text-purple-400">$1</span>')
      .replace(/(\(|\)|\{|\}|\[|\])/g, '<span class="text-yellow-300">$1</span>')
      .replace(/(=&gt;|=>|===|==|!==|!=|\+|-|\*|\/|%)/g, '<span class="text-cyan-400">$1</span>')
      .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="text-green-400">$1</span>')
      .replace(/(\d+)/g, '<span class="text-orange-400">$1</span>')
      .replace(/(\/\/.*$)/gm, '<span class="text-gray-500">$1</span>');
  };

  return (
    <div className={cn("relative rounded-lg overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
        <span className={cn("text-xs font-medium", languageColors[language] || "text-gray-400")}>
          {language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 px-2 text-xs text-gray-400 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className="p-4 bg-gray-950 overflow-x-auto text-sm">
        <code 
          className="font-mono text-gray-300"
          dangerouslySetInnerHTML={{ __html: highlightCode(code) }}
        />
      </pre>
    </div>
  );
}
