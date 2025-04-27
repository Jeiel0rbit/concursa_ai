'use client';

import * as React from "react";
import { MapPin } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils"; // Import cn utility

interface StateSelectorProps {
  selectedState: string;
  onStateChange: (state: string) => void;
}

const states = [
  { value: "ac", label: "Acre (AC)" },
  { value: "al", label: "Alagoas (AL)" },
  { value: "am", label: "Amazonas (AM)" },
  { value: "ap", label: "Amapá (AP)" },
  { value: "ba", label: "Bahia (BA)" },
  { value: "ce", label: "Ceará (CE)" },
  { value: "df", label: "Distrito Federal (DF)" },
  { value: "es", label: "Espírito Santo (ES)" },
  { value: "go", label: "Goiás (GO)" },
  { value: "ma", label: "Maranhão (MA)" },
  { value: "mg", label: "Minas Gerais (MG)" },
  { value: "ms", label: "Mato Grosso do Sul (MS)" },
  { value: "mt", label: "Mato Grosso (MT)" },
  { value: "pa", label: "Pará (PA)" },
  { value: "pb", label: "Paraíba (PB)" },
  { value: "pe", label: "Pernambuco (PE)" },
  { value: "pi", label: "Piauí (PI)" },
  { value: "pr", label: "Paraná (PR)" },
  { value: "rj", label: "Rio de Janeiro (RJ)" },
  { value: "rn", label: "Rio Grande do Norte (RN)" },
  { value: "ro", label: "Rondônia (RO)" },
  { value: "rr", label: "Roraima (RR)" },
  { value: "rs", label: "Rio Grande do Sul (RS)" },
  { value: "sc", label: "Santa Catarina (SC)" },
  { value: "se", label: "Sergipe (SE)" },
  { value: "sp", label: "São Paulo (SP)" },
  { value: "to", label: "Tocantins (TO)" },
];

const StateSelector: React.FC<StateSelectorProps> = ({ selectedState, onStateChange }) => {
  return (
    <Select onValueChange={onStateChange} value={selectedState}>
      <SelectTrigger className={cn(
        "w-full sm:w-[280px] h-12 text-base rounded-lg border-primary focus:ring-primary focus:border-primary transition duration-200", // Base styles
        "bg-card text-foreground" // Colors from theme
      )}>
        <MapPin className="mr-2 h-5 w-5 text-primary" /> {/* Icon with theme color */}
        <SelectValue placeholder="Selecione um estado..." />
      </SelectTrigger>
      <SelectContent className="bg-card border-secondary rounded-lg shadow-lg"> {/* Styled dropdown */}
        {states.map((state) => (
          <SelectItem
            key={state.value}
            value={state.value}
            className="cursor-pointer hover:bg-secondary focus:bg-secondary rounded-md" // Hover/focus styles
          >
            {state.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default StateSelector;
