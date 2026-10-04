"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { SelectedMember } from "../../types";

interface PosMemberSearchProps {
  searchTerm: string;
  members: SelectedMember[];
  isSearching: boolean;
  isLoadingMember: boolean;
  onSearchTermChange: (value: string) => void;
  onSelect: (member: SelectedMember) => void;
}

export function PosMemberSearch({ searchTerm, members, isSearching, isLoadingMember, onSearchTermChange, onSelect }: PosMemberSearchProps) {
  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder="Search by phone, email, or name..."
          disabled={isLoadingMember}
          className="h-11 pl-9 text-sm"
        />
      </div>
      {searchTerm.trim().length >= 3 && (
        <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-lg">
          {isLoadingMember ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">Loading customer and vehicles...</p>
          ) : isSearching ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">Searching members...</p>
          ) : members.length ? (
            members.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => onSelect(member)}
                className="flex w-full items-center justify-between gap-3 border-b border-border/40 px-3 py-2 text-left transition-colors last:border-b-0 hover:bg-muted"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{member.firstName} {member.lastName}</span>
                  <span className="block truncate text-xs text-muted-foreground">{member.phone || member.email}</span>
                </span>
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-xs text-muted-foreground">No members found</p>
          )}
        </div>
      )}
    </>
  );
}
