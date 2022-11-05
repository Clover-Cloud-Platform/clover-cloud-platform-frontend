import * as React from "react";

import Editor from "@monaco-editor/react";

export default function CodeEditor() {
  return (
    <Editor
      theme={"vs-dark"}
      height="100%"
      defaultLanguage="python"
      options={{
        minimap: {
          enabled: false,
        },
        fontSize: 13,
        fontFamily:
          "Menlo, Cascadia Code, Consolas, Liberation Mono, monospace",
      }}
    />
  );
}
