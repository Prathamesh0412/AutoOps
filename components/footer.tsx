"use client"

import Link from "next/link"
import { Zap, MessageSquare, Users, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NoSSR } from "@/components/no-ssr"

export function Footer() {
  return (
    <NoSSR>
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4 animate-fade-in-up">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary animate-scale-in overflow-hidden">
                  <img 
                    src="/logo.png" 
                    alt="AutoOps AI Logo" 
                    className="size-6 object-contain bg-black p-0.5"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) {
                        target.style.display = 'none';
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                  <Zap className="size-5 text-primary-foreground hidden" />
                </div>
                <span className="text-lg font-bold">AutoOps AI</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-50">
                Transform your business with AI-powered automation and intelligent workflows.
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="animate-fade-in-up animate-stagger-1">
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="animate-fade-in-up animate-stagger-2">
                  <Users className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="animate-fade-in-up animate-stagger-3">
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4 animate-fade-in-up animate-stagger-1">
              <h3 className="text-sm font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/dashboard" className="hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/actions" className="hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                    Actions
                  </Link>
                </li>
                <li>
                  <Link href="/insights" className="hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                    Insights
                  </Link>
                </li>
                <li>
                  <Link href="/workflows" className="hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                    Workflows
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4 animate-fade-in-up animate-stagger-2">
              <h3 className="text-sm font-semibold">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4 animate-fade-in-up animate-stagger-3">
              <h3 className="text-sm font-semibold">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 animate-fade-in-up animate-stagger-4">
              <p className="text-sm text-muted-foreground">
                &copy; 2026 AutoOps AI. All rights reserved.
              </p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <Link href="#" className="hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="#" className="hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                  Terms of Service
                </Link>
                <Link href="#" className="hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </NoSSR>
  )
}
