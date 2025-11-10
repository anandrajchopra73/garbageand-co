"use client"
import Image from "next/image"

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5 animate-gradient"></div>
      
      <div className="flex flex-col items-center space-y-6 relative z-10">
        <div className="relative">
          {/* Outer rotating ring */}
          <div className="absolute -inset-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          
          {/* Middle rotating ring (opposite direction) */}
          <div className="absolute -inset-6 rounded-full border-4 border-primary/30 border-b-primary animate-spin-reverse"></div>
          
          {/* Inner pulsing glow */}
          <div className="absolute inset-0 animate-ping opacity-30">
            <div className="w-20 h-20 rounded-full bg-primary/50"></div>
          </div>
          
          {/* Logo with scale animation */}
          <div className="relative animate-scale-pulse">
            <Image 
              src="/logo-old.png" 
              alt="SmartBinX" 
              width={80} 
              height={80} 
              className="h-20 w-20 drop-shadow-2xl"
              priority
            />
          </div>
        </div>
        
        {/* Loading text with fade animation */}
        <div className="text-center space-y-2 animate-fade-in">
          <p className="text-lg font-semibold text-foreground">Loading SmartBinX</p>
          <div className="flex items-center justify-center space-x-1.5">
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        
        @keyframes scale-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gradient {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }
        
        .animate-scale-pulse {
          animation: scale-pulse 2s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-gradient {
          animation: gradient 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}