# Stage 1: Build the widget bundle
FROM node:20-alpine AS widget-builder
WORKDIR /widget
COPY packages/widget/package.json ./
RUN npm install
COPY packages/widget/src/ ./src/
RUN npm run build

# Stage 2: Run the verification server
FROM node:20-alpine
WORKDIR /app
COPY packages/server/package.json ./
RUN npm install --omit=dev
COPY packages/server/src/ ./src/
# Copy the built widget dist into the server container
COPY --from=widget-builder /widget/dist/ ./dist/

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/index.js"]
