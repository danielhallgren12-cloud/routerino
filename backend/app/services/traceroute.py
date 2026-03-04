import subprocess
import re
import platform
import requests
from typing import List, Dict, Optional

geo_cache: Dict[str, Dict] = {}

def get_geoip_batch(ips: List[str]) -> Dict[str, Dict]:
    """Get geo data for multiple IPs using batch API."""
    valid_ips = []
    results = {}
    
    for ip in ips:
        if ip in geo_cache:
            results[ip] = geo_cache[ip]
            continue
        if ip and not ip.startswith("192.168") and not ip.startswith("10.") and not ip.startswith("172."):
            valid_ips.append(ip)
    
    if not valid_ips:
        return results
    
    try:
        batch_data = [{"query": ip, "fields": "lat,lon,city,countryCode,isp"} for ip in valid_ips]
        
        response = requests.post(
            "http://ip-api.com/batch",
            json=batch_data,
            timeout=10
        )
        
        if response.status_code == 200:
            batch_results = response.json()
            for i, item in enumerate(batch_results):
                if i < len(valid_ips):
                    ip = valid_ips[i]
                    if item.get("lat"):
                        geo_data = {
                            "country": item.get("countryCode", ""),
                            "city": item.get("city", ""),
                            "lat": item.get("lat"),
                            "lng": item.get("lon"),
                            "isp": item.get("isp", "")
                        }
                        geo_cache[ip] = geo_data
                        results[ip] = geo_data
                    else:
                        results[ip] = {"country": "", "city": "", "lat": None, "lng": None, "isp": ""}
    
    except Exception:
        pass
    
    return results

def run_traceroute(destination: str, max_hops: int = 30) -> List[Dict]:
    """Run traceroute to destination and return hop data."""
    hops = []
    ip_list = []
    
    system = platform.system()
    
    try:
        if system == "Windows":
            cmd = ["tracert", "-4", "-h", str(max_hops), "-w", "300", "-d", destination]
        else:
            cmd = ["traceroute", "-4", "-m", str(max_hops), "-n", destination]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=20
        )
        
        output = result.stdout
        
        lines = output.split("\n")
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            parts = line.split()
            if not parts or not parts[0].isdigit():
                continue
            
            hop_num = int(parts[0])
            
            ip_match = re.search(r"\[?(\d+\.\d+\.\d+\.\d+)\]?", line)
            ip = ip_match.group(1) if ip_match else None
            
            if ip and ip != "*":
                ip_list.append(ip)
            
            hostname_match = re.search(r"([a-zA-Z0-9][-a-zA-Z0-9.]+)", line)
            hostname = None
            if hostname_match:
                potential_hostname = hostname_match.group(1)
                if "." in potential_hostname and not potential_hostname[0].isdigit():
                    hostname = potential_hostname
            
            rtt_matches = re.findall(r"(\d+)\s*ms", line)
            rtt = float(rtt_matches[0]) if rtt_matches else None
            
            ip_val = ip if ip else "*"
            
            if ip_val != "*":
                hop_data = {
                    "hop": hop_num,
                    "ip": ip_val,
                    "hostname": hostname,
                    "isp": None,
                    "country": None,
                    "city": None,
                    "lat": None,
                    "lng": None,
                    "rtt": rtt
                }
            else:
                hop_data = {
                    "hop": hop_num,
                    "ip": "*",
                    "hostname": hostname,
                    "isp": None,
                    "country": None,
                    "city": None,
                    "lat": None,
                    "lng": None,
                    "rtt": rtt
                }
            
            hops.append(hop_data)
        
        geo_results = get_geoip_batch(ip_list)
        
        for hop in hops:
            if hop.get("ip") and hop.get("ip") != "*":
                ip = hop["ip"]
                if ip in geo_results:
                    geo = geo_results[ip]
                    hop["isp"] = geo.get("isp")
                    hop["country"] = geo.get("country")
                    hop["city"] = geo.get("city")
                    hop["lat"] = geo.get("lat")
                    hop["lng"] = geo.get("lng")
                
    except subprocess.TimeoutExpired:
        pass
    except Exception as e:
        pass
    
    return [h for h in hops if h.get("ip") and h.get("ip") != "*" and h.get("lat")]
