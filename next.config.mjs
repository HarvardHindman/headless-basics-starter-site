/** @type {import('next').NextConfig} */
import withBundleAnalyzer from "@next/bundle-analyzer";
import webpack from "webpack"; // ✅ Fixed Import

const withBundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const cspDirective = [
  "default-src 'self';",
  "script-src 'self' https://www.gstatic.com https://vercel.live https://www.google.com https://www.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com 'unsafe-inline' 'unsafe-eval';",
  "img-src 'self' data: https://media.umbraco.io https://assets.vercel.com https://www.googletagmanager.com https://www.google-analytics.com https://cdn.sanity.io https://placehold.co;",
  "font-src 'self' https://fonts.gstatic.com;",
  "connect-src 'self' https://vercel.live https://www.google.com https://maps.googleapis.com https://media.umbraco.io https://www.googletagmanager.com https://www.google-analytics.com;",
  "style-src 'self' 'unsafe-inline';",
  "frame-src 'self' https://form.jotform.com https://www.google.com https://www.youtube.com https://youtube.com",
];

const restHeaders = { // ✅ Moved above nextConfig
  "Api-Version": "2",
  "Umb-Project-Alias": process.env.UMBRACO_PROJECT_ALIAS,
  "Api-Key": process.env.UMBRACO_API_KEY,
  "Accept-Language": "en-US",
  "Content-Type": "application/json",
};

const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  transpilePackages: ['@conversiondigital/headless-basics-data', '@conversiondigital/headless-basics-components'],
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "media.umbraco.io" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "daisyui.com" },
      { protocol: "https", hostname: "images.ctfassets.net" },
      { protocol: "https", hostname: "assets-au-01.kc-usercontent.com" },
      { protocol: "https", hostname: "api.lorem.space" },
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
  experimental: {
    nextScriptWorkers: false,
  },
  async redirects() {
    return [];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: cspDirective.join(" ") },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=()" },
        ],
      },
    ];
  },
  env: {
    NEXT_PUBLIC_CMS_VARIANT: process.env.NEXT_PUBLIC_CMS_VARIANT,
  },

  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      loader: "ts-loader",
      include: [
        /node_modules\/@conversiondigital\/headless-basics-components/,
        /node_modules\/@conversiondigital\/headless-basics-data/,
      ],
      options: {
        transpileOnly: true, // Prevent full type-checking for performance
      },
    });

    config.module.rules.push({
      test: /\.(ttf|otf|eot|woff|woff2)$/,
      type: "asset/resource",
      generator: { filename: "static/fonts/[hash][ext][query]" },
    });

    config.module.rules.unshift({
      test: /sanity-schema\.ts$/,
      use: 'ignore-loader',
    });
    
    config.plugins.push(
      new webpack.IgnorePlugin({
        // match "anything…/sanity-schema.ts" at the end of the request string
        resourceRegExp: /.*[\/\\]sanity-schema\.ts$/
      }))
    
    config.module.rules.unshift({
      test: /sanityCommonSchema\.ts$/,
      use: 'ignore-loader',
    });
    
    config.plugins.push(
      new webpack.IgnorePlugin({
        // match "anything…/sanity-schema.ts" at the end of the request string
        resourceRegExp: /.*[\/\\]sanityCommonSchema\.ts$/
      }))
    
    
      
    // Added IgnorePlugin to ignore .xml and .txt files
    config.plugins.push(
      new webpack.IgnorePlugin({
        checkResource(resource) {
          // Ignore .prompt or .example files
          if (/\.(prompt|example)$/.test(resource)) {
            return true;
          }
    
          // Ignore anything in **/variants/data/node_modules
          if (/[/\\]variants[/\\]data[/\\]node_modules[/\\]/.test(resource)) {
            return true;
          }
    
          return false;
        },
      })
    );
    

    // ✅ Fixed Ignore Plugin (Corrected push method) -- BELOW WAS RELATED TO SLICK SLIDER MISSING ITEMS
    // config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /ajax-loader\.gif$/ }));
    // config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /\.eot$/ }));
    // config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /\.woff$/ }));
    // config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /\.ttf$/ }));
    // config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /\.svg$/ }));
    

    config.ignoreWarnings = [
      {
        module: /@conversiondigital\/headless-basics-components/,
        message: /Can't resolve 'theme\/.*\/components'/, // ✅ Matches all themes
      },
      {
        module: /@conversiondigital\/headless-basics-data/,
        message: /Can't resolve 'theme\/.*\/components'/, // ✅ Matches missing theme components
      },
      {
        module: /@conversiondigital\/headless-basics-data/,
        message: /Can't resolve '@conversiondigital\/headless-basics-components\/src\/theme\/.*\/components'/, // ✅ Matches theme imports
      },
      {
        module: /@conversiondigital\/headless-basics-data/,
        message: /Can't resolve 'graphqlDataService.ts'/, // ✅ Matches missing GraphQL service imports
      },
      {
        module: /@conversiondigital\/headless-basics-components/,
        message: /Can't resolve/,
      },
      {
        module: /headless-basics-data/,
        message: /Can't resolve/,
      },
      {
        module: /headless-data-lib\/.*/, 
        message: /Can't resolve/,
      },
      {
        module: /headless-basics-components\/.*/, 
        message: /Can't resolve/,
      }
    ];
    

    return config;
  },
};

export default withBundleAnalyzerConfig(nextConfig);
