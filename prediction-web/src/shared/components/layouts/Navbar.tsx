import Link from "next/link";
import { getMeServer } from "@/features/user/api/getMeServer";
import { LoginButton } from "./LoginButton";

export async function Navbar() {
  const currentUser = await getMeServer();

  return (
    <nav className="md:hidden border-b bg-background sticky top-0 z-40 backdrop-blur-sm h-[64px] flex-shrink-0">
      <div className="w-full h-full px-4 py-3 flex items-center">
        <div className="w-full flex items-center justify-between">
          <Link href="/" className="text-xl md:text-2xl font-bold">
            神預測 Prediction God
          </Link>
          <div className="flex gap-2 md:gap-4 items-center">
            <Link
              href="/home"
              className="text-xs md:text-sm font-medium hover:text-primary transition-colors px-2 py-1 md:px-0 md:py-0"
            >
              <span className="hidden md:inline">市場列表</span>
              <span className="md:hidden">市場</span>
            </Link>
            {currentUser ? (
              <>
                <Link
                  href="/wallet"
                  className="text-xs md:text-sm font-medium hover:text-primary transition-colors px-2 py-1 md:px-0 md:py-0"
                >
                  錢包
                </Link>
                <Link
                  href="/profile"
                  className="text-xs md:text-sm font-medium hover:text-primary transition-colors px-2 py-1 md:px-0 md:py-0"
                >
                  {currentUser.displayName || currentUser.username}
                </Link>
              </>
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
