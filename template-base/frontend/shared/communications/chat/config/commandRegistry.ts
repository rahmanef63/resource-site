/**
 * Command registry for slash commands
 * @module shared/chat/config/commandRegistry
 */

import type { CommandDefinition } from "../types/events";
import { SYSTEM_COMMANDS } from "../constants/chat";

/**
 * Built-in system commands
 */
export const BUILT_IN_COMMANDS: Record<string, CommandDefinition> = {
  help: {
    name: SYSTEM_COMMANDS.HELP,
    description: "Show available commands",
    usage: "/help [command]",
    handler: async (args) => {
      // TODO: Implement help display
    },
  },

  me: {
    name: SYSTEM_COMMANDS.ME,
    description: "Send message as action (e.g., /me is happy)",
    usage: "/me <action>",
    handler: async (args) => {
      // TODO: Format as action message
    },
  },

  gpt: {
    name: SYSTEM_COMMANDS.GPT,
    description: "Ask AI assistant",
    usage: "/gpt <question>",
    handler: async (args) => {
      // TODO: Integrate with AI
    },
    permissions: ["send"],
  },

  assign: {
    name: SYSTEM_COMMANDS.ASSIGN,
    description: "Assign task to user",
    usage: "/assign @user <task>",
    handler: async (args) => {
      // TODO: Parse user and create assignment
    },
    permissions: ["manageUsers"],
  },

  rename: {
    name: SYSTEM_COMMANDS.RENAME,
    description: "Rename chat room",
    usage: "/rename <new name>",
    handler: async (args) => {
      // TODO: Update room name
    },
    permissions: ["rename"],
  },

  topic: {
    name: SYSTEM_COMMANDS.TOPIC,
    description: "Set chat topic/description",
    usage: "/topic <description>",
    handler: async (args) => {
      // TODO: Update room topic
    },
    permissions: ["rename"],
  },

  export: {
    name: SYSTEM_COMMANDS.EXPORT,
    description: "Export chat history",
    usage: "/export [format]",
    handler: async (args) => {
      // TODO: Export chat
      const format = args[0] || "json";
    },
    permissions: ["send"],
  },

  invite: {
    name: SYSTEM_COMMANDS.INVITE,
    description: "Generate invite link",
    usage: "/invite",
    handler: async (args) => {
      // TODO: Generate invite link
    },
    permissions: ["manageUsers"],
  },

  leave: {
    name: SYSTEM_COMMANDS.LEAVE,
    description: "Leave chat room",
    usage: "/leave",
    handler: async (args) => {
      // TODO: Remove self from room
    },
    permissions: ["send"],
  },

  mute: {
    name: SYSTEM_COMMANDS.MUTE,
    description: "Mute notifications for this chat",
    usage: "/mute [duration]",
    handler: async (args) => {
      // TODO: Mute notifications
    },
    permissions: ["send"],
  },

  unmute: {
    name: SYSTEM_COMMANDS.UNMUTE,
    description: "Unmute notifications",
    usage: "/unmute",
    handler: async (args) => {
      // TODO: Unmute notifications
    },
    permissions: ["send"],
  },
};

/**
 * Command registry class
 */
export class CommandRegistry {
  private commands: Map<string, CommandDefinition>;

  constructor() {
    this.commands = new Map(
      Object.entries(BUILT_IN_COMMANDS).map(([key, cmd]) => [cmd.name, cmd])
    );
  }

  /**
   * Register a custom command
   */
  register(command: CommandDefinition): void {
    this.commands.set(command.name, command);
  }

  /**
   * Unregister a command
   */
  unregister(name: string): void {
    this.commands.delete(name);
  }

  /**
   * Get command by name
   */
  get(name: string): CommandDefinition | undefined {
    return this.commands.get(name);
  }

  /**
   * Get all commands
   */
  getAll(): CommandDefinition[] {
    return Array.from(this.commands.values());
  }

  /**
   * Check if command exists
   */
  has(name: string): boolean {
    return this.commands.has(name);
  }

  /**
   * Parse and execute command from message text
   */
  async execute(
    text: string,
    userPermissions: string[] = []
  ): Promise<boolean> {
    if (!text.startsWith("/")) return false;

    const parts = text.slice(1).split(/\s+/);
    const commandName = `/${parts[0]}`;
    const args = parts.slice(1);

    const command = this.get(commandName);
    if (!command) {
      console.warn(`Unknown command: ${commandName}`);
      return false;
    }

    // Check permissions
    if (command.permissions && command.permissions.length > 0) {
      const hasPermission = command.permissions.some((p) =>
        userPermissions.includes(p)
      );
      if (!hasPermission) {
        console.error(`Permission denied for command: ${commandName}`);
        return false;
      }
    }

    // Execute
    try {
      await command.handler(args);
      return true;
    } catch (error) {
      console.error(`Command execution failed:`, error);
      return false;
    }
  }

  /**
   * Get command suggestions for autocomplete
   */
  getSuggestions(partial: string): CommandDefinition[] {
    if (!partial.startsWith("/")) return [];

    const query = partial.toLowerCase();
    return this.getAll().filter((cmd) => cmd.name.toLowerCase().startsWith(query));
  }
}

/**
 * Global command registry instance
 */
export const commandRegistry = new CommandRegistry();
