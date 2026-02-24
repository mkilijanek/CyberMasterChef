# Task 21 Progress: Basic Pre-Triage

Updated: 2026-02-24

## Objective

Track incremental delivery steps for Task 21 (`forensic.basicPreTriage`).

## Queue 1/3 (50 stages)

- [x] Stage 01: `ps_encoded_command` - PowerShell encoded command usage
- [x] Stage 02: `ps_execution_policy_bypass` - PowerShell execution policy bypass
- [x] Stage 03: `cmd_from_powershell` - PowerShell launching cmd
- [x] Stage 04: `mshta_invocation` - MSHTA execution chain
- [x] Stage 05: `regsvr32_silent` - Regsvr32 silent registration
- [x] Stage 06: `rundll32_launch` - Rundll32 execution chain
- [x] Stage 07: `wmic_process_create` - WMIC process creation
- [x] Stage 08: `bitsadmin_transfer` - BITSAdmin transfer pattern
- [x] Stage 09: `certutil_decode` - Certutil decode or urlcache usage
- [x] Stage 10: `schtasks_create` - Scheduled task persistence
- [x] Stage 11: `at_job_create` - Legacy at job persistence
- [x] Stage 12: `reg_run_key` - Registry Run key persistence
- [x] Stage 13: `reg_runonce_key` - Registry RunOnce persistence
- [x] Stage 14: `wscript_launch` - WSH script execution via wscript
- [x] Stage 15: `cscript_launch` - WSH script execution via cscript
- [x] Stage 16: `hta_file_drop` - HTA payload reference
- [x] Stage 17: `js_file_drop` - JavaScript payload reference
- [x] Stage 18: `vbs_file_drop` - VBScript payload reference
- [x] Stage 19: `ps1_file_drop` - PowerShell script reference
