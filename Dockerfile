# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl python3 make g++ \
    cairo-dev pango-dev jpeg-dev libpng-dev giflib-dev

WORKDIR /app

# Install pnpm 9 (matches local version)
RUN npm install -g pnpm@9.15.9

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm 9 (matches local version)
RUN npm install -g pnpm@9.15.9

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl python3 make g++ \
    cairo-dev pango-dev jpeg-dev libpng-dev giflib-dev
WORKDIR /app
RUN npm install -g pnpm@9.15.9

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN pnpm prisma generate

# Build the Next.js app
# Next.js standalone output requires this
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm run build

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Install runtime dependencies for canvas and prisma
RUN apk add --no-cache \
    openssl \
    cairo \
    pango \
    jpeg \
    libpng \
    giflib \
    fontconfig \
    ttf-dejavu \
    font-noto

RUN fc-cache -fv

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create uploads directory
RUN mkdir -p public/uploads && chown -R nextjs:nodejs public/uploads

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy the standalone build and static files
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
CMD ["node", "server.js"]
