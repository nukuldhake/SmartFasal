#!/usr/bin/env python3
"""
Startup script for Smart Fasal FastAPI Backend
"""

import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # Get configuration from environment variables
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    log_level = os.getenv("LOG_LEVEL", "info")
    
    print("Starting Smart Fasal FastAPI Backend...")
    print(f"Server: http://{host}:{port}")
    print(f"Reload: {reload}")
    print(f"Log Level: {log_level}")
    print("Starting server...")
    
    # Start the server
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload,
        log_level=log_level,
        access_log=True
    )
