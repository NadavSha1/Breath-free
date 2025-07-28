
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Home, Trophy, Heart, BarChart3 } from "lucide-react";
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    showPopup: showCoffeePopup,
    trackInteraction,
    handleBuyMeCoffee,
    handleMaybeLater,
    handleNeverAsk
  } = useCoffeeSupport();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        if (!currentUser.onboarding_completed && currentPageName !== "Onboarding") {
          navigate(createPageUrl("Onboarding"));
        }
      } catch (error) {
        console.error('User not authenticated');
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, [currentPageName, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (currentPageName === "Onboarding") {
    return <main>{children}</main>;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans" onClick={trackInteraction}>
      <div className="pb-24">
        <main>{children}</main>
      </div>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-md z-50">
        <div className="flex justify-around items-center h-20 max-w-xl mx-auto px-4">
          {navigationItems.map((item) => {
            const isActive = location.pathname.includes(item.href);
            const NavIcon = item.icon;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.href)}
                className={`flex flex-col items-center justify-center text-sm transition-colors ${
                  isActive ? "text-blue-600" : "text-gray-500 hover:text-blue-500"
                }`}
              >
                <NavIcon className="w-6 h-6 mb-1" />
                <span>{item.name}</span>
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
