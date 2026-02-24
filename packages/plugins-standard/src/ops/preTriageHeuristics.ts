export type PreTriageHeuristic = {
  id: string;
  description: string;
  pattern: RegExp;
};

export const PRETRIAGE_HEURISTICS: PreTriageHeuristic[] = [
  { id: "ps_encoded_command", description: "PowerShell encoded command usage", pattern: new RegExp("powershell\\s+-enc(odedcommand)?", "i") },
  { id: "ps_execution_policy_bypass", description: "PowerShell execution policy bypass", pattern: new RegExp("-executionpolicy\\s+bypass", "i") },
];
