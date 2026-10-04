"use client";

import React, { useState, useEffect } from "react";
import { UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePosStore } from "../../stores/usePosStore";
import { PosMemberSearch } from "./PosMemberSearch";
import { PosVehicleSelector } from "./PosVehicleSelector";
import { getMemberByIdAction, searchMembersAction } from "@/features/users/actions/user.actions";
import type { SelectedMember } from "../../types";

export const PosCustomerSelector: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<SelectedMember[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMember, setIsLoadingMember] = useState(false);

  const selectedMember = usePosStore((store) => store.selectedMember);
  const selectedMotorId = usePosStore((store) => store.selectedMotorId);
  const setSelectedMember = usePosStore((store) => store.setSelectedMember);
  const setSelectedMotorId = usePosStore((store) => store.setSelectedMotorId);

  useEffect(() => {
    const term = searchTerm.trim();
    if (term.length < 3) return;

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

  const handleSelect = async (member: SelectedMember) => {
    setIsLoadingMember(true);
    try {
      const result = await getMemberByIdAction(member.id);
      if (!result.success || !("data" in result) || !result.data) {
        toast.error(result.error || "Unable to load customer vehicles.");
        return;
      }
      setSelectedMember(result.data);
      setSearchTerm("");
      setMembers([]);
    } catch {
      toast.error("Unable to load customer vehicles.");
    } finally {
      setIsLoadingMember(false);
    }
  };

  const handleClear = () => {
    setSelectedMember(null);
    setSelectedMotorId(null);
    setSearchTerm("");
    setMembers([]);
  };

  return (
    <div className="border-b border-border/60 p-3 sm:p-3.5 lg:p-3">
      {selectedMember ? (
        <div className="space-y-2">
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
            aria-label="Clear selected customer"
            className="size-11 shrink-0 p-0 cursor-pointer"
          >
            <X className="size-4" />
          </Button>
        </div>
        <PosVehicleSelector
          vehicles={selectedMember.vehicles ?? []}
          selectedMotorId={selectedMotorId}
          onVehicleChange={setSelectedMotorId}
        />
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">Customer</p>
            <p className="text-sm font-medium text-foreground">Guest customer</p>
          </div>

          <PosMemberSearch
            searchTerm={searchTerm}
            members={members}
            isSearching={isSearching}
            isLoadingMember={isLoadingMember}
            onSearchTermChange={(value) => { setSearchTerm(value); setMembers([]); }}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  );
};
