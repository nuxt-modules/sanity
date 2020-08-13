---
title: Syntax highlighting
description: 'Access text, images, and other media with Nuxt and the Sanity headless CMS.'
category: Helpers
position: 12
---

This module exports a `groq` helper function to assist with GROQ syntax highlighting (a duplicate of [this package](https://github.com/sanity-io/sanity/tree/next/packages/groq)). Make sure to install [the VSCode extension](https://github.com/sanity-io/vscode-sanity) - and enjoy!

## Example

```vue
<script>
import { groq } from '@nuxtjs/sanity'

// In VS Code this will be highlighted
const query = groq`*[_type == "article"][0].title`
</script>
```
