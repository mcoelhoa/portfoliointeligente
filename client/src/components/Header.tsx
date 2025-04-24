import { Link } from "wouter";

export default function Header() {
  return (
    <header className="relative z-10">
      <div className="container mx-auto px-4 py-6 flex justify-center items-center">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--secondary-500)] to-[var(--accent-500)] flex items-center justify-center mr-3 shadow-lg shadow-[var(--secondary-500)]/20">
            <i className="ri-brain-line text-xl text-white"></i>
          </div>
          <h1 className="text-3xl font-tech font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--secondary-400)] to-[var(--accent-400)]">
            AIGents
          </h1>
        </div>
      </div>
    </header>
  );
}
