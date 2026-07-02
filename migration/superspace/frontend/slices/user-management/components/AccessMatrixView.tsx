/**
 * AccessMatrixView
 * 
 * Displays a matrix showing which users have access to which workspaces.
 * Visual grid representation of user→workspace access.
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Check, 
  Minus, 
  Search,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";
import type { AccessMatrix, UserInfo, WorkspaceInfo, AccessMatrixEntry } from "../types";

interface AccessMatrixViewProps {
  workspaceId: Id<"workspaces">;
  matrix: AccessMatrix | null | undefined;
  className?: string;
}

export function AccessMatrixView({
  workspaceId,
  matrix,
  className,
}: AccessMatrixViewProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<string>("all");

  // Get unique roles from matrix
  const uniqueRoles = React.useMemo(() => {
    if (!matrix) return [];
    const roles = new Set<string>();
    Object.values(matrix.matrix).forEach((userAccess) => {
      Object.values(userAccess).forEach((entry) => {
        if (entry.roleName) roles.add(entry.roleName);
      });
    });
    return Array.from(roles);
  }, [matrix]);

  // Filter users based on search and role
  const filteredUsers = React.useMemo(() => {
    if (!matrix) return [];
    return matrix.users.filter((user) => {
      // Search filter
      const matchesSearch = !searchQuery || 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Role filter
      let matchesRole = true;
      if (selectedRole !== "all") {
        const userAccess = matrix.matrix[String(user._id)];
        matchesRole = userAccess && Object.values(userAccess).some(
          (entry) => entry.roleName === selectedRole
        );
      }
      
      return matchesSearch && matchesRole;
    });
  }, [matrix, searchQuery, selectedRole]);

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (roleName?: string, level?: number): string => {
    if (!roleName) return "bg-gray-200";
    // Color based on level (lower = more power = more vibrant color)
    if (level === undefined || level <= 10) return "bg-red-500";
    if (level <= 30) return "bg-orange-500";
    if (level <= 50) return "bg-yellow-500";
    if (level <= 70) return "bg-green-500";
    return "bg-blue-400";
  };

  if (!matrix) {
    return (
      <div className={cn("flex items-center justify-center h-full text-muted-foreground", className)}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
          <p className="text-sm">Loading access matrix...</p>
        </div>
      </div>
    );
  }

  if (matrix.users.length === 0 || matrix.workspaces.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full text-muted-foreground", className)}>
        <div className="text-center">
          <Minus className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No access data available</p>
          <p className="text-xs">Add members to workspaces to see the access matrix</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full", className)}>
        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8 h-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-40 h-8">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {uniqueRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {/* Matrix grid */}
        <ScrollArea className="flex-1 border rounded-lg">
          <div className="min-w-max">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-muted z-10">
                <tr>
                  <th className="text-left p-2 font-medium text-sm border-b border-r w-48 bg-muted">
                    User
                  </th>
                  {matrix.workspaces.map((ws) => (
                    <th 
                      key={String(ws._id)} 
                      className="p-2 font-medium text-xs border-b text-center min-w-24 bg-muted"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="truncate max-w-24 cursor-help">
                            {ws.name}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>{ws.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Depth: {ws.depth} | Type: {ws.type}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const userAccess = matrix.matrix[String(user._id)] ?? {};
                  return (
                    <tr key={String(user._id)} className="hover:bg-muted/30">
                      <td className="p-2 border-b border-r">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback className="text-[10px]">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="truncate">
                            <div className="text-sm font-medium truncate">
                              {user.name ?? "Unknown"}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      {matrix.workspaces.map((ws) => {
                        const access = userAccess[String(ws._id)];
                        return (
                          <td 
                            key={String(ws._id)} 
                            className="p-2 border-b text-center"
                          >
                            {access ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex justify-center">
                                    <div 
                                      className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-white cursor-help",
                                        getRoleColor(access.roleName, access.roleLevel)
                                      )}
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="font-medium">{access.roleName}</p>
                                  {access.roleLevel !== undefined && (
                                    <p className="text-xs text-muted-foreground">
                                      Level: {access.roleLevel}
                                    </p>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <div className="flex justify-center">
                                <Minus className="w-4 h-4 text-muted-foreground/30" />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ScrollArea>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span>Role levels:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Owner (0-10)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Admin (11-30)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Manager (31-50)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Staff (51-70)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-400" />
            <span>Guest (71+)</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default AccessMatrixView;
