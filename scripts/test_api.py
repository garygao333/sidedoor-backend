#!/usr/bin/env python3
"""
Test script to verify the API is working
"""

import requests
import json
import time

API_BASE = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{API_BASE}/health")
        print(f"Health check: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_search():
    """Test search functionality"""
    try:
        # Submit search
        search_data = {"q": "Dune Part Two 2024 1080p"}
        response = requests.post(f"{API_BASE}/ask", json=search_data)
        
        if response.status_code != 200:
            print(f"Search failed: {response.status_code}")
            return False
            
        job_data = response.json()
        job_id = job_data["job_id"]
        print(f"Search submitted: {job_id}")
        
        # Poll for results
        for i in range(10):  # Wait up to 10 seconds
            time.sleep(1)
            poll_response = requests.get(f"{API_BASE}/poll/{job_id}")
            
            if poll_response.status_code == 200:
                status = poll_response.json()
                print(f"Status: {status['status']}")
                
                if status['status'] in ['completed', 'failed', 'no_results']:
                    print(f"Final status: {json.dumps(status, indent=2)}")
                    return True
        
        print("Search timed out")
        return False
        
    except Exception as e:
        print(f"Search test failed: {e}")
        return False

def main():
    print("🧪 Testing SideDoor AI API...")
    
    # Test health
    if not test_health():
        print("❌ Health check failed")
        return
    
    print("✅ Health check passed")
    
    # Test search
    if test_search():
        print("✅ Search test passed")
    else:
        print("❌ Search test failed")

if __name__ == "__main__":
    main()
