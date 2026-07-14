'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, ShieldCheck, Flag, FileText,
  Users2, ShoppingBag, Baby, CreditCard, DollarSign,
  Building2, BarChart2, Bell, ScrollText, Settings, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/actions/auth'

const nav = [
  { label: 'OVERVIEW', items: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { label: 'USERS', items: [
    { href: '/users', icon: Users, label: 'All Users' },
    { href: '/users/kids', icon: Baby, label: 'Kid Accounts' },
    { href: '/users/business', icon: Building2, label: 'Business & Official' },
  ]},
  { label: 'TRUST & SAFETY', items: [
    { href: '/moderation', icon: ShieldCheck, label: 'Moderation Queue' },
    { href: '/verification', icon: FileText, label: 'Verification' },
    { href: '/reports', icon: Flag, label: 'User Reports' },
  ]},
  { label: 'COMMUNITY', items: [
    { href: '/posts', icon: FileText, label: 'Posts & Feed' },
    { href: '/groups', icon: Users2, label: 'Groups' },
    { href: '/marketplace', icon: ShoppingBag, label: 'Marketplace' },
  ]},
  { label: 'MONETIZATION', items: [
    { href: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
    { href: '/payments', icon: DollarSign, label: 'Payments' },
  ]},
  { label: 'OPERATIONS', items: [
    { href: '/analytics', icon: BarChart2, label: 'Analytics' },
    { href: '/notifications', icon: Bell, label: 'Push Campaigns' },
    { href: '/audit-logs', icon: ScrollText, label: 'Audit Logs' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ]},
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 flex flex-col h-screen bg-white border-r border-gray-200 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <Image src="/logo-mark.png" alt="" width={28} height={28} className="w-7 h-7 rounded-lg shrink-0" />
          <div>
            <p className="text-gray-900 font-semibold text-sm leading-tight">NeighborUp</p>
            <p className="text-gray-500 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5">
        {nav.map(section => (
          <div key={section.label}>
            <p className="text-gray-400 text-[10px] font-semibold tracking-widest uppercase px-2 mb-1.5">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors',
                      active
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-200">
        <form action={signOut}>
          <button className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm text-gray-500 hover:text-red-600 hover:bg-gray-100 w-full transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}
