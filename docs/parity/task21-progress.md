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
- [x] Stage 20: `dll_file_drop` - DLL payload reference
- [x] Stage 21: `scr_file_drop` - Screensaver payload reference
- [x] Stage 22: `bat_file_drop` - Batch payload reference
- [x] Stage 23: `cmd_file_drop` - CMD payload reference
- [x] Stage 24: `zip_archive_drop` - ZIP archive payload
- [x] Stage 25: `iso_archive_drop` - ISO archive payload
- [x] Stage 26: `img_archive_drop` - IMG disk image payload
- [x] Stage 27: `rar_archive_drop` - RAR archive payload
- [x] Stage 28: `7z_archive_drop` - 7z archive payload
- [x] Stage 29: `powershell_downloadstring` - PowerShell DownloadString usage
- [x] Stage 30: `powershell_invoke_expression` - PowerShell Invoke-Expression usage
- [x] Stage 31: `frombase64string_usage` - Base64 decode in script
- [x] Stage 32: `iex_alias_usage` - IEX alias usage
- [x] Stage 33: `new_object_net_webclient` - WebClient download primitive
- [x] Stage 34: `invoke_webrequest_usage` - Invoke-WebRequest usage
- [x] Stage 35: `invoke_restmethod_usage` - Invoke-RestMethod usage
- [x] Stage 36: `curl_usage` - Curl command usage
- [x] Stage 37: `wget_usage` - Wget command usage
- [x] Stage 38: `http_plain_download` - Plain HTTP URL present
- [x] Stage 39: `pastebin_reference` - Pastebin indicator
- [x] Stage 40: `github_raw_reference` - GitHub raw payload indicator
- [x] Stage 41: `telegram_api_reference` - Telegram API indicator
- [x] Stage 42: `discord_cdn_reference` - Discord CDN indicator
- [x] Stage 43: `tor_onion_reference` - Onion service indicator
- [x] Stage 44: `base64_blob_long` - Long base64-like blob
- [x] Stage 45: `hex_blob_long` - Long hex-like blob
- [x] Stage 46: `url_shortener_bitly` - URL shortener bitly indicator
- [x] Stage 47: `url_shortener_tinyurl` - URL shortener tinyurl indicator
- [x] Stage 48: `lolbin_makecab` - LOLBIN makecab usage
- [x] Stage 49: `lolbin_expand` - LOLBIN expand usage
- [x] Stage 50: `lolbin_msbuild` - LOLBIN msbuild usage

## Queue 2/3 (50 stages)
- [x] Stage 051: `suspicious_tld_ru` - Suspicious RU TLD reference
- [x] Stage 052: `suspicious_tld_su` - Suspicious SU TLD reference
