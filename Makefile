PRESENTON_FASTAPI = backend
PRESENTON_NEXTJS = frontend
PID_FILE = .dev-pids

dev:
	@echo "=== Starting Slidemaker ==="
	@# Load ANTHROPIC_API_KEY from script2ppt/.env
	@set -a; source .env; set +a; \
	\
	export APP_DATA_DIRECTORY=/tmp/slidemaker_data; \
	export TEMP_DIRECTORY=/tmp/presenton; \
	mkdir -p "$$APP_DATA_DIRECTORY" "$$TEMP_DIRECTORY"; \
	export USER_CONFIG_PATH="$$APP_DATA_DIRECTORY/userConfig.json"; \
	\
	python3 -c "import json,os; cfg={'LLM':'anthropic','ANTHROPIC_API_KEY':os.environ.get('ANTHROPIC_API_KEY',''),'IMAGE_PROVIDER':'gpt-image-1.5','OPENAI_API_KEY':os.environ.get('OPENAI_API_KEY',''),'DISABLE_IMAGE_GENERATION':False}; open(os.environ['USER_CONFIG_PATH'],'w').write(json.dumps(cfg))"; \
	echo "userConfig.json created at $$USER_CONFIG_PATH"; \
	\
	cleanup() { \
		echo ""; \
		echo "=== Shutting down ==="; \
		if [ -f $(PID_FILE) ]; then \
			while read pid; do \
				kill $$pid 2>/dev/null && echo "Killed PID $$pid"; \
			done < $(PID_FILE); \
			rm -f $(PID_FILE); \
		fi; \
		exit 0; \
	}; \
	trap cleanup INT TERM; \
	\
	echo "[1/3] Starting Presenton FastAPI (port 8000)..."; \
	(cd $(PRESENTON_FASTAPI) && uv run python server.py --port 8000 --reload true) & \
	echo $$! > $(PID_FILE); \
	\
	echo "[2/3] Starting Presenton Next.js (port 3000)..."; \
	(cd $(PRESENTON_NEXTJS) && npm run dev -- -H 127.0.0.1 -p 3000) & \
	echo $$! >> $(PID_FILE); \
	\
	echo "[3/3] Waiting for FastAPI to be ready..."; \
	ready=0; \
	for i in $$(seq 1 30); do \
		if curl -s http://localhost:8000/docs > /dev/null 2>&1; then \
			echo "FastAPI ready!"; \
			ready=1; \
			break; \
		fi; \
		sleep 2; \
	done; \
	if [ $$ready -eq 0 ]; then \
		echo "WARNING: FastAPI did not respond within 60s, starting bridge anyway..."; \
	fi; \
	\
	echo "Starting Slidemaker bridge (port 3001)..."; \
	node server.mjs & \
	echo $$! >> $(PID_FILE); \
	\
	echo ""; \
	echo "=== All services running ==="; \
	echo "  FastAPI:    http://localhost:8000"; \
	echo "  Next.js:    http://localhost:3000"; \
	echo "  Slidemaker: http://localhost:3001"; \
	echo "  Press Ctrl+C to stop all services"; \
	echo ""; \
	wait

stop:
	@echo "Stopping services..."
	@if [ -f $(PID_FILE) ]; then \
		while read pid; do \
			kill $$pid 2>/dev/null && echo "Killed PID $$pid"; \
		done < $(PID_FILE); \
		rm -f $(PID_FILE); \
	fi
	@# Also kill by port as fallback
	@for port in 8000 3000 3001; do \
		lsof -ti:$$port | xargs kill 2>/dev/null && echo "Killed process on port $$port" || true; \
	done
	@echo "Done."

clean: stop
	@rm -rf /tmp/slidemaker_data /tmp/presenton
	@echo "Cleaned temp directories."

.PHONY: dev stop clean
