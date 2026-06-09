#Build the widget bundle
FROM node:20-alpine AS widget-builder
WORKDIR /widget
COPY packages/widget/package.json ./
RUN npm install
COPY packages/widget/src/ ./src/
RUN npm run build

#Run the verification server
FROM node:20-alpine
WORKDIR /app
COPY packages/server/package.json ./
RUN npm install --omit=dev
COPY packages/server/src/ ./src/
# Copy the built widget dist into the server container
COPY --from=widget-builder /widget/dist/ ./dist/

# Default port — overridden by PORT env var at runtime (e.g. HF Spaces sets PORT=7860)
ENV PORT=3000
EXPOSE 3000

# Shell form so ${PORT} expands at container runtime
HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost:${PORT}/health || exit 1

CMD ["node", "src/index.js"]
