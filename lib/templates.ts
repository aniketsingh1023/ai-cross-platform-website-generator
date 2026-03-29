export type FileSystemTree = Record<
  string,
  { file: { contents: string } } | { directory: FileSystemTree }
>;

// ---------------------------------------------------------------------------
// REACT (Vite + React)
// ---------------------------------------------------------------------------
const reactTemplate: FileSystemTree = {
  "package.json": {
    file: {
      contents: JSON.stringify(
        {
          name: "vite-react-app",
          private: true,
          version: "0.0.0",
          type: "module",
          scripts: {
            dev: "vite",
            build: "vite build",
            preview: "vite preview",
          },
          dependencies: {
            react: "^18.2.0",
            "react-dom": "^18.2.0",
          },
          devDependencies: {
            "@vitejs/plugin-react": "^4.0.0",
            vite: "^5.0.0",
          },
        },
        null,
        2
      ),
    },
  },
  "vite.config.js": {
    file: {
      contents: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`,
    },
  },
  "index.html": {
    file: {
      contents: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
    },
  },
  src: {
    directory: {
      "main.jsx": {
        file: {
          contents: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
        },
      },
      "App.jsx": {
        file: {
          contents: `import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((c) => c + 1)}>
          Count is {count}
        </button>
      </div>
      <p>Edit <code>src/App.jsx</code> and save to test HMR.</p>
    </div>
  );
}

export default App;
`,
        },
      },
      "App.css": {
        file: {
          contents: `#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.app {
  font-family: Inter, system-ui, sans-serif;
}

.card {
  padding: 2em;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  color: #ffffff;
  cursor: pointer;
  transition: border-color 0.25s;
}

button:hover {
  border-color: #646cff;
}
`,
        },
      },
    },
  },
};

// ---------------------------------------------------------------------------
// NEXTJS
// ---------------------------------------------------------------------------
const nextjsTemplate: FileSystemTree = {
  "package.json": {
    file: {
      contents: JSON.stringify(
        {
          name: "nextjs-app",
          private: true,
          version: "0.0.0",
          scripts: {
            dev: "next dev",
            build: "next build",
            start: "next start",
          },
          dependencies: {
            next: "^14.0.0",
            react: "^18.2.0",
            "react-dom": "^18.2.0",
          },
        },
        null,
        2
      ),
    },
  },
  "next.config.js": {
    file: {
      contents: `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
`,
    },
  },
  pages: {
    directory: {
      "index.js": {
        file: {
          contents: `export default function Home() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Welcome to Next.js</h1>
      <p>Edit <code>pages/index.js</code> to get started.</p>
    </div>
  );
}
`,
        },
      },
      "_app.js": {
        file: {
          contents: `import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
`,
        },
      },
    },
  },
  styles: {
    directory: {
      "globals.css": {
        file: {
          contents: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  font-family: Inter, system-ui, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}
`,
        },
      },
    },
  },
};

// ---------------------------------------------------------------------------
// EXPRESS
// ---------------------------------------------------------------------------
const expressTemplate: FileSystemTree = {
  "package.json": {
    file: {
      contents: JSON.stringify(
        {
          name: "express-app",
          private: true,
          version: "0.0.0",
          scripts: {
            start: "node index.js",
          },
          dependencies: {
            express: "^4.18.2",
          },
        },
        null,
        2
      ),
    },
  },
  "index.js": {
    file: {
      contents: `const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.listen(PORT, () => {
  console.log(\`Server is running on http://localhost:\${PORT}\`);
});
`,
    },
  },
};

