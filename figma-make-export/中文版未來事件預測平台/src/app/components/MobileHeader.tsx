import { Menu } from 'lucide-react';
import logoImage from 'figma:asset/cb592270b53ce2c68c88b8bd344970bda4c7ada6.png';
import gcoinImage from 'figma:asset/815824d9c86b41bb7e8aa0f765dd2b20dee5b8ab.png';

interface MobileHeaderProps {
  onMenuClick: () => void;
  isLoggedIn: boolean;
  user?: {
    totalAssets: number;
    avatar: string;
  };
}

export function MobileHeader({ onMenuClick, isLoggedIn, user }: MobileHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-20 lg:hidden">
      <div className="flex items-center justify-between h-full px-4">
        <button 
          onClick={onMenuClick}
          className="p-2 text-slate-600 hover:text-slate-800"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2">
          <img src={logoImage} alt="Logo" className="w-8 h-8" />
          <div>
            <h1 className="font-bold text-lg text-slate-800">神預測</h1>
          </div>
        </div>

        {isLoggedIn && user ? (
          <div className="flex items-center gap-2">
            <img src={gcoinImage} alt="G coin" className="w-5 h-5" />
            <span className="font-bold text-amber-600 text-sm">{user.totalAssets.toLocaleString()}</span>
          </div>
        ) : (
          <div className="w-10" />
        )}
      </div>
    </header>
  );
}
