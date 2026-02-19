#!/usr/bin/env python3
"""
Simple HTTP server for Sticky API
Run this on Raspberry Pi to serve API data to Processing

Usage:
    python3 server.py [port]
    
Default port: 8000
"""

import http.server
import socketserver
import json
import urllib.request
import urllib.parse
import sys
from urllib.error import URLError

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

# Your Supabase API endpoint
# You'll need to create a Supabase Edge Function or use REST API
SUPABASE_URL = "https://ldyfbencqiqldysevwoh.supabase.co"
SUPABASE_KEY = "sb_publishable_xsLaTKtlF06MArPyvw8Uqw_GRwN5iaf"

class StickyAPIHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api'):
            self.handle_api()
        else:
            # Serve static files
            super().do_GET()
    
    def handle_api(self):
        """Handle API requests"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.end_headers()
        
        try:
            # Fetch data from Supabase (you'll need to implement this)
            # For now, return sample data structure
            data = self.get_sticky_data()
            self.wfile.write(json.dumps(data).encode())
        except Exception as e:
            error_data = {"error": str(e)}
            self.wfile.write(json.dumps(error_data).encode())
    
    def get_sticky_data(self):
        """
        Fetch data from Supabase REST API
        Note: You may need to adjust this based on your Supabase setup
        """
        # This is a placeholder - you'll need to implement actual Supabase REST calls
        # Or use the api.html page and parse it
        
        # For now, return structure that matches what Processing expects
        return {
            "timestamp": "2024-01-01T00:00:00Z",
            "summary": {
                "total_check_ins": 0,
                "total_users": 0,
                "total_groups": 0,
                "active_days": 0
            },
            "rankings": {
                "top_users": [],
                "top_groups": []
            },
            "activity": {
                "daily": {},
                "recent_count": 0
            },
            "moods": {},
            "recent_check_ins": []
        }
    
    def log_message(self, format, *args):
        """Override to customize logging"""
        print(f"[{self.address_string()}] {format % args}")

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), StickyAPIHandler) as httpd:
        print(f"Sticky API Server running on port {PORT}")
        print(f"Access API at: http://localhost:{PORT}/api.html?format=json")
        print(f"For Processing: http://localhost:{PORT}/api.html?format=json")
        print("Press Ctrl+C to stop")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped")

