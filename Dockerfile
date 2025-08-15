FROM --platform=linux/amd64 oven/bun:1

WORKDIR /app

COPY . .

RUN if [ ! -d "build" ]; then \
    bun install && \
    echo 'const nextConfig = { distDir: "build", trailingSlash: true, eslint: { ignoreDuringBuilds: true }, typescript: { ignoreBuildErrors: true } }; module.exports = nextConfig;' > next.config.js && \
    bun run build; \
    fi

RUN bun install --production

EXPOSE 3000

CMD ["bun", "start"]