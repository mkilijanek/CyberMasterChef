# C3 Contract Schema

Each operation compatibility contract uses the following structure:

```json
{
  "operationId": "string",
  "name": "string",
  "domain": "encodings-codecs|crypto-hash-kdf|compression-archive|date-time|data-formats|regex-text-advanced|network-protocol-parsers|forensic-malware-helper|misc-uncategorized",
  "inputTypes": ["string|bytes|json"],
  "outputType": "string|bytes|json",
  "argsSchema": [
    {
      "key": "string",
      "type": "string|number|boolean",
      "label": "string",
      "defaultValue": "serialized literal"
    }
  ],
  "deterministic": true,
  "errorTaxonomy": {
    "categories": ["INVALID_INPUT_TYPE|INVALID_ARGUMENT|EXECUTION_ERROR"],
    "examples": ["string"]
  },
  "notes": {
    "sourceFile": "string",
    "description": "string"
  }
}
```

This schema is designed to feed C4 parity matrix and C5 differential testing gates.
