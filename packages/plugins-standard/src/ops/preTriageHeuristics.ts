export type PreTriageHeuristic = {
  id: string;
  description: string;
  pattern: RegExp;
};

export const PRETRIAGE_HEURISTICS: PreTriageHeuristic[] = [
  { id: "ps_encoded_command", description: "PowerShell encoded command usage", pattern: new RegExp("powershell\\s+-enc(odedcommand)?", "i") },
  { id: "ps_execution_policy_bypass", description: "PowerShell execution policy bypass", pattern: new RegExp("-executionpolicy\\s+bypass", "i") },
  { id: "cmd_from_powershell", description: "PowerShell launching cmd", pattern: new RegExp("powershell.*cmd\\.exe", "i") },
  { id: "mshta_invocation", description: "MSHTA execution chain", pattern: new RegExp("mshta(\\.exe)?", "i") },
  { id: "regsvr32_silent", description: "Regsvr32 silent registration", pattern: new RegExp("regsvr32(\\.exe)?\\s+/s", "i") },
  { id: "rundll32_launch", description: "Rundll32 execution chain", pattern: new RegExp("rundll32(\\.exe)?", "i") },
  { id: "wmic_process_create", description: "WMIC process creation", pattern: new RegExp("wmic\\s+process\\s+call\\s+create", "i") },
  { id: "bitsadmin_transfer", description: "BITSAdmin transfer pattern", pattern: new RegExp("bitsadmin\\s+/transfer", "i") },
  { id: "certutil_decode", description: "Certutil decode or urlcache usage", pattern: new RegExp("certutil\\s+-(decode", "urlcache)|i") },
  { id: "schtasks_create", description: "Scheduled task persistence", pattern: new RegExp("schtasks\\s+/create", "i") },
  { id: "at_job_create", description: "Legacy at job persistence", pattern: new RegExp("\\bat\\s+\\d{1,2}:\\d{2}", "i") },
  { id: "reg_run_key", description: "Registry Run key persistence", pattern: new RegExp("\\\\currentversion\\\\run", "i") },
  { id: "reg_runonce_key", description: "Registry RunOnce persistence", pattern: new RegExp("\\\\currentversion\\\\runonce", "i") },
  { id: "wscript_launch", description: "WSH script execution via wscript", pattern: new RegExp("wscript(\\.exe)?", "i") },
  { id: "cscript_launch", description: "WSH script execution via cscript", pattern: new RegExp("cscript(\\.exe)?", "i") },
  { id: "hta_file_drop", description: "HTA payload reference", pattern: new RegExp("\\.hta\\b", "i") },
];
