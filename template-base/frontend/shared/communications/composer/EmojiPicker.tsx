/**
 * Shared Emoji Picker Component
 * Reusable emoji picker for message composition
 * @module shared/communications/composer
 */

"use client"

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Clock, 
  Smile, 
  Heart,
  Leaf,
  Pizza,
  Activity,
  Plane,
  Lightbulb,
  Flag 
} from "lucide-react";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose?: () => void;
  recentEmojis?: string[];
}

const DEFAULT_RECENT_EMOJIS = [
  "😃", "🙏", "🥶", "😭", "👍", "💩", "💧", "😌", "🤔", "😍", "😇", 
  "😊", "🤩", "🔥", "😕", "🤭", "😉", "😜", "🥰", "😚", "🤑", "😱"
];

const EMOJI_CATEGORIES = {
  smileys: {
    label: "Smileys & People",
    icon: Smile,
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "🥹", "😅", "😂", "🤣", "🥲", "☺️",
      "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙",
      "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸",
      "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
      "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯",
      "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭"
    ]
  },
  animals: {
    label: "Animals & Nature", 
    icon: Leaf,
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨", "🐯",
      "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔",
      "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗"
    ]
  },
  food: {
    label: "Food & Drink",
    icon: Pizza,
    emojis: [
      "🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑",
      "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️",
      "🍕", "🍔", "🍟", "🌭", "🥪", "🌮", "🌯", "🥗", "🍣", "🍱", "🍛"
    ]
  },
  activities: {
    label: "Activities",
    icon: Activity,
    emojis: [
      "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀",
      "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳", "🪁", "🏹",
      "🎮", "🎯", "🎲", "🧩", "🎭", "🎨", "🎪", "🎤", "🎧", "🎼", "🎹"
    ]
  },
  travel: {
    label: "Travel & Places",
    icon: Plane,
    emojis: [
      "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻",
      "🚚", "🚛", "🚜", "🏍️", "🛵", "🚲", "🛴", "🛹", "🛼", "🚁", "✈️",
      "🏠", "🏢", "🏣", "🏤", "🏥", "🏦", "🏨", "🏩", "🏪", "🏫", "🏬"
    ]
  },
  objects: {
    label: "Objects",
    icon: Lightbulb,
    emojis: [
      "⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "🕹️", "🗜️",
      "💽", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥", "📽️", "🎞️",
      "📞", "☎️", "📟", "📠", "📺", "📻", "🎙️", "🎚️", "🎛️", "🧭", "⏱️"
    ]
  },
  symbols: {
    label: "Symbols",
    icon: Heart,
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️",
      "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️", "✝️", "☪️",
      "✅", "❌", "❓", "❗", "💯", "🔥", "✨", "⭐", "🌟", "💫", "🎉"
    ]
  },
  flags: {
    label: "Flags",
    icon: Flag,
    emojis: [
      "🏁", "🚩", "🎌", "🏴", "🏳️", "🏳️‍🌈", "🏳️‍⚧️", "🏴‍☠️",
      "🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇯🇵", "🇰🇷", "🇨🇳", "🇮🇳",
      "🇩🇪", "🇫🇷", "🇮🇹", "🇪🇸", "🇧🇷", "🇲🇽", "🇮🇩", "🇹🇭"
    ]
  }
};

export function EmojiPicker({ 
  onEmojiSelect, 
  onClose,
  recentEmojis = DEFAULT_RECENT_EMOJIS 
}: EmojiPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("recent");

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    // Don't auto-close, let user pick multiple if they want
  };

  const filteredEmojis = searchQuery
    ? Object.values(EMOJI_CATEGORIES)
        .flatMap(cat => cat.emojis)
        .filter(emoji => emoji.includes(searchQuery))
    : null;

  return (
    <div className="w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
      {/* Search Bar */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emojis..."
            className="pl-9 bg-muted/50 border-none"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="w-full justify-evenly gap-0 h-10 bg-transparent border-b border-border rounded-none px-2">
          <TabsTrigger 
            value="recent" 
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3"
          >
            <Clock className="h-4 w-4" />
          </TabsTrigger>
          {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
            <TabsTrigger 
              key={key}
              value={key}
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3"
            >
              <category.icon className="h-4 w-4" />
            </TabsTrigger>
          ))}
        </TabsList>

        <ScrollArea className="h-64">
          {/* Search Results */}
          {filteredEmojis ? (
            <div className="p-3">
              <div className="text-xs text-muted-foreground mb-2">
                Search Results ({filteredEmojis.length})
              </div>
              <div className="grid grid-cols-8 gap-1">
                {filteredEmojis.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-2xl p-1 hover:bg-muted rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Recent */}
              <TabsContent value="recent" className="p-3 m-0">
                <div className="text-xs text-muted-foreground mb-2">Recently Used</div>
                <div className="grid grid-cols-8 gap-1">
                  {recentEmojis.map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-2xl p-1 hover:bg-muted rounded transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </TabsContent>

              {/* Category Emoji Grids */}
              {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
                <TabsContent key={key} value={key} className="p-3 m-0">
                  <div className="text-xs text-muted-foreground mb-2">{category.label}</div>
                  <div className="grid grid-cols-8 gap-1">
                    {category.emojis.map((emoji, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleEmojiClick(emoji)}
                        className="text-2xl p-1 hover:bg-muted rounded transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </>
          )}
        </ScrollArea>
      </Tabs>
    </div>
  );
}

export default EmojiPicker;
