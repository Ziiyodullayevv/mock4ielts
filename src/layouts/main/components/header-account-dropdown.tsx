'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/src/components/ui/avatar';
import { Globe, Settings, BadgePlus, CircleHelp, MessageCircleMore } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuSub,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/src/components/ui/dropdown-menu';

export function HeaderAccountDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-10">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback className="bg-white text-black">A</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[300px] rounded-xl border-none bg-[#141414] p-4 text-sm text-white shadow-[0_24px_44px_rgba(0,0,0,0.45)]"
      >
        <DropdownMenuItem className="h-11 rounded-xl px-3 text-sm font-medium text-white/95 focus:bg-white/8 focus:text-white">
          <Settings className="size-5 text-white/90" />
          Account Settings
        </DropdownMenuItem>

        <DropdownMenuItem className="h-11 rounded-xl px-3 text-sm font-medium text-white/95 focus:bg-white/8 focus:text-white">
          <BadgePlus className="size-5 text-white/90" />
          My Subscription
        </DropdownMenuItem>

        <DropdownMenuItem className="h-11 rounded-xl px-3 text-sm font-medium text-white/95 focus:bg-white/8 focus:text-white">
          <CircleHelp className="size-5 text-white/90" />
          Help Center
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="h-11 rounded-xl px-3 text-sm font-medium text-white/95 focus:bg-white/8 focus:text-white data-[state=open]:bg-white/8 data-[state=open]:text-white [&_svg]:text-white/90">
            <Globe className="size-5" />
            Language
          </DropdownMenuSubTrigger>

          <DropdownMenuSubContent className="min-w-[170px] rounded-xl border-none bg-[#141414] p-2 text-sm text-white shadow-[0_16px_30px_rgba(0,0,0,0.4)]">
            <DropdownMenuItem className="h-10 rounded-xl px-3 text-sm text-white/90 focus:bg-white/8 focus:text-white">
              English
            </DropdownMenuItem>
            <DropdownMenuItem className="h-10 rounded-xl px-3 text-sm text-white/90 focus:bg-white/8 focus:text-white">
              Uzbek
            </DropdownMenuItem>
            <DropdownMenuItem className="h-10 rounded-xl px-3 text-sm text-white/90 focus:bg-white/8 focus:text-white">
              Russian
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem className="h-11 rounded-xl px-3 text-sm font-medium text-white/95 focus:bg-white/8 focus:text-white">
          <MessageCircleMore className="size-5 text-white/90" />
          Connect on Discord
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2 bg-white/10" />

        <DropdownMenuItem className="h-11 rounded-xl px-3 text-sm font-medium text-white/65 focus:bg-white/8 focus:text-white">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
