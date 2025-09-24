---
ShareButtons:
- linkedin
- whatsapp
- twitter
ShowReadingTime: true
date: "2023-06-25T20:53:12+07:00"
draft: false
tags:
- vscode
- json
- setting
title: Setting Json Vscode
---

**vscode beautiful setup settings.json**

```go
{
  "workbench.sideBar.location": "right",
  "workbench.iconTheme": "material-icon-theme",
  "workbench.colorTheme": "Monokai Pro",
  "git.suggestSmartCommit": false,
  "redhat.telemetry.enabled": true,
  "terminal.integrated.cursorBlinking": true,
  "editor.cursorBlinking": "expand",
  "editor.fontFamily": "Cascadia Code, monospace",
  "editor.fontLigatures": true,
  "editor.fontSize": 12.5,
  "editor.formatOnPaste": true,
  "editor.formatOnSave": true,
  "editor.guides.bracketPairs": true,
  "editor.renderWhitespace": "all",
  "editor.semanticHighlighting.enabled": true,
  "editor.snippetSuggestions": "top",
  "editor.stickyScroll.enabled": true,
  "editor.suggestSelection": "first",
  "editor.tabSize": 2,
  "editor.wordWrap": "wordWrapColumn",
  "editor.accessibilitySupport": "off",
  "editor.bracketPairColorization.enabled": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  },
  "explorer.confirmDelete": false,
  "explorer.confirmDragAndDrop": false,
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 500,
  "files.exclude": {
    "**/*.js.map": {
      "when": "$(basename)"
    },
    "**/node_modules": false
  },
  "eslint.alwaysShowStatus": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "emmet.includeLanguages": {
    "markdown": "html",
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "emmet.syntaxProfiles": {
    "javascript": "html",
    "typescript": "html"
  },
  "emmet.showSuggestionsAsSnippets": true,
  "emmet.triggerExpansionOnTab": true,
  "[html]": {
    "editor.defaultFormatter": "vscode.html-language-features",
    "editor.formatOnSave": true
  },
  "[javascript, javascriptreact, typescript, scss, jsonc]": {
    "editor.formatOnSave": false
  },
  "liveSassCompile.settings.formats": [
    {
      "format": "expanded",
      "extensionName": ".css",
      "savePath": "~/../css/"
    },
    {
      "extensionName": ".min.css",
      "format": "compressed",
      "savePath": "~/../css/"
    }
  ],
  "autoprefixer.options": {
    "browsers": [
      "last 4 versions",
      "ie >= 9",
      "> 5%"
    ]
  },
  "background.windowBackgrounds": [
    "/home/kidtz/Pictures/Wallpapers/wallpaperflare.com_wallpaper.jpg"
  ],
  "background.backgroundBlur": [
    "80",
    "0",
    "0",
    "0"
  ],
  "background.backgroundOpacity": [
    0.83,
    0.9,
    0.9,
    0.9
  ]
}
```