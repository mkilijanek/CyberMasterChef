export type PreTriageHeuristic = {
  id: string;
  description: string;
  pattern: RegExp;
};

export const PRETRIAGE_HEURISTICS: PreTriageHeuristic[] = [
  { id: "ps_encoded_command", description: "PowerShell encoded command usage", pattern: new RegExp("powershell\\s+-enc(odedcommand)?", "i") },
];
