import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={`prose-bangla max-w-none ${className || ""}`}>
      <ReactMarkdown
        rehypePlugins={[
          [
            rehypeSanitize,
            {
              ...defaultSchema,
              attributes: {
                ...defaultSchema.attributes,
                a: ["href", "title", "target", "rel"],
              },
            },
          ],
        ]}
        components={{
          a: ({ href, children, ...props }) => {
            const isSafe = href && !href.startsWith("javascript:") && !href.startsWith("data:");
            return (
              <a
                href={isSafe ? href : "#"}
                rel="noopener noreferrer ugc nofollow"
                target={href?.startsWith("http") ? "_blank" : undefined}
                className="text-primary underline font-medium hover:text-primary-hover transition-colors"
                {...props}
              >
                {children}
              </a>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-4 border-primary pl-4 py-1 italic bg-muted/60 rounded-r-lg font-reading">
              {children}
            </blockquote>
          ),
          h1: ({ children }) => (
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-8 mb-4 text-foreground">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-6 mb-3 text-foreground">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg sm:text-xl font-semibold mt-5 mb-2 text-foreground">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="leading-relaxed mb-4 text-foreground/90 font-reading">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1.5 my-4 text-foreground/90 font-reading">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1.5 my-4 text-foreground/90 font-reading">
              {children}
            </ol>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
