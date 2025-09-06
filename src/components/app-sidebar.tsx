'use client'

import { Binary, Timer, Keyboard, FileText, FileJson, Link, FileDiff } from 'lucide-react'

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
import { APIKeyManager } from '@/components/apiKeyManager'

const logicItems = [
  {
    title: 'Boolean Algebra',
    url: '/logic/boolean-algebra',
    icon: Binary,
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
    title: 'URL Preview',
    url: '/tasks/url-preview',
    icon: Link,
  },
  {
    title: 'Markdown Preview',
    url: '/tasks/markdown',
    icon: FileText,
  },
  {
    title: 'JSON Formatter',
    url: '/tasks/json-formatter',
    icon: FileJson,
  },
  {
    title: 'Text Diff',
    url: '/tasks/text-diff',
    icon: FileDiff,
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
        <APIKeyManager />
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}
