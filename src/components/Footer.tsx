import { Leaf, Droplets, Globe } from "lucide-react";

export default function Footer({
  theme,
}: {
  theme?: { id: string; name: string; primary: string; secondary: string };
}) {
  return (
    <footer
      className="text-white py-12 border-t"
      style={{
        backgroundColor: "#1a1a1a",
        borderColor: theme?.primary,
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h2
              className="font-display text-2xl font-bold bg-clip-text bg-gradient-to-r text-transparent font-bold mb-2"
              style={{
                backgroundImage: `linear-gradient(to right, ${theme?.primary}, ${theme?.secondary})`,
              }}
            >
              ChemImpact
            </h2>
            <p className="text-gray-400 text-sm max-w-xs">
              Platform pembelajaran Green Chemistry berbasis Education for
              Sustainable Development (ESD).
            </p>
          </div>

          <div className="flex gap-6">
            <div className="flex flex-col items-center gap-2 text-gray-400 hover:text-green-400 transition-colors">
              <Leaf size={24} />
              <span className="text-xs">Eco-Friendly</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
              <Droplets size={24} />
              <span className="text-xs">Clean Water</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors">
              <Globe size={24} />
              <span className="text-xs">Sustainability</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>
            &copy; {new Date().getFullYear()} ChemImpact. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
