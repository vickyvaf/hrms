FROM node:22-alpine AS builder

WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN npx prisma generate
RUN pnpm run build

FROM node:22-alpine AS runner

WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV production

COPY --from=builder /app ./

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
