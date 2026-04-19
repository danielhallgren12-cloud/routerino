import subprocess
import re
import platform
import requests
from typing import List, Dict, Optional

geo_cache: Dict[str, Dict] = {}
GEO_CACHE_MAX_SIZE = 10000

def get_geoip_batch(ips: List[str]) -> Dict[str, Dict]:
    """Get geo data for multiple IPs using batch API."""
    global geo_cache
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
        batch_data = [{"query": ip, "fields": "lat,lon,city,countryCode,isp,as,asname"} for ip in valid_ips]

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
                        as_number = item.get("as", "")
                        as_name = item.get("asname", "")
                        asn = f"{as_number} - {as_name}" if as_number else ""

                        geo_data = {
                            "country": item.get("countryCode", ""),
                            "city": item.get("city", ""),
                            "lat": item.get("lat"),
                            "lng": item.get("lon"),
                            "isp": item.get("isp", ""),
                            "asn": asn
                        }
                        geo_cache[ip] = geo_data
                        results[ip] = geo_data
                        if len(geo_cache) > GEO_CACHE_MAX_SIZE:
                            oldest_keys = list(geo_cache.keys())[:1000]
                            for k in oldest_keys:
                                del geo_cache[k]
                    else:
                        results[ip] = {"country": "", "city": "", "lat": None, "lng": None, "isp": "", "asn": ""}

    except Exception:
        pass

    return results

def is_private_ip(ip: str) -> bool:
    """Check if IP is private/reserved."""
    if ip.startswith("10."):
        return True
    if ip.startswith("192.168."):
        return True
    if ip.startswith("172."):
        second_octet = int(ip.split(".")[1])
        if 16 <= second_octet <= 31:
            return True
    return False

def run_traceroute(destination: str, max_hops: int = 30, ip_version: str = "ipv4") -> List[Dict]:
    """Run traceroute to destination and return hop data."""
    hops = []
    ip_list = []

    system = platform.system()

    if ip_version == "ipv6":
        ip_flag = "-6"
    else:
        ip_flag = "-4"

    try:
        if system == "Windows":
            cmd = ["tracert", ip_flag, "-h", "20", "-w", "200", "-d", destination]
        else:
            cmd = ["traceroute", ip_flag, "-m", "20", "-n", "-T", destination]

        result = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
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

            ip_match = re.search(r"\[?((?:[a-fA-F0-9]{1,4}:){1,7}[a-fA-F0-9:]+|\d+\.\d+\.\d+\.\d+)\]?", line)
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
                    "asn": None,
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
                    "asn": None,
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
                    hop["asn"] = geo.get("asn")
                    hop["country"] = geo.get("country")
                    hop["city"] = geo.get("city")
                    hop["lat"] = geo.get("lat")
                    hop["lng"] = geo.get("lng")

        filtered = [h for h in hops if h.get("ip") and h.get("ip") != "*" and not is_private_ip(h.get("ip", ""))]

        for i, hop in enumerate(filtered, start=1):
            hop["hop"] = i

        return filtered

    except subprocess.TimeoutExpired:
        return []
    except Exception as e:
        return []
