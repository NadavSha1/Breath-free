
import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Home, Trophy, Heart, BarChart3 } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import useCoffeeSupport from "./components/support/useCoffeeSupport";
import CoffeeSupportPopup from "./components/support/CoffeeSupportPopup";

const navigationItems = [
  { name: "Home", href: "Home", icon: Home },
  { name: "Stats", href: "Stats", icon: BarChart3 },
  { name: "Beat Craving", href: "BeatCraving", icon: Heart },
  { name: "Awards", href: "Awards", icon: Trophy },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const {
    showPopup: showCoffeePopup,
    trackInteraction,
    handleBuyMeCoffee,
    handleMaybeLater,
    handleNeverAsk
  } = useCoffeeSupport();

  const checkUser = useCallback(async () => {
    try {
      const currentUser = await User.me();
      if (!currentUser.onboarding_completed && currentPageName !== "Onboarding") {
        navigate(createPageUrl("Onboarding"));
      }
    } catch (error) {
      console.error('User not authenticated:', error);
      // Handle authentication error if needed
    } finally {
      setLoading(false);
    }
  }, [currentPageName, navigate]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading your journey..." />;
  }

  if (currentPageName === "Onboarding") {
    return <main className="min-h-screen bg-gray-50">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans" onClick={trackInteraction}>
      <div className="pb-24">
        <main>{children}</main>
      </div>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-md z-50 no-print">
        <div className="flex justify-around items-center h-20 max-w-xl mx-auto px-4">
          {navigationItems.map((item) => {
            const isActive = location.pathname.includes(item.href);
            const NavIcon = item.icon;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.href)}
                className={`flex flex-col items-center justify-center text-sm transition-colors p-2 rounded-lg ${
                  isActive 
                    ? "text-blue-600 bg-blue-50" 
                    : "text-gray-500 hover:text-blue-500 hover:bg-gray-50"
                }`}
                aria-label={`Navigate to ${item.name}`}
              >
                <NavIcon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <CoffeeSupportPopup 
        isOpen={showCoffeePopup}
        onBuyMeCoffee={handleBuyMeCoffee}
        onMaybeLater={handleMaybeLater}
        onNeverAsk={handleNeverAsk}
      />
    </div>
  );
}
