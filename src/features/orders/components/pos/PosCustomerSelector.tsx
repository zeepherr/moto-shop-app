"use client";

import React, { useState, useEffect } from "react";
import { Search, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePosStore } from "../../stores/usePosStore";
import { searchMembersAction } from "@/features/users/actions/user.actions";
import type { SelectedMember } from "../../types";

export const PosCustomerSelector: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<SelectedMember[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const selectedMember = usePosStore((store) => store.selectedMember);
  const setSelectedMember = usePosStore((store) => store.setSelectedMember);

  useEffect(() => {
    const term = searchTerm.trim();
    if (term.length < 3) {
      setMembers([]);
      return;
    }

    const handler = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchMembersAction(term);
        if (res.success && res.data) {
          setMembers(res.data);
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleSelect = (member: SelectedMember) => {
    setSelectedMember(member);
    setSearchTerm("");
    setMembers([]);
  };

  const handleClear = () => {
    setSelectedMember(null);
    setSearchTerm("");
    setMembers([]);
  };

  return (
    <div className="border-b border-border/60 p-2.5 lg:p-3">
      {selectedMember ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <UserRound className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Customer</p>
              <p className="truncate text-sm font-medium text-foreground">
                {selectedMember.firstName} {selectedMember.lastName}
              </p>
              {selectedMember.phone && (
                <p className="truncate text-xs text-muted-foreground">
                  {selectedMember.phone}
                </p>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="size-8 p-0 cursor-pointer"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">Customer</p>
            <p className="text-sm font-medium text-foreground">Guest customer</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by phone, email, or name..."
              className="h-8 pl-9 text-xs"
            />
          </div>

          {searchTerm.trim().length >= 3 && (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-lg">
              {isSearching ? (
                <p className="px-3 py-2 text-xs text-muted-foreground">Searching members...</p>
              ) : members.length > 0 ? (
                members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleSelect(member)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-muted cursor-pointer transition-colors border-b border-border/40 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {member.phone || member.email}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-xs text-muted-foreground">No members found</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
