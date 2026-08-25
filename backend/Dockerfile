FROM oven/bun:1

WORKDIR /app

COPY package.json ./

RUN bun install

COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./

RUN bunx prisma generate

EXPOSE 4000

CMD ["bun", "run", "start"]