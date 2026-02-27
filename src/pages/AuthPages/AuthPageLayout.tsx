import SignInForm from "../../components/auth/SignInForm";
import GridShape from "../../components/common/GridShape";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

// Main Auth Layout Component
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative bg-white dark:bg-gray-900 min-h-screen font-sans">
      <div className="relative flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Auth Form */}
        <div className="flex items-center justify-center w-full lg:w-1/2 min-h-screen p-6 lg:p-12">
          {children}
        </div>

        {/* Right Side - Branding Panel */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-gradient-to-br from-brand-950 via-brand-900 to-purple-950 dark:from-gray-950 dark:via-brand-950 dark:to-gray-900 relative overflow-hidden min-h-screen">
          {/* Animated Background Elements */}
          <GridShape />
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

          {/* Content Container */}
          <div className="relative z-10 flex items-center justify-center w-full min-h-screen p-12">
            <div className="flex flex-col items-center w-full max-w-lg text-center">
              {/* Logo / Icon */}
              <div className="mb-12 p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:scale-105 transition-transform duration-500 group pointer-events-none">
                <svg
                  className="w-24 h-24 text-white group-hover:rotate-12 transition-transform duration-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>

              {/* Headline */}
              <h2 className="text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                Welcome to <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-purple-400">
                  Yolel System
                </span>
              </h2>
              <p className="text-gray-300 text-lg mb-12 max-w-md leading-relaxed">
                Management of products, orders, and analytics in one powerful platform.
              </p>

              {/* Feature List */}
              <div className="grid grid-cols-1 gap-4 w-full">
                {[
                  {
                    icon: (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    ),
                    title: "Advanced Analytics",
                    desc: "Gain deep insights into your business performance",
                  },
                  {
                    icon: (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    ),
                    title: "Enterprise Security",
                    desc: "Your data is protected by industry-leading security",
                  },
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-5 p-5 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:translate-x-2 group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-brand-500/30 transition-colors">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {feature.icon}
                      </svg>
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-white text-base">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-gray-400">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats Bar */}
              <div className="mt-16 pt-8 border-t border-white/10 w-full flex justify-between items-center px-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-white">10k+</div>
                  <div className="text-xs text-gray-400 uppercase tracking-widest">Users</div>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">99.9%</div>
                  <div className="text-xs text-gray-400 uppercase tracking-widest">Uptime</div>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">24/7</div>
                  <div className="text-xs text-gray-400 uppercase tracking-widest">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Toggler */}
        <div className="fixed z-50 bottom-8 right-8">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
