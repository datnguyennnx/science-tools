'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { HomeIcon, SettingsIcon, UsersIcon } from 'lucide-react'

export default function Home() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <SidebarTrigger />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Home">
                  <HomeIcon />
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Users">
                  <UsersIcon />
                  <span>Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings">
                  <SettingsIcon />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold">Welcome to the Dashboard</h1>
          <p className="mt-4">This is your main content area.</p>
        </main>
      </div>
    </SidebarProvider>
  )
}
