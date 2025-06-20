'use client';

import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { BookOpenIcon, BarChartIcon, MenuIcon, XIcon } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import './Layout.css';

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <SidebarProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden relative">
        <div className="h-[50px] w-full bg-[#2E2E30] flex items-center px-4">
          <div className="sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-white"
            >
              <MenuIcon className="h-6 w-6 cursor-pointer" />
            </button>
          </div>

          <div className="hidden sm:flex w-full items-center">
            <h1 className="text-white font-semibold text-lg">Admin Panel</h1>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            className="sm:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            collapsible="offcanvas"
            className="bg-[#2E2E30] text-white border-none hidden sm:block"
          >
            <SidebarContent className="pl-5 pr-5">
              <SidebarMenu className="gap-3 m-0">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-white/10 transition-colors duration-200 rounded-md px-2 py-1.5"
                  ></SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                <img src="/startupticker_ch_logo.jpeg" alt="Logo" className="h-20 w-20 mt-3 mx-1" />
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider admin-panel-sidebar mb-2 px-2">
                    Categories
                  </h3>
                  <div className="flex flex-col gap-1">
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-white/10 transition-colors duration-200 rounded-md px-2 py-1.5"
                    >
                      <a href="/ai-analyzer">
                        <BarChartIcon className="h-4 w-4" />
                        AI-Analyze
                      </a>
                    </SidebarMenuButton>
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-white/10 transition-colors duration-200 rounded-md px-2 py-1.5"
                    >
                      <a href="/">
                        <BookOpenIcon className="h-4 w-4" />
                        Deals Dashboard
                      </a>
                    </SidebarMenuButton>
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-white/10 transition-colors duration-200 rounded-md px-2 py-1.5"
                    >
                      <a href="/download">
                        <BookOpenIcon className="h-4 w-4" />
                        Download Data
                      </a>
                    </SidebarMenuButton>
                  </div>
                </SidebarMenuItem>
                <SidebarMenuItem>

                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider admin-panel-sidebar mb-2 px-2">
                    Admin Panel
                  </h3>
                  <div className="flex flex-col gap-1">
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-white/10 transition-colors duration-200 rounded-md px-2 py-1.5"
                    >
                      <a href="/metadata-statistics">
                        <BookOpenIcon className="h-4 w-4" />
                        Metadata Statistics
                      </a>
                    </SidebarMenuButton>
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>

          <div
            className={`sm:hidden fixed inset-0 z-40 transition-transform duration-300 ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="absolute left-0 top-0 h-full w-64 bg-[#2E2E30] text-white z-50 p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Menu</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white cursor-pointer"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mt-4 mb-2 px-2">
                  Categories
                </h3>
                <a
                    href="/ai-analyzer"
                    className="flex items-center gap-3 hover:bg-white/10 transition-colors duration-200 rounded-md px-2 py-1.5"
                    onClick={() => setMobileMenuOpen(false)}
                >
                  <BarChartIcon className="h-4 w-4"/>
                  AI-Analyze
                </a>
                <a
                  href="/"
                  className="flex items-center gap-3 hover:bg-white/10 transition-colors duration-200 rounded-md px-2 py-1.5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BookOpenIcon className="h-4 w-4" />
                  Deals Dashboard
                </a>
                <a
                  href="/"
                  className="flex items-center gap-3 hover:bg-white/10 transition-colors duration-200 rounded-md px-2 py-1.5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BookOpenIcon className="h-4 w-4" />
                  Download Table
                </a>
                <img src="/startupticker_ch_logo.jpeg" alt="Logo" className="h-12 w-12 mt-3 mx-1" />
              </div>
            </div>
          </div>

          <main className="flex-1 p-0 overflow-auto z-10 relative">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
