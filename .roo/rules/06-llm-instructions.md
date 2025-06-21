# RooCode: LLM Instruction Access

## 1. Overview

This document outlines how to access LLM-specific instructions and documentation for various libraries and frameworks used within this project. These instructions are tailored for LLM consumption to provide concise and relevant information.

## 2. Accessing Library LLM Instructions

### 2.1. Bits UI

To access LLM instructions for the `bits-ui` library, use the `fetch` tool with the following URL:

`https://bits-ui.com/llms.txt`

Example usage:
```xml
<use_mcp_tool>
<server_name>fetch</server_name>
<tool_name>fetch</tool_name>
<arguments>
{
  "url": "https://bits-ui.com/llms.txt"
}
</arguments>
</use_mcp_tool>
```

### 2.2. Zag.js

To access LLM instructions for the `zagjs` library, use the `fetch` tool with the following URL:

`https://zagjs.com/llms.txt`

Example usage:
```xml
<use_mcp_tool>
<server_name>fetch</server_name>
<tool_name>fetch</tool_name>
<arguments>
{
  "url": "https://zagjs.com/llms.txt"
}
</arguments>
</use_mcp_tool>
```

### 2.3. Svelte 5 and SvelteKit

To access the latest LLM-specific documentation for Svelte 5 and SvelteKit, use the `svelte-doc-khromov` MCP server.

First, list available sections:
```xml
<use_mcp_tool>
<server_name>svelte-doc-khromov</server_name>
<tool_name>list_sections</tool_name>
<arguments>{}</arguments>
</use_mcp_tool>
```

Then, retrieve specific documentation sections by title or path:
```xml
<use_mcp_tool>
<server_name>svelte-doc-khromov</server_name>
<tool_name>get_documentation</tool_name>
<arguments>
{
  "section": "$state"
}
</arguments>
</use_mcp_tool>