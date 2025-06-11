'use client'

import { Binary, Timer, SortAsc, Keyboard, FileText } from 'lucide-react'

import {
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'

const logicItems = [
  {
    title: 'Boolean Algebra',
    url: '/logic/boolean-algebra',
    icon: Binary,
  },
  {
    title: 'Sorting Algorithms',
    url: '/logic/sort',
    icon: SortAsc,
  },
]

const tasksItems = [
  {
    title: 'Pomodoro Timer',
    url: '/tasks/pomodoro',
    icon: Timer,
  },
  {
    title: 'Keyboard Typing',
    url: '/tasks/keyboard',
    icon: Keyboard,
  },
  {
    title: 'Markdown Preview',
    url: '/tasks/markdown',
    icon: FileText,
  },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-row items-center justify-between p-3">
        <h2 className="text-lg font-semibold transition-opacity duration-200 group-data-[collapsible=icon]:hidden">
          Science Labs
        </h2>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Tasks</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tasksItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Logic</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {logicItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}