// ---------------------------------------------------------------------------
// VUE (Vite + Vue)
// ---------------------------------------------------------------------------
const vueTemplate: FileSystemTree = {
  "package.json": {
    file: {
      contents: JSON.stringify(
        {
          name: "vite-vue-app",
          private: true,
          version: "0.0.0",
          type: "module",
          scripts: {
            dev: "vite",
            build: "vite build",
            preview: "vite preview",
          },
          dependencies: {
            vue: "^3.3.0",
          },
          devDependencies: {
            "@vitejs/plugin-vue": "^4.0.0",
            vite: "^5.0.0",
          },
        },
        null,
        2
      ),
    },
  },
  "vite.config.js": {
    file: {
      contents: `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});
`,
    },
  },
  "index.html": {
    file: {
      contents: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`,
    },
  },
  src: {
    directory: {
      "main.js": {
        file: {
          contents: `import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
`,
        },
      },
      "App.vue": {
        file: {
          contents: `<script setup>
import { ref } from 'vue';

const count = ref(0);
</script>

<template>
  <div class="app">
    <h1>Vite + Vue</h1>
    <div class="card">
      <button @click="count++">Count is {{ count }}</button>
    </div>
    <p>Edit <code>src/App.vue</code> and save to test HMR.</p>
  </div>
</template>

<style scoped>
.app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  font-family: Inter, system-ui, sans-serif;
}

.card {
  padding: 2em;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  background-color: #1a1a1a;
  color: #ffffff;
  cursor: pointer;
  transition: border-color 0.25s;
}

button:hover {
  border-color: #42b883;
}
</style>
`,
        },
      },
    },
  },
};

// ---------------------------------------------------------------------------
// ANGULAR (simplified vanilla-JS setup)
// ---------------------------------------------------------------------------
const angularTemplate: FileSystemTree = {
  "package.json": {
    file: {
      contents: JSON.stringify(
        {
          name: "angular-lite-app",
          private: true,
          version: "0.0.0",
          scripts: {
            dev: "npx serve .",
          },
          devDependencies: {
            serve: "^14.2.0",
          },
        },
        null,
        2
      ),
    },
  },
  "index.html": {
    file: {
      contents: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Angular-Lite App</title>
    <link rel="stylesheet" href="src/style.css" />
  </head>
  <body>
    <div id="app"></div>
    <script src="src/app.js"></script>
  </body>
</html>
`,
    },
  },
  src: {
    directory: {
      "app.js": {
        file: {
          contents: `// Simple component-based vanilla JS app
class AppComponent {
  constructor(rootEl) {
    this.root = rootEl;
    this.count = 0;
    this.render();
  }

  render() {
    this.root.innerHTML = \`
      <div class="app">
        <h1>Angular-Lite App</h1>
        <div class="card">
          <button id="counter">Count is \${this.count}</button>
        </div>
        <p>Edit <code>src/app.js</code> to get started.</p>
      </div>
    \`;

    this.root.querySelector('#counter').addEventListener('click', () => {
      this.count++;
      this.render();
    });
  }
}

new AppComponent(document.getElementById('app'));
`,
        },
      },
      "style.css": {
        file: {
          contents: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Inter, system-ui, sans-serif;
}

.app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.card {
  padding: 2em;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  background-color: #1a1a1a;
  color: #ffffff;
  cursor: pointer;
  transition: border-color 0.25s;
}

button:hover {
  border-color: #dd0031;
}
`,
        },
      },
    },
  },
};

// ---------------------------------------------------------------------------
// HONO
// ---------------------------------------------------------------------------
const honoTemplate: FileSystemTree = {
  "package.json": {
    file: {
      contents: JSON.stringify(
        {
          name: "hono-app",
          private: true,
          version: "0.0.0",
          scripts: {
            start: "node index.js",
          },
          dependencies: {
            hono: "^4.0.0",
            "@hono/node-server": "^1.4.0",
          },
        },
        null,
        2
      ),
    },
  },
  "index.js": {
    file: {
      contents: `const { Hono } = require('hono');
const { serve } = require('@hono/node-server');

const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello from Hono!');
});

app.get('/api/hello', (c) => {
  return c.json({ message: 'Hello, World!' });
});

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(\`Server is running on http://localhost:\${info.port}\`);
});
`,
    },
  },
};

// ---------------------------------------------------------------------------
// Template map & accessor
// ---------------------------------------------------------------------------
const templates: Record<string, FileSystemTree> = {
  REACT: reactTemplate,
  NEXTJS: nextjsTemplate,
  EXPRESS: expressTemplate,
  VUE: vueTemplate,
  ANGULAR: angularTemplate,
  HONO: honoTemplate,
};

/**
 * Returns a WebContainer-compatible FileSystemTree for the given template name.
 * Throws if the template is not found.
 */
export function getTemplateFiles(template: string): FileSystemTree {
  const tree = templates[template.toUpperCase()];
  if (!tree) {
    throw new Error(
      `Unknown template "${template}". Available templates: ${Object.keys(templates).join(", ")}`
    );
  }
  return tree;
}
