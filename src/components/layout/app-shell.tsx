import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  HiOutlineViewGrid,
  HiOutlineUser,
  HiOutlineClipboardList,
  HiOutlineCollection,
  HiOutlineDocumentText,
  HiOutlineBell,
  HiOutlineCube,
  HiOutlineTemplate,
  HiOutlineShieldCheck,
  HiOutlineKey,
  // HiChevronRight,
} from "react-icons/hi";

import { cn } from "@/lib/utils";
import KoajoIcon from "../../../public/koajo.png";
import ScrollToTop from "../ui/scroll-to-top";
import Avatar from "../../../public/avatar.svg?url";
import { ChevronDown } from "lucide-react";

const navigation = [
  { label: "Dashboard", to: "/", icon: HiOutlineViewGrid },
  {
    label: "KYC Management",
    to: "/kyc-management",
    icon: HiOutlineDocumentText,
  },
  {
    label: "Users Management",
    to: "/users-management",
    icon: HiOutlineUser,
    // hasSubmenu: true,
  },
  {
    label: "Pods Management",
    to: "/pods-management",
    icon: HiOutlineCube,
  },
  {
    label: "Pod Plans",
    to: "/pod-plans-management",
    icon: HiOutlineTemplate,
  },
  {
    label: "Roles & Permissions",
    to: "/roles-management",
    icon: HiOutlineShieldCheck,
  },
  {
    label: "Admin Access",
    to: "/admin-access",
    icon: HiOutlineKey,
  },
  {
    label: "Groups Management",
    to: "/groups-management",
    icon: HiOutlineCollection,
  },
  { label: "Notifications", to: "/notifications", icon: HiOutlineBell },
  {
    label: "Contributions & Allocations",
    to: "/contributions-and-allocations",
    icon: HiOutlineClipboardList,
  },
  // { label: "Mail", to: "/mail", icon: HiOutlineMail, badge: "" },
  // { label: "Chat", to: "/chat", icon: HiOutlineChat },
  // { label: "File Manager", to: "/files", icon: HiOutlineFolder },
  // { label: "Contacts", to: "/contacts", icon: HiOutlineUsers },
];

export function AppShell() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <ScrollToTop smooth={true} />
      {/* Fixed sidebar (md+) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-sidebar md:flex">
        <div className="flex h-full w-full flex-col overflow-y-auto">
          {/* Logo section */}
          <div className="p-6">
            <img src={KoajoIcon} alt="Koajo" className="h-8" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 pb-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"} // exact match for home route
                    className={({ isActive }) =>
                      cn(
                        "group relative flex h-[56px] items-center justify-between px-3 py-3 text-sm font-[300] transition-colors",
                        isActive
                          ? "bg-[#161625] text-white"
                          : "text-[#9C9DAF] hover:bg-white/5 hover:text-white",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Orange left border for active state */}
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff8c42]" />
                        )}

                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span>{item.label}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* {item.badge && (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                              {item.badge}
                            </span>
                          )} */}
                          {/* {item.hasSubmenu && (
                            <HiChevronRight className="h-4 w-4 text-gray-500" />
                          )} */}
                        </div>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>

      {/* Fixed header (shifts right on md to clear sidebar) */}
      <header
        className={cn(
          "fixed top-0 right-0 left-0 z-30 border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/70",
          "flex h-[66px] items-center justify-between px-6",
          "md:left-64",
        )}
      >
        <div className="flex items-center gap-3 md:hidden">
          <span className="text-lg font-semibold tracking-tight">Koajo</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div
            onClick={() => void navigate("/profile")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img src={Avatar} alt="User Avatar" />
            <div className="flex items-center gap-2 ">
              <p className="text-sm font-medium">admin@koajo.com</p>
              <ChevronDown className="h-3 w-3 text-gray-500" />
            </div>
          </div>
        </div>
      </header>

      {/* Scrollable content area (accounts for fixed header + sidebar) */}
      <main
        className={cn(
          "pt-[66px]", // space under fixed header
          "md:pl-64", // space beside fixed sidebar
        )}
      >
        <div
          className={cn(
            "h-[calc(100vh-66px)] overflow-y-auto", // only content scrolls
            "bg-[#F8F8F8] px-6 py-8",
          )}
        >
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
