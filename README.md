
- Node.js and npm

### Getting started

You can run locally in development mode with live reload:

```
npm run dev
```

Open http://localhost:8080 with your favorite browser to see your project.

```
.
├── public        # Static files
└── src
    ├── pages     # Next.js pages
    └── styles    # CSS files
```

### Customization

You can easily configure Next js Boilerplate. Please change the following file:

- `public/apple-touch-icon.png`, `public/favicon.ico`, `public/favicon-16x16.png` and `public/favicon-32x32.png`: your blog favicon, you can generate from https://favicon.io/favicon-converter/
- `src/styles/main.css`: your blog CSS file using Tailwind CSS

### Deploy to production

You can see the results locally in production mode with:

```
$ npm run build
$ npm run start
```

The generated HTML and CSS files are minified (built-in feature from Next js). It will also removed unused CSS from [Tailwind CSS](https://tailwindcss.com).

You can create an optimized production build with:

```
npm run build-prod
```

Now, your blog is ready to be deployed. All generated files are located at `dist` folder, which you can deploy with any hosting service.
